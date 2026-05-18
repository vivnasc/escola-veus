// Shared core para gerar pacote SEO YouTube (longos / funil / shorts).
//
// Cada endpoint passa o seu próprio system + user prompt (formato diferente
// por tipo de vídeo) e este helper trata da chamada Anthropic + parsing JSON
// estruturado. Modelo: claude-sonnet-4-6.
//
// Princípio editorial partilhado pelos 3 endpoints:
//   - Voz: Vivianne dos Santos (contemplativa, dignificante, PT-PT)
//   - NUNCA clickbait, NUNCA promessa de resultado
//   - Hashtags em 4 camadas: DISCOVERY (alto volume) + TEMÁTICA + MOOD + BRAND
//   - Hashtags SEM acentos (YouTube indexa sem acentos)
//   - Hashtags SEM tags meta-linguísticas (#PTpt, #BR — inúteis para descoberta)
//   - Descrição em texto simples (YouTube não renderiza markdown)

import Anthropic from "@anthropic-ai/sdk";

export type SeoPackage = {
  postTitle: string;
  description: string;
  hashtags: string[];
};

export type GenSeoOptions = {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
};

export async function genSeoPackage(opts: GenSeoOptions): Promise<SeoPackage> {
  const client = new Anthropic({ apiKey: opts.apiKey, maxRetries: 4 });
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: opts.maxTokens ?? 4000,
    system: opts.systemPrompt,
    messages: [{ role: "user", content: opts.userPrompt }],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            postTitle: { type: "string" },
            description: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
          },
          required: ["postTitle", "description", "hashtags"],
          additionalProperties: false,
        },
      },
    },
  });
  const response = await stream.finalMessage();
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`Claude sem text block. stop_reason=${response.stop_reason}`);
  }
  return JSON.parse(textBlock.text) as SeoPackage;
}

// Voz partilhada do canal. Cada endpoint estende este texto com instrucções
// específicas do formato (longos vs funil vs shorts).
export const SHARED_SYSTEM_PROMPT =
  "És copywriter da Vivianne dos Santos. Escreves SEO YouTube que respeita o tom contemplativo do canal 'Escola dos Véus' — nunca clickbait, nunca promessa, sempre dignidade. Português europeu (PT-PT, não BR) sempre. Hashtags sempre sem acentos (YouTube indexa sem acentos) e sem espaços.";

// Bloco de instrução partilhado para hashtags. Os 3 endpoints usam-no com
// pequenas variações na contagem total.
export function hashtagsInstruction(opts: {
  totalCount: string; // ex: "12-15", "10-12", "8-10"
  discoveryCount: string; // ex: "4-5"
  thematicCount: string;
  moodCount: string;
  extraBrand?: string[]; // tags extra obrigatórias (ex: ["Shorts"])
}): string {
  const brandList = ["escoladosveus", "viviannedossantos", ...(opts.extraBrand ?? [])];
  return (
    `hashtags (array ${opts.totalCount}): MIX OBRIGATÓRIO em 4 camadas. Sem # nem espaços ` +
    `(a UI adiciona # depois). Todas SEM acentos — YouTube indexa sem acentos. NUNCA inclui ` +
    `PTpt, PT, BR, idioma ou tags meta-linguísticas. NUNCA inclui o nome da autora com erro ` +
    `(nada de "viviannenascimento" — é viviannedossantos).\n` +
    `  a) DISCOVERY (alto volume YouTube, ${opts.discoveryCount} tags): pesquisas frias que ` +
    `mulheres realmente fazem. ESCOLHE as mais relevantes ao tema: psicologia, autoconhecimento, ` +
    `culpa, heranca, feminilidade, mulher, ancestralidade, traumaintergeracional, ` +
    `autoestima, relacionamentos, maternidade, vergonha, autocuidado, terapia, espiritualidade.\n` +
    `  b) TEMÁTICA (médio volume, ${opts.thematicCount} tags): nicho contemplativo / psicológico. ` +
    `Ex: herancafeminina, ancestralidadefeminina, mulhereshereditarias, maeefilha, vozinterior, ` +
    `feridaemocional, dignidade, silencio, presenca, contemplacao, reflexao, ferida, herdar, ` +
    `corpomemoria.\n` +
    `  c) MOOD/FORMATO (${opts.moodCount} tags): meditacao, audiocontemplativo, ` +
    `podcastfeminino, vozsuave, asmrfeminino, narrativacontemplativa, leituraintima.\n` +
    `  d) BRAND (FIXAS, ${brandList.length} tags): ${brandList.join(", ")}.`
  );
}
