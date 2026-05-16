import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

import seed from "@/data/hoje-em-mim-frases.seed.json";
import {
  detectDiaEspecial,
  phraseToCaptions,
  type DiaEspecial,
  type DiaSemana,
} from "@/lib/hoje-em-mim/captions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * POST /api/admin/hoje-em-mim/render-submit
 *
 * Submete um job de render BULK em RANGE para a produção "Hoje, em Mim".
 *
 * Pode pedir um intervalo de dias num mês (ex: 15 a 31 de Maio = 17 items).
 * O render real corre como matrix paralela no workflow render-hoje-em-mim.yml.
 *
 * Body: {
 *   jobId,
 *   ano (yyyy),
 *   mes (1-12),
 *   diaInicio (1-31),
 *   diaFim (diaInicio..31),
 *   motionPool: string[]  (URLs públicas, mínimo 1, roda entre eles),
 *   audioPool?: string[]  (URLs públicas, vazio para sem som),
 *   durationSec (default 15)
 * }
 *
 * Returns: { jobId, items, manifestUrl, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    jobId?: string;
    ano?: number;
    mes?: number;
    diaInicio?: number;
    diaFim?: number;
    motionPool?: string[];
    audioPool?: string[];
    themePool?: string[];
    shuffleMotions?: boolean;
    durationSec?: number;
    /** Override per-dia: motion, audio, frase ou tema específico que
     *  substitui o que o buildItems calculou por defeito. */
    itemOverrides?: Record<string, {
      fraseTexto?: string;
      motionUrl?: string;
      audioUrl?: string | null;
      theme?: string;
    }>;
  };

  const jobId = (body.jobId || "").trim();
  if (!jobId) return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });

  const ano = Number(body.ano);
  const mes = Number(body.mes);
  const diaInicio = Number(body.diaInicio);
  const diaFim = Number(body.diaFim);

  if (!Number.isInteger(ano) || ano < 2020 || ano > 2100) {
    return NextResponse.json({ erro: "ano inválido (2020-2100)" }, { status: 400 });
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ erro: "mes inválido (1-12)" }, { status: 400 });
  }
  const diasNoMes = daysInMonth(ano, mes);
  if (!Number.isInteger(diaInicio) || diaInicio < 1 || diaInicio > diasNoMes) {
    return NextResponse.json(
      { erro: `diaInicio inválido (1-${diasNoMes} para ${MESES_PT[mes - 1]})` },
      { status: 400 }
    );
  }
  if (!Number.isInteger(diaFim) || diaFim < diaInicio || diaFim > diasNoMes) {
    return NextResponse.json(
      { erro: `diaFim tem de estar entre ${diaInicio} e ${diasNoMes}` },
      { status: 400 }
    );
  }

  const rawMotionPool = Array.isArray(body.motionPool)
    ? body.motionPool.filter((u) => typeof u === "string" && u.length > 4)
    : [];
  // Embaralha o pool para que motions parecidos (várias variações do
  // mesmo prompt MJ) não fiquem em dias consecutivos. Default true.
  const shuffleMotions = body.shuffleMotions !== false;
  const motionPool = shuffleMotions ? shuffleArray(rawMotionPool) : rawMotionPool;
  if (motionPool.length === 0) {
    return NextResponse.json({ erro: "motionPool vazio. Adiciona pelo menos 1 motion." }, { status: 400 });
  }
  const audioPool = Array.isArray(body.audioPool)
    ? body.audioPool.filter((u) => typeof u === "string" && u.length > 4)
    : [];
  const themePool = Array.isArray(body.themePool)
    ? body.themePool.filter((t) => typeof t === "string" && t.length > 0)
    : ["carta-noturna"];
  const durationSec = clamp(Number(body.durationSec ?? 15), 5, 60);

  // Resolve URLs relativos (e.g. '/assets/hoje-em-mim/motions/lua-piscina-01.mp4')
  // para absolutos, senão o worker do GitHub Actions falha 'Failed to parse URL'.
  // Origem: req.nextUrl.origin (vercel deployment URL) ou
  // NEXT_PUBLIC_SITE_URL como fallback.
  const origin =
    req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://escola-veus.vercel.app";
  const resolveUrl = (u: string): string => {
    if (!u) return u;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${origin}${u}`;
    return u;
  };
  const resolvedMotionPool = motionPool.map(resolveUrl);
  const resolvedAudioPool = audioPool.map(resolveUrl);

  const frases = seed.frases as Array<{ id: string; dia: DiaSemana; texto: string }>;
  const frasesPorDia: Record<DiaSemana, typeof frases> = {
    mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
  };
  for (const f of frases) frasesPorDia[f.dia].push(f);

  const fEspRaw = (seed as unknown as {
    frases_especiais?: Partial<Record<DiaEspecial, Array<{ id: string; texto: string }>>>;
  }).frases_especiais;
  const frasesEspeciais: Record<DiaEspecial, Array<{ id: string; texto: string }>> = {
    fim_mes: fEspRaw?.fim_mes ?? [],
    inicio_mes: fEspRaw?.inicio_mes ?? [],
    fim_ano: fEspRaw?.fim_ano ?? [],
    inicio_ano: fEspRaw?.inicio_ano ?? [],
  };

  const startDate = isoDate(ano, mes, diaInicio);
  const numDays = diaFim - diaInicio + 1;

  const items = buildItems({
    startDate,
    numDays,
    motionPool: resolvedMotionPool,
    audioPool: resolvedAudioPool,
    themePool,
    durationSec,
    frasesPorDia,
    frasesEspeciais,
  });

  if (items.length === 0) {
    return NextResponse.json({ erro: "Não consegui construir items." }, { status: 400 });
  }

  // Aplica overrides per-dayIndex enviados pelo cliente (edições inline
  // na BulkPreviewTable). Permite que a Vivianne reescreva frase, troque
  // motion, troque áudio ou mude tema apenas em dias específicos sem ter
  // de mudar a pool inteira.
  if (body.itemOverrides) {
    for (const item of items) {
      const ov = body.itemOverrides[String(item.dayIndex)];
      if (!ov) continue;
      if (typeof ov.fraseTexto === "string" && ov.fraseTexto.trim()) {
        item.fraseTexto = ov.fraseTexto.trim();
        item.captions = phraseToCaptions({
          phrase: item.fraseTexto,
          dia: item.dia,
        });
      }
      if (typeof ov.motionUrl === "string" && ov.motionUrl.trim()) {
        item.motionUrl = resolveUrl(ov.motionUrl.trim());
      }
      if (ov.audioUrl !== undefined) {
        item.audioUrl = ov.audioUrl
          ? resolveUrl(String(ov.audioUrl).trim())
          : null;
      }
      if (typeof ov.theme === "string" && ov.theme.trim()) {
        item.theme = ov.theme.trim();
      }
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." },
      { status: 500 }
    );
  }

  const manifest = {
    jobId,
    ano,
    mes,
    mesLabel: MESES_PT[mes - 1],
    diaInicio,
    diaFim,
    startDate,
    numDays,
    durationSec,
    items,
    createdAt: new Date().toISOString(),
  };
  const manifestPath = `render-jobs/${jobId}.json`;
  const { error: mErr } = await admin.storage
    .from("course-assets")
    .upload(manifestPath, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) {
    return NextResponse.json(
      { erro: `Upload manifest falhou: ${mErr.message}` },
      { status: 500 }
    );
  }

  // Estado inicial. O ficheiro `<jobId>-result.json` guarda só metadata.
  // Os resultados por item ficam em `<jobId>-items/<dayIndex>.json`.
  // O status endpoint agrega.
  const initial = {
    jobId,
    status: "queued" as const,
    total: items.length,
    ano,
    mes,
    mesLabel: MESES_PT[mes - 1],
    diaInicio,
    diaFim,
    startDate,
    numDays,
    createdAt: new Date().toISOString(),
  };
  const { error: rErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initial, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (rErr) {
    return NextResponse.json(
      { erro: `Upload result inicial falhou: ${rErr.message}` },
      { status: 500 }
    );
  }

  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-hoje-em-mim.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada." },
      { status: 500 }
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
    body: JSON.stringify({
      ref,
      inputs: { jobId },
    }),
  });
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return NextResponse.json({
    jobId,
    items: items.length,
    ano,
    mes,
    mesLabel: MESES_PT[mes - 1],
    diaInicio,
    diaFim,
    manifestUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/${manifestPath}`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}

type ManifestItem = {
  dayIndex: number;
  date: string;
  dia: DiaSemana;
  fraseId: string;
  fraseTexto: string;
  motionUrl: string;
  audioUrl: string | null;
  theme: string;
  durationSec: number;
  captions: { instagram: string; tiktok: string; whatsapp: string };
  especial?: DiaEspecial;
};

function buildItems(opts: {
  startDate: string;
  numDays: number;
  motionPool: string[];
  audioPool: string[];
  themePool: string[];
  durationSec: number;
  frasesPorDia: Record<DiaSemana, Array<{ id: string; dia: DiaSemana; texto: string }>>;
  frasesEspeciais: Record<DiaEspecial, Array<{ id: string; texto: string }>>;
}): ManifestItem[] {
  const items: ManifestItem[] = [];
  const fraseCursor: Record<DiaSemana, number> = {
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
  };

  // Cursor para frases especiais (fim_mes, inicio_mes, fim_ano, inicio_ano)
  const especialCursor: Record<DiaEspecial, number> = {
    fim_mes: 0, inicio_mes: 0, fim_ano: 0, inicio_ano: 0,
  };

  for (let i = 0; i < opts.numDays; i++) {
    const date = addDays(opts.startDate, i);
    const dia = diaFromIso(date);
    const especial = detectDiaEspecial(date);

    // Se é dia especial e há frases especiais disponíveis, usa essas.
    // Caso contrário, fall through para a rotação por weekday.
    let frase: { id: string; texto: string } | null = null;
    if (especial && opts.frasesEspeciais[especial]?.length > 0) {
      const epool = opts.frasesEspeciais[especial];
      frase = epool[especialCursor[especial] % epool.length];
      especialCursor[especial]++;
    } else {
      const pool = opts.frasesPorDia[dia];
      if (pool.length === 0) continue;
      frase = pool[fraseCursor[dia] % pool.length];
      fraseCursor[dia]++;
    }

    const motionUrl = opts.motionPool[i % opts.motionPool.length];
    const audioUrl =
      opts.audioPool.length > 0 ? opts.audioPool[i % opts.audioPool.length] : null;
    const theme = opts.themePool[i % opts.themePool.length] || "carta-noturna";
    const captions = phraseToCaptions({
      phrase: frase.texto,
      dia,
      especial: especial || null,
    });

    items.push({
      dayIndex: i,
      date,
      dia,
      fraseId: frase.id,
      fraseTexto: frase.texto,
      motionUrl,
      audioUrl,
      theme,
      durationSec: opts.durationSec,
      captions,
      ...(especial ? { especial } : {}),
    });
  }
  return items;
}

function isoDate(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function daysInMonth(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function diaFromIso(iso: string): DiaSemana {
  const [y, m, d] = iso.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DiaSemana[])[w];
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** Fisher-Yates shuffle. Não modifica o array original. */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
