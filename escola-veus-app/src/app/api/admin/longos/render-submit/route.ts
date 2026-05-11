import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import funilSeed from "@/data/funil-prompts.seed.json";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/render-submit
 *
 * Dispatcha o workflow render-longo.yml em GitHub Actions. Mesmo padrão do
 * render-funil — manifest em Supabase, polling via render-status.
 *
 * Body (carrega o projecto longo do admin/longos/<slug>.json e usa narrationUrl
 * + clips + música escolhida):
 *   {
 *     slug: string,
 *     musicUrls: string[],          // 1+ tracks (Ancient Ground por norma)
 *     musicVolume?: number,         // default 0.15
 *     narrationVolume?: number,     // default 1.2
 *     crossfade?: number,           // default 1.0s
 *     includeBrand?: boolean        // default true
 *   }
 *
 * Returns: { jobId } para polling em /render-status?jobId=<id>
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Helpers para semantic-match clips ↔ segmentos de narração ─────────────
// Stop words: descritores genéricos comuns em prompts MJ-style que criam
// falsos positivos no overlap. Igual ao pool browser per-prompt.
const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "at", "to", "for", "with",
  "from", "as", "by", "is", "are", "was", "were", "be", "been", "being",
  "that", "this", "these", "those", "it", "its", "their",
  "very", "slow", "slowly", "static", "camera", "soft", "warm", "warmly",
  "light", "lights", "shadow", "shadows", "holds", "steady", "gently",
  "still", "subtle", "gentle", "quiet", "silent", "calm",
  "scene", "image", "frame", "shot", "view", "angle", "depth", "field",
  "shallow", "macro", "leica", "lens", "feel", "tone", "mood",
  "cinematic", "atmospheric", "moody", "hyperrealistic",
  "color", "colors", "palette", "muted", "rich",
  "single", "lone", "alone", "small", "large",
  "drift", "drifts", "drifting", "resting", "sitting",
]);

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w)),
  );
}

// Parse SRT: devolve cada linha como { startSec, endSec, text }
function parseSrt(srt: string): { startSec: number; endSec: number; text: string }[] {
  const out: { startSec: number; endSec: number; text: string }[] = [];
  for (const block of srt.split(/\n\n+/)) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;
    const m = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/,
    );
    if (!m) continue;
    const startSec = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
    const endSec = +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000;
    const text = lines.slice(2).join(" ").trim();
    if (text) out.push({ startSec, endSec, text });
  }
  return out;
}

type ImgPrompt = { id: string; category: string; mood: string[]; prompt: string };
const SEED_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];
const SEED_BY_ID = new Map<string, ImgPrompt>();
for (const p of SEED_PROMPTS) SEED_BY_ID.set(p.id, p);

type ProjectPrompt = {
  id: string;
  prompt?: string;
  mood?: string[];
  clipUrl?: string;
  clipDurationSec?: number;
  imageUrl?: string;
  startSec?: number;
  endSec?: number;
};

type ProjectSeo = {
  postTitle?: string;
  description?: string;
  hashtags?: string[];
};

type Project = {
  slug?: string;
  titulo?: string;
  thumbnailText?: string;
  narrationUrl?: string;
  subtitlesUrl?: string; // SRT em Supabase, gerada por /generate-srt
  prompts?: ProjectPrompt[];
  seo?: ProjectSeo;
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  let body: {
    slug?: string;
    musicUrls?: string[];
    musicVolume?: number;
    narrationVolume?: number;
    crossfade?: number;
    includeBrand?: boolean;
    preview?: boolean;
    previewSeconds?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const {
    slug,
    musicUrls,
    musicVolume,
    narrationVolume,
    crossfade,
    includeBrand,
    preview = false,
    previewSeconds = 90,
  } = body;
  if (!slug) {
    return NextResponse.json({ erro: "slug obrigatório" }, { status: 400 });
  }
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatório" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // Carrega o projecto.
  let project: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    project = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: `Carregar projecto: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }

  if (!project.narrationUrl) {
    return NextResponse.json(
      { erro: "Projecto não tem narração ainda — gera a narração primeiro.", code: "MISSING_NARRATION" },
      { status: 400 },
    );
  }

  // SRT obrigatória. NÃO auto-gera aqui (causa timeout — render-submit tem
  // maxDuration 30s, /generate-srt sozinho pode levar 30-60s). Cliente
  // chama /generate-srt antes e só depois retry render.
  if (!project.subtitlesUrl) {
    return NextResponse.json(
      {
        erro: "SRT em falta. Gera SRT primeiro (botão '📝 gerar SRT' ou cliente chama /generate-srt antes de retry).",
        code: "MISSING_SRT",
      },
      { status: 412 },
    );
  }

  // Alignment Claude já NÃO é obrigatório — render.mjs faz sync uniforme
  // (pattern do funil: clipDuration calculado de narrSec, slow motion para
  // esticar os 10s nativos). Mais robusto que tentar mapping semântico que
  // sobre-engineering e drift acumulado.

  // SEO YouTube: opcional, render continua sem. Cliente pode chamar /gen-seo
  // antes para incluir o companion <slug>-seo.json.

  // Filtra prompts com clipUrl. Ordem de reprodução = ordem dos prompts.
  // NÃO passa startSec/endSec — alignment Claude estava a fazer 1 clip
  // cobrir 30s+ de narração sobre 4 tópicos diferentes (mismatch grave).
  // Render usa sempre bounce loop: cada clip 10s nativo, sequência cicla
  // pelos N clips para encher narrSec. Match com Corvo Seco — visuais
  // flutuam sobre a narração, não anchor literal.
  const clipsForRender: { url: string; durationSec: number }[] = (
    project.prompts ?? []
  )
    .filter((p) => p.clipUrl)
    .map((p) => ({
      url: p.clipUrl as string,
      durationSec: p.clipDurationSec ?? 0,
    }));

  // Aumenta variedade visual com clips da pool funil (nomear-*-h-NN.mp4).
  // Com 7 eps do funil produzidos + 56 clips do longo, o total combinado
  // (>120 unique) excede o needed (~107 plays para 1070s narração) →
  // bounce loop não precisa repetir. Atmosfera Corvo Seco.
  // Filtra horizontais apenas (-h-NN), exclui verticais (-v-NN).
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const { data: poolFiles } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", { limit: 1000 });
    if (Array.isArray(poolFiles)) {
      const byBase = new Map<string, string>();
      for (const f of poolFiles) {
        if (!/\.mp4$/i.test(f.name)) continue;
        if (!f.name.startsWith("nomear-")) continue;
        if (!/-h-\d+\.mp4$/i.test(f.name)) continue;
        const base = f.name.replace(/\.mp4$/i, "").replace(/-h-\d+$/i, "");
        const existing = byBase.get(base);
        if (!existing || /-h-01\.mp4$/i.test(f.name)) {
          byBase.set(base, f.name);
        }
      }
      const longoUrls = new Set(clipsForRender.map((c) => c.url));
      for (const fileName of byBase.values()) {
        const url = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${fileName}`;
        if (!longoUrls.has(url)) {
          clipsForRender.push({ url, durationSec: 0 });
        }
      }
      console.log(
        `[render-submit] longo ${(project.prompts ?? []).filter((p) => p.clipUrl).length} + pool ${byBase.size} = ${clipsForRender.length} clips`,
      );
    }
  } catch {
    /* pool é opcional — render avança com só os clips do longo */
  }

  // ── Semantic match clips ↔ narração (algorítmico, sem Claude) ──────────
  // Em vez de ordem sequencial + bounce loop, ordena clips para que cada
  // segmento de narração (~10s) tenha o clip com maior overlap de
  // keywords. Determinístico, free, sem dependência Claude.
  //
  // Catalogo: para cada clip em clipsForRender, busca texto + mood:
  //   - Longo clips: lookup pelo URL → project.prompts[i] tem prompt+mood
  //   - Pool clips: URL inclui o promptId (nomear-epXX-NN-cena) → seed lookup
  try {
    if (project.subtitlesUrl) {
      const srtRes = await fetch(project.subtitlesUrl);
      if (srtRes.ok) {
        const srtText = await srtRes.text();
        const sentences = parseSrt(srtText);
        if (sentences.length > 0) {
          const totalSec = sentences[sentences.length - 1].endSec;
          const SEG_SEC = 10;
          const numSegments = Math.max(1, Math.ceil(totalSec / SEG_SEC));

          // Constrói catálogo: { url, durationSec, text, mood }
          const catalog: {
            url: string;
            durationSec: number;
            tokens: Set<string>;
            mood: Set<string>;
          }[] = [];
          for (const c of clipsForRender) {
            let text = "";
            let mood: string[] = [];
            // Longo clip? URL contém /longos-clips/
            const longoMatch = c.url.match(/\/longos-clips\/[^/]+\/(.+?)\.mp4/);
            if (longoMatch) {
              const promptId = longoMatch[1];
              const p = (project.prompts ?? []).find((pp) => pp.id === promptId);
              if (p) {
                text = p.prompt ?? "";
                mood = Array.isArray(p.mood) ? p.mood : [];
              }
            } else {
              // Pool clip? URL contém /youtube/clips/nomear-...
              const poolMatch = c.url.match(
                /\/youtube\/clips\/(nomear-[^/]+?)(?:-h-\d+)?\.mp4/,
              );
              if (poolMatch) {
                const base = poolMatch[1];
                const seed = SEED_BY_ID.get(base);
                if (seed) {
                  text = seed.prompt ?? "";
                  mood = seed.mood ?? [];
                }
              }
            }
            catalog.push({
              url: c.url,
              durationSec: c.durationSec,
              tokens: tokenize(text),
              mood: new Set(mood),
            });
          }

          // Para cada segmento de narração, pick best unused clip
          const ordered: { url: string; durationSec: number }[] = [];
          const used = new Set<number>();
          for (let i = 0; i < numSegments; i++) {
            const segStart = i * SEG_SEC;
            const segEnd = Math.min(segStart + SEG_SEC, totalSec);
            const segText = sentences
              .filter((s) => s.startSec < segEnd && s.endSec > segStart)
              .map((s) => s.text)
              .join(" ");
            const segTokens = tokenize(segText);

            let bestIdx = -1;
            let bestScore = -1;
            for (let k = 0; k < catalog.length; k++) {
              if (used.has(k)) continue;
              const c = catalog[k];
              let kw = 0;
              segTokens.forEach((t) => {
                if (c.tokens.has(t)) kw++;
              });
              // Mood overlap pesa 2× (mais discriminativo)
              const score = kw;
              if (score > bestScore) {
                bestScore = score;
                bestIdx = k;
              }
            }
            // Se nenhum unused ou score 0 → pick first unused
            if (bestIdx < 0 || bestScore === 0) {
              bestIdx = catalog.findIndex((_, k) => !used.has(k));
            }
            if (bestIdx >= 0) {
              ordered.push({
                url: catalog[bestIdx].url,
                durationSec: catalog[bestIdx].durationSec,
              });
              used.add(bestIdx);
            }
          }

          if (ordered.length > 0) {
            clipsForRender.length = 0;
            clipsForRender.push(...ordered);
            console.log(
              `[render-submit] semantic-match aplicado: ${ordered.length} segmentos de narração emparelhados com clips`,
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn(
      `[render-submit] semantic-match falhou (${err instanceof Error ? err.message : String(err)}); fallback à ordem original`,
    );
  }

  if (clipsForRender.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum prompt tem clip carregado. Faz upload dos MJ Video clips primeiro." },
      { status: 400 },
    );
  }

  const jobId = `longo-${slug}-${Date.now()}`;

  // Thumbnail base: primeira imagem uploaded (preferível) ou primeiro clip.
  // O render.mjs sobrepõe project.thumbnailText em cima.
  const firstWithImage = (project.prompts ?? []).find(
    (p) => typeof p.imageUrl === "string" && p.imageUrl,
  );
  const firstWithClip = (project.prompts ?? []).find((p) => p.clipUrl);
  const thumbnailBaseUrl = firstWithImage?.imageUrl || firstWithClip?.clipUrl || null;

  const manifest = {
    jobId,
    title: project.titulo || slug,
    slug,
    narrationUrl: project.narrationUrl,
    subtitlesUrl: project.subtitlesUrl || null,
    clips: clipsForRender,
    musicUrls,
    musicVolume: typeof musicVolume === "number" ? musicVolume : 0.15,
    narrationVolume: typeof narrationVolume === "number" ? narrationVolume : 1.2,
    crossfade: typeof crossfade === "number" ? crossfade : 1.0,
    includeBrand: includeBrand !== false,
    preview: !!preview,
    previewSeconds: typeof previewSeconds === "number" ? previewSeconds : 90,
    // Thumbnail companion file: o render extrai/usa esta imagem, sobrepõe
    // o thumbnailText em runtime via ffmpeg drawtext, e faz upload como
    // companion <slug>-thumb.jpg.
    thumbnailBaseUrl,
    thumbnailText: project.thumbnailText || project.titulo || slug,
    // SEO YouTube companion: render guarda <slug>-seo.json se presente.
    seo: project.seo || null,
    createdAt: new Date().toISOString(),
  };

  // Upload manifest
  const manifestBody = JSON.stringify(manifest, null, 2);
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(`longo-render-jobs/${jobId}.json`, manifestBody, {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `Upload manifest: ${upErr.message}` },
      { status: 500 },
    );
  }

  // Initial result.json (status queued — UI vê imediatamente)
  await supabase.storage
    .from("course-assets")
    .upload(
      `longo-render-jobs/${jobId}-result.json`,
      JSON.stringify(
        {
          jobId,
          status: "queued",
          progress: 0,
          title: project.titulo,
          slug,
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      { contentType: "application/json", upsert: true },
    );

  // Dispatch GitHub Actions
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE_LONGO || "render-longo.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN não configurada" },
      { status: 500 },
    );
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
    return NextResponse.json(
      { erro: `GitHub dispatch (${ghRes.status}): ${errText.slice(0, 300)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ jobId });
}
