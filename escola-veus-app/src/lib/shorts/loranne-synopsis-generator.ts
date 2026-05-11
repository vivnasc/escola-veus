/**
 * Synopsis Loranne — 1 linha que explica do que se trata a faixa.
 *
 * Claude lê a letra completa e devolve uma frase de 18-30 palavras a
 * dizer "este texto é sobre…". Usado na linha "Sobre" das captions
 * para que quem encontra o post fora da bolha entenda imediatamente.
 *
 * Cache em Supabase course-assets/loranne-synopsis-cache/<sha1>.json
 * (chave = sha1 das letras). Subsequentes /plan dão hit, sem custo.
 */

import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = "course-assets";

export type SynopsisInput = {
  lyrics: string;
  trackTitle: string;
  albumTitle: string;
  lang?: "PT" | "EN";
};

const SYSTEM = `És uma editora de música contemplativa moçambicana. Lês letras de canções e devolves UMA frase de síntese — 18-30 palavras em PT-PT — que explica do que se trata, sem floreado.

Regras:
- Foco no tema central, não no estilo musical
- Evita: "esta canção…", "o tema…", "a artista…" (redundante)
- Evita morais/lições, vocabulário New Age
- PT de Portugal/Moçambique, nunca brasileiro
- PROIBIDO: travessões longos "—" e "–" (tique IA). Usa vírgula ou ponto.
- Devolve APENAS o JSON do schema, sem markdown nem preâmbulo`;

function buildUserMessage(input: SynopsisInput): string {
  const langInfo = input.lang === "EN" ? "(letra em inglês)" : "(letra em português)";
  return `Faixa: ${input.trackTitle}
Álbum: ${input.albumTitle} ${langInfo}

LETRA:
${input.lyrics}

Devolve um JSON com:
- synopsis: 1 frase de 18-30 palavras a explicar do que se trata. Deve poder ler-se isolada e fazer sentido para quem nunca ouviu Loranne.`;
}

function cacheKey(lyrics: string, trackTitle: string): string {
  return createHash("sha1").update(`${trackTitle}\n---\n${lyrics}`).digest("hex").slice(0, 16);
}

function cachePath(key: string): string {
  return `loranne-synopsis-cache/${key}.json`;
}

async function readCache(key: string): Promise<string | null> {
  if (!SUPABASE_URL) return null;
  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${cachePath(key)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  try {
    const j = (await r.json()) as { synopsis?: string };
    return typeof j.synopsis === "string" && j.synopsis.trim() ? j.synopsis : null;
  } catch {
    return null;
  }
}

async function writeCache(key: string, synopsis: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin.storage.from(BUCKET).upload(
    cachePath(key),
    JSON.stringify({ synopsis, savedAt: new Date().toISOString() }),
    { contentType: "application/json", upsert: true },
  );
}

/** Devolve synopsis (cache → Claude). Lança Error se Claude falhar. */
export async function generateLoranneSynopsis(input: SynopsisInput): Promise<string> {
  if (!input.lyrics || !input.lyrics.trim()) {
    throw new Error("Synopsis: lyrics vazias.");
  }
  const key = cacheKey(input.lyrics, input.trackTitle);
  const cached = await readCache(key);
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    system: [
      {
        type: "text" as const,
        text: SYSTEM,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(input) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: { synopsis: { type: "string" } },
          required: ["synopsis"],
          additionalProperties: false,
        },
      },
    },
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude sem text block");
  const parsed = JSON.parse(textBlock.text) as { synopsis?: string };
  const synopsis = typeof parsed.synopsis === "string" ? parsed.synopsis.trim() : "";
  if (!synopsis) throw new Error("Synopsis vazia.");

  // Fire-and-forget — não bloqueia se cache write falhar.
  writeCache(key, synopsis).catch(() => undefined);
  return synopsis;
}
