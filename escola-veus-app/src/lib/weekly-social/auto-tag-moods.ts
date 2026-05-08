/**
 * Auto-tagger Claude — atribui 1-2 moods a cada track Loranne.
 *
 * Estratégia:
 *   1. Itera sobre LORANNE_AVAILABLE_ALBUMS × tracks com letras
 *   2. Em batches de 25, manda ao Claude: título + álbum + 8 versos top
 *   3. Claude devolve {moods, confidence, reason} por track
 *   4. Junta tudo num LoranneMoodsData
 *
 * Custo estimado: ~$0.10 para 121 tracks (5 batches Sonnet 4.6 com cache).
 */

import Anthropic from "@anthropic-ai/sdk";

import { ALL_LYRICS } from "@/lib/loranne";
import {
  LORANNE_AVAILABLE_ALBUMS,
  getAlbumTitle,
  getTrackTitle,
} from "@/data/weekly-social/weekly-rotation";
import {
  LORANNE_MOODS,
  MOOD_META,
  type LoranneMood,
  type LoranneMoodsData,
  type TrackMoodAssignment,
} from "@/data/weekly-social/loranne-moods";

const BATCH_SIZE = 25;

type TrackInput = {
  key: string;
  albumSlug: string;
  albumTitle: string;
  trackNumber: number;
  trackTitle: string;
  lyricsExcerpt: string;
};

function topVerses(lyrics: string, n: number): string[] {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l) && !/^\(.+\)$/.test(l));
  // Preferir versos com 25-70 chars (sweet spot do scoreLine).
  const sweet = lines.filter((l) => l.length >= 25 && l.length <= 70);
  return (sweet.length >= n ? sweet : lines).slice(0, n);
}

function gatherTracks(): TrackInput[] {
  const allowed = new Set(LORANNE_AVAILABLE_ALBUMS);
  const out: TrackInput[] = [];
  for (const [key, lyrics] of Object.entries(ALL_LYRICS)) {
    const [albumSlug, trackStr] = key.split("/");
    if (!albumSlug || !trackStr) continue;
    if (!allowed.has(albumSlug)) continue;
    const trackNumber = parseInt(trackStr, 10);
    if (!Number.isFinite(trackNumber)) continue;
    if (!lyrics.trim()) continue;
    out.push({
      key,
      albumSlug,
      albumTitle: getAlbumTitle(albumSlug),
      trackNumber,
      trackTitle: getTrackTitle(albumSlug, trackNumber),
      lyricsExcerpt: topVerses(lyrics, 8).join(" / "),
    });
  }
  return out;
}

function buildSystemPrompt(): string {
  const moodLines = LORANNE_MOODS
    .map((slug) => `- **${MOOD_META[slug].label}** (${slug}): ${MOOD_META[slug].paraQuem}. Vibe: ${MOOD_META[slug].vibe}.`)
    .join("\n");

  return `És o tagger oficial das playlists Loranne. A tua tarefa é atribuir 1-2 moods a cada track musical com base no título, álbum e excerto de letra.

# Os 7 moods Loranne

${moodLines}

# Regras

- Cada track recebe entre 1 e 2 moods (o primeiro é o primário, mais forte).
- "elevar" é para tracks que LEVANTAM quem está em baixo (anthem, gospel, libertação física/emocional). Não é para qualquer track positiva — é para tracks de elevação activa.
- "aterrar" é o oposto — voltar ao corpo, ficar quieto, terra.
- "acordar" é para tracks de despertar/automatismo — pergunta que abre o véu.
- "lembrar" é para tracks de memória ancestral, raiz, mãe, herança.
- "reunir-se" é para regresso a si, inteireza, unificação interior.
- "respirar" é para tracks de pausa, fôlego, calma — descansar.
- "atravessar" é para tracks de transição, limiar, despedida, passagem.

A letra é PT-PT (ou EN, mas tom português). Tracks com inglês têm o mesmo tom.

# Output

Para cada track, devolve {moods, confidence (0-1), reason (1 frase curta)}.
Sem preâmbulo. Sem markdown. JSON puro segundo o schema.`;
}

function buildBatchUserMessage(batch: TrackInput[]): string {
  const items = batch
    .map((t, i) =>
      `${i + 1}. ${t.key} | "${t.trackTitle}" — álbum ${t.albumTitle}\n   versos: ${t.lyricsExcerpt}`,
    )
    .join("\n\n");
  return `Atribui mood(s) a estas ${batch.length} tracks Loranne:\n\n${items}\n\nResponde com array JSON na MESMA ordem, com chave a indicar o trackKey.`;
}

type ClaudeAssignment = {
  trackKey: string;
  moods: LoranneMood[];
  confidence: number;
  reason: string;
};

async function tagBatch(client: Anthropic, batch: TrackInput[]): Promise<ClaudeAssignment[]> {
  const system = [
    {
      type: "text" as const,
      text: buildSystemPrompt(),
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: buildBatchUserMessage(batch) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trackKey: { type: "string" },
                  moods: {
                    type: "array",
                    items: { type: "string", enum: [...LORANNE_MOODS] },
                    maxItems: 2,
                  },
                  confidence: { type: "number" },
                  reason: { type: "string" },
                },
                required: ["trackKey", "moods", "confidence", "reason"],
                additionalProperties: false,
              },
            },
          },
          required: ["assignments"],
          additionalProperties: false,
        },
      },
    },
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude sem text block");
  const parsed = JSON.parse(textBlock.text) as { assignments: ClaudeAssignment[] };

  // Validação básica — Claude pode devolver mood inválido apesar do enum.
  const valid = parsed.assignments.filter((a) => {
    if (!a.trackKey || !Array.isArray(a.moods) || a.moods.length === 0) return false;
    return a.moods.every((m) => (LORANNE_MOODS as readonly string[]).includes(m));
  });
  return valid;
}

export async function autoTagAllLoranneTracks(): Promise<LoranneMoodsData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
  const client = new Anthropic({ apiKey });

  const tracks = gatherTracks();
  if (tracks.length === 0) {
    throw new Error("Sem tracks elegíveis (verifica LORANNE_AVAILABLE_ALBUMS).");
  }

  const data: LoranneMoodsData = {
    version: 1,
    tracks: {},
    lastAutoTagAt: new Date().toISOString(),
  };

  for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
    const batch = tracks.slice(i, i + BATCH_SIZE);
    const assignments = await tagBatch(client, batch);
    for (const a of assignments) {
      const assignment: TrackMoodAssignment = {
        moods: a.moods,
        confidence: Math.max(0, Math.min(1, a.confidence)),
        reason: a.reason.slice(0, 200),
        updatedAt: new Date().toISOString(),
        source: "auto",
      };
      data.tracks[a.trackKey] = assignment;
    }
  }

  return data;
}
