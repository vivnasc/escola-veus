/**
 * Núcleo do `render-remotion-submit` — dispara o workflow Remotion.
 *
 * Manifest novo (sem clips MJ/Runway) — o vídeo é gerado puramente
 * programaticamente em React/SVG via Remotion. Pool de clips em
 * escola-shorts/ deixa de ser usada para shorts.
 */

import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type RenderRemotionInput = {
  /** Marca — determina motion + signature defaults. */
  brand: "loranne" | "ancient-ground";
  /** Variante do motion — A/B/C/D. Determinístico por (album, faixa). */
  motionVariant: "A" | "B" | "C" | "D";
  /** Cor de acento (Loranne) — varia por álbum. */
  accent?: string;
  /** Modo: "clip" (30-60s social) ou "full" (3-5 min YT canal). */
  mode?: "clip" | "full";
  /** 2 versos para overlay (modo estático — AG e fallback Loranne). */
  verses: [string, string];
  /** Letras inteiras divididas em stanzas (Loranne lyric video). */
  syncedLyrics?: string[];
  /** Timing real por stanza (segundos absolutos no áudio) — vindo do Scribe. */
  stanzaTimings?: { text: string; startSec: number; endSec: number }[];
  /** Duração total do áudio em segundos (do Scribe). Determina full mode duration. */
  audioDurationSec?: number;
  /** Activa modo lyric video — letras passam em sync. */
  lyricsSync?: boolean;
  /** Idioma da letra (PT/EN) — para Scribe usar language_code certo. */
  lang?: "PT" | "EN";
  /** Onde começa o áudio neste render (em segundos absolutos no MP3). 0 para full. */
  audioStartFromSec?: number;
  /** Capítulos de conto (AG full) — passam como texto sobre instrumental. */
  storyChapters?: string[];
  /** Título do conto AG (signature/metadata). */
  storyTitle?: string;
  /** URL do MP3 da faixa. */
  audioUrl: string;
  /** Volume áudio (default 1). */
  audioVolume?: number;
  /** Label da track (Loranne: "Faixa · Álbum"; AG: label do triplete). */
  trackLabel?: string;
  /** Signature (default por marca). */
  signature?: string;
  /** Duração (default: 30 clip / 240 full). */
  durationSec?: number;

  /** Identificadores opcionais (para slug/log). */
  title?: string;
  slug?: string;
};

function sanitiseSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "short";
}

export async function runRenderRemotionSubmit(input: RenderRemotionInput): Promise<{ jobId: string }> {
  if (!input || !input.brand || !input.motionVariant) {
    throw new Error("brand + motionVariant obrigatorios.");
  }
  if (!Array.isArray(input.verses) || input.verses.length < 2) {
    throw new Error("verses[2] obrigatorio.");
  }
  if (!input.audioUrl) {
    throw new Error("audioUrl obrigatorio.");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada.");
  }

  const mode = input.mode ?? "clip";
  // Para mode="full", se temos audioDurationSec do Scribe, usa-a (preciso).
  // Senão, default 240s. Para mode="clip", sempre 30s.
  const defaultDuration = mode === "full"
    ? (input.audioDurationSec && input.audioDurationSec > 0 ? Math.ceil(input.audioDurationSec) : 240)
    : 30;
  const slugMode = mode === "full" ? "full" : "clip";
  const slug = sanitiseSlug(input.slug || input.title || `${input.brand}-${input.motionVariant}`);
  const jobId = `lyric-${slugMode}-${slug}-${Date.now()}`;

  const manifest = {
    jobId,
    title: input.title || "",
    slug,
    mode,
    brand: input.brand,
    motionVariant: input.motionVariant,
    accent: input.accent || (input.brand === "loranne" ? "#D4A853" : "#FFD27F"),
    lyricsSync: !!input.lyricsSync,
    syncedLyrics: input.syncedLyrics || null,
    stanzaTimings: input.stanzaTimings || null,
    audioDurationSec: input.audioDurationSec ?? null,
    lang: input.lang || "PT",
    audioStartFromSec: input.audioStartFromSec ?? 0,
    storyChapters: input.storyChapters || null,
    storyTitle: input.storyTitle || null,
    verses: input.verses,
    audioUrl: input.audioUrl,
    audioVolume: input.audioVolume ?? 1,
    trackLabel: input.trackLabel || "",
    signature: input.signature || (input.brand === "loranne" ? "◯ Loranne" : "Ancient Ground"),
    durationSec: input.durationSec ?? defaultDuration,
    fps: 30,
    createdAt: new Date().toISOString(),
  };

  const manifestBody = JSON.stringify(manifest, null, 2);
  const { error: upErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}.json`, manifestBody, {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    throw new Error(`Upload manifest falhou: ${upErr.message}`);
  }

  const initialResult = {
    jobId,
    status: "queued",
    progress: 0,
    title: manifest.title || manifest.trackLabel,
    slug,
    updatedAt: new Date().toISOString(),
  };
  await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initialResult, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE_REMOTION || "render-remotion-short.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!token) {
    throw new Error("GITHUB_DISPATCH_TOKEN nao configurada.");
  }

  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const ghRes = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref, inputs: { jobId } }),
  });

  if (!ghRes.ok) {
    const errText = await ghRes.text();
    throw new Error(`GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}`);
  }

  return { jobId };
}
