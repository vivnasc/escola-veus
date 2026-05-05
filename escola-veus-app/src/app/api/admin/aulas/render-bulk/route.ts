import { NextRequest, NextResponse } from "next/server";
import {
  buildSlideDeckFromConfig,
  DEFAULT_VOLUMES,
  type Acto,
  type LessonConfig,
} from "@/lib/course-slides";
import { getCourseBySlug } from "@/data/courses";
import { getTerritoryTheme } from "@/data/territory-themes";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/aulas/render-bulk
 *   body: { slug, only?: Array<{module:number, sub:string}> }
 *
 * Dispara render MP4 para várias sub-aulas em paralelo, partilhando o
 * mesmo workflow GitHub Actions usado pelo /render-submit individual.
 *
 * Para cada sub-aula:
 *   - Carrega o config (override). Se vazio, usa só o script base.
 *   - Constrói deck.
 *   - Resolve faixa AG: config.agTrack > defaults.agTrack do curso. Se
 *     nem uma nem outra, salta com status "skipped" + razão.
 *   - Escreve manifest em course-assets/render-jobs/<jobId>.json e
 *     dispacha workflow.
 *
 * Retorna lista de jobs com status inicial. A UI faz polling individual
 * via /api/admin/aulas/render-status?jobId=... como já fazemos.
 */

const BUCKET = "course-assets";

type CourseDefaults = {
  agTrack: string | null;
  volumeDb: Record<Acto, number>;
};

type JobStatus =
  | "dispatched"
  | "skipped_no_track"
  | "skipped_no_script"
  | "error";

type JobResult = {
  module: number;
  sub: string;
  jobId: string | null;
  status: JobStatus;
  error?: string;
};

function configPath(slug: string, m: number, sub: string) {
  return `admin/aulas-config/${slug}/m${m}-${sub.toLowerCase()}.json`;
}

function defaultsPath(slug: string) {
  return `admin/aulas-course-defaults/${slug}.json`;
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; only?: Array<{ module: number; sub: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  if (!slug) return NextResponse.json({ erro: "Falta slug" }, { status: 400 });

  const course = getCourseBySlug(slug);
  if (!course) return NextResponse.json({ erro: "Curso não encontrado" }, { status: 404 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ erro: "NEXT_PUBLIC_SUPABASE_URL em falta" }, { status: 500 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY em falta" }, { status: 500 });
  }

  // Carrega defaults do curso (faixa AG default + volumes default).
  const courseDefaults: CourseDefaults = await (async () => {
    const fallback: CourseDefaults = { agTrack: null, volumeDb: { ...DEFAULT_VOLUMES } };
    const { data, error } = await admin.storage.from(BUCKET).download(defaultsPath(slug));
    if (error || !data) return fallback;
    try {
      const parsed = JSON.parse(await data.text()) as Partial<CourseDefaults>;
      return {
        agTrack: parsed.agTrack ?? null,
        volumeDb: { ...DEFAULT_VOLUMES, ...(parsed.volumeDb ?? {}) },
      };
    } catch {
      return fallback;
    }
  })();

  // Decide quais sub-aulas correr.
  const allSubs = course.modules.flatMap((m) =>
    m.subLessons.map((sl) => ({ module: m.number, sub: sl.letter.toLowerCase() })),
  );
  const targets =
    body.only && body.only.length > 0
      ? body.only.map((o) => ({ module: o.module, sub: o.sub.toLowerCase() }))
      : allSubs;

  // Token GitHub para dispatch
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-course-slide.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN em falta — não dá para despachar workflows." },
      { status: 500 },
    );
  }
  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const theme = getTerritoryTheme(slug);
  const accentColor = theme?.primary ?? "#C9A96E";

  // Processa em paralelo (mas com algum cuidado: 24 dispatches em paralelo
  // estão dentro dos limites do GitHub e do Supabase).
  const results: JobResult[] = await Promise.all(
    targets.map(async (t) => {
      const baseResult: JobResult = {
        module: t.module,
        sub: t.sub,
        jobId: null,
        status: "error",
      };
      try {
        // Carrega override (config) desta sub-aula
        const cfgRes = await admin.storage
          .from(BUCKET)
          .download(configPath(slug, t.module, t.sub));
        let config: LessonConfig = {};
        if (cfgRes.data) {
          try {
            config = JSON.parse(await cfgRes.data.text()) as LessonConfig;
          } catch {
            config = {};
          }
        }

        const deck = buildSlideDeckFromConfig(slug, t.module, t.sub, config);
        if (!deck) {
          return { ...baseResult, status: "skipped_no_script" };
        }

        const agTrackName = config.agTrack || courseDefaults.agTrack;
        if (!agTrackName) {
          return { ...baseResult, status: "skipped_no_track" };
        }
        const agTrackUrl = `${supabaseUrl}/storage/v1/object/public/audios/albums/ancient-ground/${encodeURIComponent(agTrackName)}`;

        // Volumes mergidos: defaults < courseDefaults < config
        const volumeDb: Record<Acto, number> = { ...DEFAULT_VOLUMES };
        for (const [k, v] of Object.entries(courseDefaults.volumeDb)) {
          if (typeof v === "number") volumeDb[k as Acto] = v;
        }
        if (config.volumeDb) {
          for (const [k, v] of Object.entries(config.volumeDb)) {
            if (typeof v === "number") volumeDb[k as Acto] = v;
          }
        }

        const jobId = `aula-${slug}-m${t.module}-${t.sub}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const outputPath = `curso-${slug}/videos/m${t.module}-${t.sub}.mp4`;
        const manifest = {
          jobId,
          slug,
          module: t.module,
          sub: t.sub,
          deck,
          agTrackName,
          agTrackUrl,
          volumeDb,
          accentColor,
          outputPath,
          createdAt: new Date().toISOString(),
        };

        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(`render-jobs/${jobId}.json`, JSON.stringify(manifest, null, 2), {
            contentType: "application/json",
            upsert: true,
          });
        if (upErr) throw new Error(`Upload manifest: ${upErr.message}`);

        await admin.storage
          .from(BUCKET)
          .upload(
            `render-jobs/${jobId}-result.json`,
            JSON.stringify(
              { jobId, status: "queued", updatedAt: new Date().toISOString() },
              null,
              2,
            ),
            { contentType: "application/json", upsert: true },
          );

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
          const t = await ghRes.text();
          throw new Error(`GitHub dispatch ${ghRes.status}: ${t.slice(0, 200)}`);
        }

        return { module: t.module, sub: t.sub, jobId, status: "dispatched" as JobStatus };
      } catch (err) {
        return {
          ...baseResult,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  return NextResponse.json({
    slug,
    total: results.length,
    dispatched: results.filter((r) => r.status === "dispatched").length,
    skippedNoTrack: results.filter((r) => r.status === "skipped_no_track").length,
    skippedNoScript: results.filter((r) => r.status === "skipped_no_script").length,
    errors: results.filter((r) => r.status === "error").length,
    jobs: results,
  });
}
