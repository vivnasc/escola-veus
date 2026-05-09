/**
 * Scribe (ElevenLabs Speech-to-Text) — extrai timestamps por palavra de
 * um MP3. Usado para sync de letras Loranne com áudio.
 *
 * Custo: ~$0.40/h de áudio. Track de 4min ≈ $0.027.
 */

export type ScribeWord = {
  text: string;
  type?: "word" | "spacing" | "audio_event";
  start?: number;
  end?: number;
};

export type ScribeResponse = {
  language_code?: string;
  text?: string;
  words?: ScribeWord[];
};

/** Faz speech-to-text de uma URL de MP3 e devolve as palavras com timestamps. */
export async function scribeAudio(audioUrl: string, languageCode = "por"): Promise<ScribeWord[]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY ausente.");

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error(`Download MP3 ${audioRes.status} ${audioUrl}`);
  const audioBlob = await audioRes.blob();

  const form = new FormData();
  form.append("file", new File([audioBlob], "track.mp3", { type: "audio/mpeg" }));
  form.append("model_id", "scribe_v1");
  form.append("language_code", languageCode);
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "false");
  form.append("diarize", "false");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`ElevenLabs Scribe ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as ScribeResponse;
  return Array.isArray(data.words) ? data.words : [];
}

/**
 * Extrai apenas as palavras "speaking" (com timestamps válidos), ignorando
 * spacings e audio_events.
 */
export function speakingWordsOnly(words: ScribeWord[]): ScribeWord[] {
  return words.filter(
    (w) => w && w.type === "word" && typeof w.start === "number" && typeof w.end === "number" && w.text,
  );
}

// ─── Stanza alignment ────────────────────────────────────────────────────

/** Stanza com timestamps absolutos (segundos no áudio). */
export type TimedStanza = {
  text: string;
  startSec: number;
  endSec: number;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Alinha stanzas (texto da letra) com words (do Scribe) por matching
 * sequencial. Para cada stanza:
 *   1. Tokeniza texto em palavras normalizadas
 *   2. Procura sequência de words[] que melhor corresponde (in-order)
 *   3. startSec = primeira word match, endSec = última word match
 *
 * Tolerante a:
 *   - Vocais que não dizem exactamente o texto (Suno improvisa às vezes)
 *   - Palavras Scribe que erra ou junta
 *   - Stanzas com mais palavras do que cantadas (instrumentais entre)
 *
 * Fallback se < 50% das palavras dum stanza encontrarem match: devolve
 * timing por proporção do que conseguiu alinhar do anterior + duração
 * média.
 */
export function alignStanzasToWords(
  stanzas: string[],
  words: ScribeWord[],
  totalAudioSec: number,
): TimedStanza[] {
  const speaking = speakingWordsOnly(words);
  if (speaking.length === 0 || stanzas.length === 0) {
    // Fallback: distribuição uniforme
    return uniformDistribute(stanzas, totalAudioSec);
  }

  const wordList = speaking.map((w) => ({ ...w, norm: normalize(w.text) }));
  const result: TimedStanza[] = [];
  let cursor = 0; // índice na wordList

  for (let i = 0; i < stanzas.length; i++) {
    const stanza = stanzas[i];
    const tokens = normalize(stanza).split(" ").filter((t) => t.length > 1);
    if (tokens.length === 0) {
      result.push({ text: stanza, startSec: 0, endSec: 0 });
      continue;
    }

    // Procura a 1ª palavra da stanza a partir do cursor
    let stanzaStart = -1;
    let stanzaEnd = -1;
    let matched = 0;
    let tIdx = 0;
    for (let j = cursor; j < wordList.length && tIdx < tokens.length; j++) {
      if (wordList[j].norm === tokens[tIdx]) {
        if (stanzaStart < 0) stanzaStart = j;
        stanzaEnd = j;
        matched++;
        tIdx++;
      } else if (stanzaStart >= 0) {
        // Já começou — extende o end mas não exige consecutividade
        // (cantor pode esticar a frase com pausas/instrumentação).
      }
    }

    if (stanzaStart < 0 || matched < Math.ceil(tokens.length * 0.4)) {
      // Match fraco — usa fallback proporcional do que aconteceu antes
      const prevEnd = result.length > 0 ? result[result.length - 1].endSec : 0;
      const remainingStanzas = stanzas.length - i;
      const remainingTime = Math.max(0, totalAudioSec - 4 - prevEnd);
      const eachSec = remainingTime / Math.max(1, remainingStanzas);
      result.push({
        text: stanza,
        startSec: prevEnd,
        endSec: Math.min(prevEnd + eachSec, totalAudioSec - 2),
      });
      continue;
    }

    const startSec = wordList[stanzaStart].start!;
    const endSec = wordList[stanzaEnd].end!;
    result.push({ text: stanza, startSec, endSec });
    cursor = stanzaEnd + 1;
  }

  return result;
}

function uniformDistribute(stanzas: string[], totalAudioSec: number): TimedStanza[] {
  const buffer = 2; // 2s no início (intro)
  const tail = 2; // 2s no fim (fade out)
  const usable = Math.max(totalAudioSec - buffer - tail, 1);
  const each = usable / stanzas.length;
  return stanzas.map((text, i) => ({
    text,
    startSec: buffer + i * each,
    endSec: buffer + (i + 1) * each,
  }));
}
