import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
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
  // PT stop-words comuns (length >=4, passariam o filtro de tamanho)
  "para", "como", "isso", "esse", "essa", "este", "esta",
  "isto", "essas", "estas", "esses", "estes",
  "porque", "quando", "onde", "tudo", "nada",
  "muito", "muita", "muitas", "muitos", "também",
  "está", "estás", "estão", "estive", "estiveste",
  "tens", "tinha", "tinham", "tivesse",
  "todos", "todas", "outro", "outra", "outros", "outras",
  "depois", "antes", "agora", "ainda", "talvez",
  "mais", "menos", "sempre", "nunca",
  "nomear", "trailer", "longo",
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
    // dryRun: corre todo o pipeline (carrega projecto, prereqs, semantic
    // match) MAS NÃO dispatcha o workflow GitHub Actions. Devolve a
    // timeline planeada para a Vivianne rever antes do render real.
    dryRun?: boolean;
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
    dryRun = false,
  } = body;
  if (!slug) {
    return NextResponse.json({ erro: "slug obrigatório" }, { status: 400 });
  }
  if (!dryRun && (!Array.isArray(musicUrls) || musicUrls.length === 0)) {
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
          // CROSS-LANGUAGE FIX: usa filename SCENE-NAME (PT) como fonte de
          // tokens em vez do prompt (EN). Narração é PT, prompts são EN →
          // overlap direto seria sempre 0.
          //
          // Filename é tipo "nomear-ep05-01-casa-calou" ou
          // "peso-de-quem-veio-antes-01-voz-antiga". Extraímos só a parte
          // ÚNICA depois do número de cena (ex: "casa-calou", "voz-antiga")
          // para evitar prefixos partilhados (todos os pool clips têm
          // "nomear"/"ep05"; todos os longo clips têm o project slug)
          // dominarem o matching e perder diferenciação.
          //
          // Mood (PT em ambos) é adicionado por completude.
          const catalog: {
            url: string;
            durationSec: number;
            tokens: Set<string>;
            mood: Set<string>;
          }[] = [];
          for (const c of clipsForRender) {
            let mood: string[] = [];
            let filenameSlug = "";
            const longoMatch = c.url.match(/\/longos-clips\/[^/]+\/(.+?)\.mp4/);
            if (longoMatch) {
              filenameSlug = longoMatch[1];
              const p = (project.prompts ?? []).find((pp) => pp.id === filenameSlug);
              if (p) mood = Array.isArray(p.mood) ? p.mood : [];
            } else {
              const poolMatch = c.url.match(
                /\/youtube\/clips\/(nomear-[^/]+?)(?:-h-\d+)?\.mp4/,
              );
              if (poolMatch) {
                filenameSlug = poolMatch[1];
                const seed = SEED_BY_ID.get(filenameSlug);
                if (seed) mood = seed.mood ?? [];
              }
            }
            // Extrai só a parte após o último N-2-digit-prefix
            // ("01-voz-antiga" → "voz-antiga"). Se não houver match,
            // usa o filename completo como fallback.
            const sceneMatch = filenameSlug.match(/\d{2}-(.+)$/);
            const sceneName = sceneMatch ? sceneMatch[1] : filenameSlug;
            const sceneText = sceneName.replace(/-/g, " ");
            const moodText = mood.join(" ");
            const allText = `${sceneText} ${moodText}`;
            catalog.push({
              url: c.url,
              durationSec: c.durationSec,
              tokens: tokenize(allText),
              mood: new Set(mood),
            });
          }

          // Catálogo já construído. NÃO interleave — Claude decide ordem.
          // Para cada segmento de narração, Claude semantic match.
          //
          // Vivianne pediu Claude semantic em vez do keyword overlap
          // algorítmico. Razão: narração PT vs clip prompts EN davam
          // muitos scores 0 (cross-language). Claude é bilingue e
          // entende semantic similarity directamente.
          //
          // Custo: ~$0.06 por preview/render (Sonnet 4.6).

          // Constrói payload para Claude: segmentos + catálogo
          const segmentsForClaude = [];
          for (let i = 0; i < numSegments; i++) {
            const segStart = i * SEG_SEC;
            const segEnd = Math.min(segStart + SEG_SEC, totalSec);
            const segText = sentences
              .filter((s) => s.startSec < segEnd && s.endSec > segStart)
              .map((s) => s.text)
              .join(" ");
            segmentsForClaude.push({
              idx: i,
              startSec: segStart,
              text: segText.slice(0, 250),
            });
          }
          const catalogForClaude = catalog.map((c, k) => {
            const isLongo = c.url.includes("/longos-clips/");
            const fileName = c.url.split("/").pop()?.replace(".mp4", "") ?? "";
            return {
              idx: k,
              source: isLongo ? "longo" : "pool",
              fileName,
              mood: Array.from(c.mood),
            };
          });
          const longoIndicesCount = catalogForClaude.filter(
            (c) => c.source === "longo",
          ).length;

          const anthropicKey = process.env.ANTHROPIC_API_KEY;
          if (!anthropicKey) {
            throw new Error("ANTHROPIC_API_KEY não configurada para semantic match");
          }
          const claude = new Anthropic({ apiKey: anthropicKey, maxRetries: 4 });

          const sysPrompt =
            "És o editor de timing dum vídeo contemplativo long-form 'Escola dos Véus' (canal da Vivianne Nascimento, conteúdo sobre herança feminina, culpa, vergonha doméstica). Empacotas clips visuais a segmentos de narração para criar coerência semântica.";

          const userMsg =
            `Empareja cada segmento de narração (PT) ao clip semanticamente mais próximo do catálogo. Catálogo é mistura PT/EN (filenames PT, mood PT).\n\n` +
            `REGRAS ESTRITAS:\n` +
            `1. Cada clip pode ser usado NO MÁXIMO 1× (sem repetição). Tens ${catalog.length} clips para ${numSegments} segmentos — surplus, todos os segmentos ficam atribuídos sem repetir.\n` +
            `2. 1 clip por segmento (todos os ${numSegments} segmentos preenchidos).\n` +
            `3. Distribui clips com source='longo' uniformemente pela timeline (não só no início — alterna com source='pool'). Os clips longo são ${longoIndicesCount} dos ${catalog.length} — espalha-os a cada ~${Math.max(1, Math.round(numSegments / Math.max(1, longoIndicesCount)))} segmentos.\n` +
            `4. Match SEMANTIC: lê o texto do segmento e o filename+mood do clip, escolhe baseado em SIGNIFICADO não em palavras literais. Ex: narração sobre 'voz de avó' bate com clip 'voz-antiga' ou 'mulher-velha-mesa'.\n\n` +
            `SEGMENTOS (${numSegments}):\n` +
            segmentsForClaude
              .map((s) => `[${s.idx}] ${s.startSec}s: "${s.text}"`)
              .join("\n") +
            `\n\nCATÁLOGO (${catalog.length}):\n` +
            catalogForClaude
              .map(
                (c) =>
                  `[${c.idx}] ${c.source} · ${c.fileName} · mood:[${c.mood.join(",")}]`,
              )
              .join("\n") +
            `\n\nDevolve JSON com array "assignments": cada item { segmentIdx, clipIdx }. Exactamente ${numSegments} itens, segmentIdx 0..${numSegments - 1} sem repetir, clipIdx 0..${catalog.length - 1} sem repetir.`;

          interface Assignment {
            segmentIdx: number;
            clipIdx: number;
          }
          let assignments: Assignment[];
          try {
            const stream = claude.messages.stream({
              model: "claude-sonnet-4-6",
              max_tokens: 24000,
              system: sysPrompt,
              messages: [{ role: "user", content: userMsg }],
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
                            segmentIdx: { type: "integer" },
                            clipIdx: { type: "integer" },
                          },
                          required: ["segmentIdx", "clipIdx"],
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
            const resp = await stream.finalMessage();
            const textBlock = resp.content.find((b) => b.type === "text");
            if (!textBlock || textBlock.type !== "text") {
              throw new Error(`Claude sem text block · stop=${resp.stop_reason}`);
            }
            const parsed = JSON.parse(textBlock.text) as { assignments: Assignment[] };
            assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
          } catch (claudeErr) {
            throw new Error(
              `Claude semantic match falhou: ${claudeErr instanceof Error ? claudeErr.message : String(claudeErr)}`,
            );
          }

          // Constrói ordered list a partir das assignments do Claude.
          // Ordena por segmentIdx ascendente para preservar ordem temporal.
          assignments.sort((a, b) => a.segmentIdx - b.segmentIdx);
          const ordered: { url: string; durationSec: number }[] = [];
          const previewSegments: {
            idx: number;
            startSec: number;
            endSec: number;
            narration: string;
            clipUrl: string | null;
            clipPrompt: string;
            matchScore: number;
          }[] = [];
          const seenSeg = new Set<number>();
          const seenClip = new Set<number>();
          for (const a of assignments) {
            if (seenSeg.has(a.segmentIdx)) continue;
            if (seenClip.has(a.clipIdx)) continue;
            if (a.clipIdx < 0 || a.clipIdx >= catalog.length) continue;
            seenSeg.add(a.segmentIdx);
            seenClip.add(a.clipIdx);
            const seg = segmentsForClaude[a.segmentIdx];
            const clip = catalog[a.clipIdx];
            const fileName =
              catalogForClaude[a.clipIdx]?.fileName ?? clip.url.split("/").pop() ?? "";
            ordered.push({ url: clip.url, durationSec: clip.durationSec });
            previewSegments.push({
              idx: a.segmentIdx,
              startSec: seg.startSec,
              endSec: Math.min(seg.startSec + SEG_SEC, totalSec),
              narration: seg.text,
              clipUrl: clip.url,
              clipPrompt: fileName,
              matchScore: 1, // Claude semantic — score binário (assigned ou not)
            });
          }

          if (ordered.length > 0) {
            clipsForRender.length = 0;
            clipsForRender.push(...ordered);
            console.log(
              `[render-submit] Claude semantic match: ${ordered.length} segmentos emparelhados`,
            );
          }

          // dryRun: devolve a timeline para preview, NÃO dispatcha render
          if (dryRun) {
            return NextResponse.json({
              dryRun: true,
              totalSegments: numSegments,
              totalClipsAvailable: catalog.length,
              segments: previewSegments,
            });
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
