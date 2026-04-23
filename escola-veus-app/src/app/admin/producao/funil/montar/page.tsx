"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

// Slug algorithm matching /api/admin/audio-bulk/generate-one/route.ts filename logic.
// audio-bulk saves ElevenLabs audio as `${slug-of-title}-${timestamp}.mp3`.
function titleToSlug(title: string): string {
  return (title || "audio")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function findScriptById(id: string): { titulo: string; texto?: string } | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id);
    if (hit) return hit as { titulo: string; texto?: string };
  }
  return null;
}

type Clip = { name: string; url: string };
type Track = { name: string; url: string; sizeMB?: number };
type Audio = { name: string; url: string };

type Progress = { percent: number; label: string };

// Pool = todos os clips Runway já renderizados em Supabase, com metadata
// (mood/prompt/episode) para o browser de reciclagem. Vem de /api/admin/funil/pool.
type PoolClip = {
  clipId: string;
  clipUrl: string;
  episode: string;
  imagePrompt: string | null;
  mood: string[];
  category: string | null;
  motionPrompt: string | null;
  usageCount: number;
};

// Computed from NOMEAR_PRESETS (cobre os 122 episódios + trailer) em vez de
// hard-coded. Permite usar o /montar para qualquer ep, não só ep01-10.
//
// epKey: "trailer" | "ep01" | "ep02" | ... (prefixo usado nos ids dos prompts
//        e nos nomes de ficheiros em youtube/clips/).
type Episode = { key: string; slug: string; label: string };

// Funil Nomear = trailer + ep01..epNN (expande conforme a user adiciona eps).
// Exclui placeholders "serie-X" e categorias soltas ("sagrado", "silencio",
// "nua", "fome") que existem no NOMEAR_PRESETS mas NÃO são episódios.
// Filtro: parts[1] tem de matchar /^(trailer|ep\d+)$/.
const EPISODE_KEY_RE = /^(trailer|ep\d+)$/;
const EPISODES: Episode[] = (() => {
  const byKey = new Map<string, Episode>();
  for (const preset of NOMEAR_PRESETS) {
    for (const script of preset.scripts) {
      const parts = script.id.split("-");
      const epKey = parts[1] ?? "";
      if (!EPISODE_KEY_RE.test(epKey)) continue;
      if (byKey.has(epKey)) continue; // primeira ocorrência por chave
      const label =
        epKey === "trailer"
          ? `Trailer — ${script.titulo}`
          : `${epKey} — ${script.titulo}`;
      byKey.set(epKey, { key: epKey, slug: script.id, label });
    }
  }
  // Ordem natural: trailer primeiro, depois ep01, ep02, ... pelo número
  return Array.from(byKey.values()).sort((a, b) => {
    if (a.key === "trailer") return -1;
    if (b.key === "trailer") return 1;
    const na = parseInt(a.key.replace("ep", ""), 10);
    const nb = parseInt(b.key.replace("ep", ""), 10);
    return na - nb;
  });
})();

const supabasePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export default function FunilMontarPage() {
  const [epKey, setEpKey] = useState<string>("trailer");
  const ep = EPISODES.find((e) => e.key === epKey) ?? EPISODES[0];

  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [allAudios, setAllAudios] = useState<Audio[]>([]);
  const [allSrts, setAllSrts] = useState<Audio[]>([]);
  const [allVideos, setAllVideos] = useState<Audio[]>([]);
  const [allThumbs, setAllThumbs] = useState<Audio[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedNarration, setSelectedNarration] = useState<string>("");
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [clipOrder, setClipOrder] = useState<string[]>([]);

  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [engine, setEngine] = useState<"ffmpeg" | "shotstack">("ffmpeg");
  const [srtGenerating, setSrtGenerating] = useState(false);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  const [srtErr, setSrtErr] = useState<string | null>(null);
  const [thumbGenerating, setThumbGenerating] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [thumbErr, setThumbErr] = useState<string | null>(null);

  // ── Pool & reuse ──────────────────────────────────────────────────────
  // Pool = clips de todos os eps já renderizados (podem ser reutilizados em
  // eps posteriores para não gastar subscrição Midjourney/Runway a regerar
  // imagens semelhantes). `reuseExists` distingue clipOrder vindo da pool
  // (fixado pelo user) de clipOrder default (auto-filtered pelo prefixo).
  const [pool, setPool] = useState<PoolClip[]>([]);
  const [poolOpen, setPoolOpen] = useState(false);
  const [poolQuery, setPoolQuery] = useState("");
  const [poolMoodFilter, setPoolMoodFilter] = useState<string>("");
  const [poolEpFilter, setPoolEpFilter] = useState<string>("");
  const [reuseExists, setReuseExists] = useState(false);
  const [savingReuse, setSavingReuse] = useState(false);
  const [reuseInfo, setReuseInfo] = useState<string | null>(null);

  // Prompts do funil (para sobrepôr reuseClipId ao default clipOrder).
  // Quando um prompt para ep11 tem reuseClipId apontado para ep03, o clip
  // do ep03 é incluído automaticamente na ordem do ep11 (antes de o user
  // ter de abrir a pool).
  type FunilPrompt = {
    id: string;
    category: string;
    mood: string[];
    prompt: string;
    reuseClipId?: string;
    reuseClipUrl?: string;
  };
  const [funilPrompts, setFunilPrompts] = useState<FunilPrompt[]>([]);

  // ── Audio stretching ──────────────────────────────────────────────────
  // Três alavancas para alongar vídeos curtos (áudios <2min) sem re-gravar:
  //   narrationLeadIn: música+imagem só, antes da voz entrar (após intro brand)
  //   outroHold:       música+imagem só, depois da voz acabar (antes do outro)
  //   narrationAtempo: abranda a narração (0.88-1.0) mantendo pitch
  // Persistidos em Supabase para que re-render use os mesmos valores.
  const [narrationLeadIn, setNarrationLeadIn] = useState(0);
  const [outroHold, setOutroHold] = useState(0);
  const [narrationAtempo, setNarrationAtempo] = useState(1);

  // ── Load assets on mount ──────────────────────────────────────────────
  // Todos os assets são carregados de Supabase → muda de dispositivo, abre
  // a página, os vídeos/SRT/thumbs renderizados antes aparecem prontos.
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/thinkdiffusion/list-clips").then((r) => r.json()),
      fetch("/api/admin/biblioteca/list?folder=youtube&limit=500").then((r) => r.json()),
      fetch("/api/admin/music/list-album?album=ancient-ground").then((r) => r.json()),
      // SRTs em cache (geradas previamente via "Gerar legenda SRT").
      fetch("/api/admin/biblioteca/list?folder=youtube/subtitles&limit=500").then((r) => r.json()),
      // Vídeos MP4 finais já renderizados.
      fetch("/api/admin/biblioteca/list?folder=youtube/funil-videos&limit=500").then((r) => r.json()),
      // Thumbnails PNG já geradas.
      fetch("/api/admin/biblioteca/list?folder=youtube/thumbnails&limit=500").then((r) => r.json()),
    ])
      .then(([clipsD, audiosD, musicD, srtsD, videosD, thumbsD]) => {
        setAllClips(Array.isArray(clipsD.clips) ? clipsD.clips : []);
        setAllAudios(
          (Array.isArray(audiosD.files) ? audiosD.files : []).filter((f: Audio) =>
            f.name.endsWith(".mp3"),
          ),
        );
        setTracks(Array.isArray(musicD.tracks) ? musicD.tracks : []);
        setAllSrts(
          (Array.isArray(srtsD.files) ? srtsD.files : []).filter((f: Audio) =>
            f.name.endsWith(".srt"),
          ),
        );
        setAllVideos(
          (Array.isArray(videosD.files) ? videosD.files : []).filter((f: Audio) =>
            f.name.endsWith(".mp4"),
          ),
        );
        setAllThumbs(
          (Array.isArray(thumbsD.files) ? thumbsD.files : []).filter((f: Audio) =>
            /\.(png|jpe?g)$/i.test(f.name),
          ),
        );
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // SRT cached para o episódio actual. Se existir, render usa-o sem custo
  // ElevenLabs Scribe. Se não existir, o user clica "Gerar SRT" (custo único
  // por episódio: ~$0.04 trailer / ~$0.30 ep completo).
  const epCachedSrt = useMemo(() => {
    const prefix = `${epKey}-`;
    const matches = allSrts.filter((s) => s.name.startsWith(prefix));
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allSrts, epKey]);

  // Vídeo final renderizado em cache. Match por slug do título OU epKey
  // (convenção actual do render-funil.mjs gera `<slug>-<ts>.mp4` onde
  // slug é derivado de ep.label). Fallback para epKey.
  const epCachedVideo = useMemo(() => {
    const script = findScriptById(ep.slug);
    const slug = script ? titleToSlug(script.titulo) : "";
    const matches = allVideos.filter(
      (v) =>
        (slug && v.name.startsWith(`${slug}-`)) ||
        v.name.startsWith(`${epKey}-`) ||
        // fallback: ep.label lowercase slug
        v.name.startsWith(`${ep.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-`),
    );
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allVideos, ep.slug, ep.label, epKey]);

  // Thumbnail em cache. Convenção: `<epKey>-<ts>.png` (filename=ep.key).
  const epCachedThumb = useMemo(() => {
    const prefix = `${epKey}-`;
    const matches = allThumbs.filter((t) => t.name.startsWith(prefix));
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allThumbs, epKey]);

  // ── Filter assets by episode ──────────────────────────────────────────
  //
  // Default clipOrder para o episódio, montado em 3 camadas:
  //   1. Prompts deste ep (id-sorted) — para cada prompt:
  //      - tem reuseClipId → usa o clipUrl reciclado (de outro ep)
  //      - caso contrário  → procura `nomear-<ep>-<slot>-<slug>.mp4` em allClips
  //   2. Se não houver prompts para este ep, cai para filtro por prefixo
  //      (comportamento legado: simplesmente lista todos os clips do ep).
  //   3. O reuse map manual (secção "4. Clips" em Supabase) sobrescreve isto
  //      depois via /reuse/load (ver useEffect abaixo).
  const epClips = useMemo(() => {
    const prefix = epKey === "trailer" ? "nomear-trailer-" : `nomear-${epKey}-`;
    const epPromptList = funilPrompts
      .filter((p) => p.id.startsWith(prefix))
      .sort((a, b) => a.id.localeCompare(b.id));

    if (epPromptList.length > 0) {
      // Montar clipOrder baseado nos prompts, respeitando reuseClipId.
      const byBaseName = new Map(
        allClips.map((c) => [c.name.replace(/\.mp4$/i, ""), c] as const),
      );
      const order: Clip[] = [];
      for (const prompt of epPromptList) {
        if (prompt.reuseClipId && prompt.reuseClipUrl) {
          // Clip reciclado de outro ep. Nome extraído do id do prompt-fonte.
          order.push({
            name: `${prompt.reuseClipId}.mp4`,
            url: prompt.reuseClipUrl,
          });
        } else {
          // Clip gerado localmente. Só incluir se já existir.
          const hit = byBaseName.get(prompt.id);
          if (hit) order.push(hit);
        }
      }
      return order;
    }

    // Fallback legado: prompts ainda não carregados OU ep sem prompts.
    return allClips
      .filter((c) => c.name.startsWith(prefix))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allClips, epKey, funilPrompts]);

  const epNarration = useMemo(() => {
    // audio-bulk saves with filename = `${slug-of-title}-${timestamp}.mp3`
    const script = findScriptById(ep.slug);
    if (!script) return null;
    const titleSlug = titleToSlug(script.titulo);
    const prefix = `${titleSlug}-`;
    const matches = allAudios.filter(
      (a) => a.name.startsWith(prefix) || a.name === `${titleSlug}.mp3`,
    );
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allAudios, ep.slug]);

  // Auto-set default narration + clip order when ep changes
  // Todos os artefactos (vídeo, SRT, thumb) são lidos de Supabase →
  // muda-se de dispositivo e aparecem prontos sem re-render nem re-gerar.
  //
  // Se existir reuse map persistido para este ep (clips fixados/reutilizados
  // pelo user), esse vence sobre o filtro default nomear-<ep>-*. Reuse map
  // é carregado abaixo e, se presente, sobrescreve clipOrder.
  useEffect(() => {
    setSelectedNarration(epNarration?.url ?? "");
    setClipOrder(epClips.map((c) => c.url));
    setVideoUrl(epCachedVideo?.url ?? null);
    setProgress(null);
    setSrtUrl(epCachedSrt?.url ?? null);
    setSrtErr(null);
    setThumbUrl(epCachedThumb?.url ?? null);
    setThumbErr(null);
    setReuseInfo(null);
  }, [epNarration, epClips, epCachedSrt, epCachedVideo, epCachedThumb]);

  // Carregar pool uma vez (shared across episodes).
  useEffect(() => {
    fetch("/api/admin/funil/pool", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.clips)) setPool(d.clips);
      })
      .catch(() => {});
  }, []);

  // Carregar prompts do funil (para aplicar reuseClipId ao default clipOrder).
  useEffect(() => {
    fetch("/api/admin/prompts/funil/load", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.prompts)) setFunilPrompts(d.prompts);
      })
      .catch(() => {});
  }, []);

  // Carregar reuse map do episódio actual. Se existir, sobrescreve clipOrder
  // (user fixou ordem/reutilizações específicas para este ep).
  useEffect(() => {
    fetch(`/api/admin/funil/reuse/load?episode=${encodeURIComponent(epKey)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.exists && Array.isArray(d.clipOrder) && d.clipOrder.length > 0) {
          setClipOrder(d.clipOrder);
          setReuseExists(true);
          setReuseInfo(`Ordem fixada (${d.clipOrder.length} clips)`);
        } else {
          setReuseExists(false);
        }
      })
      .catch(() => setReuseExists(false));
  }, [epKey]);

  // Auto-guarda reuse map: sempre que clipOrder muda por acção do user
  // (adicionar pool, reordenar, remover), persiste em Supabase para o
  // próximo dispositivo / re-render.
  const persistReuse = useCallback(
    async (nextOrder: string[]) => {
      setSavingReuse(true);
      try {
        const r = await fetch("/api/admin/funil/reuse/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episode: epKey, clipOrder: nextOrder }),
        });
        const d = await r.json();
        if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
        setReuseExists(nextOrder.length > 0);
        setReuseInfo(
          nextOrder.length === 0
            ? "Ordem default restaurada"
            : `${nextOrder.length} clips fixados`,
        );
      } catch (e) {
        setReuseInfo(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setSavingReuse(false);
      }
    },
    [epKey],
  );

  // Auto-pick single first track (one track covers full funnel video duration)
  useEffect(() => {
    if (tracks.length > 0 && selectedMusic.length === 0) {
      setSelectedMusic([tracks[0].url]);
    }
  }, [tracks, selectedMusic.length]);

  const moveClip = useCallback(
    (from: number, to: number) => {
      setClipOrder((prev) => {
        if (to < 0 || to >= prev.length) return prev;
        const next = [...prev];
        const [x] = next.splice(from, 1);
        next.splice(to, 0, x);
        persistReuse(next);
        return next;
      });
    },
    [persistReuse],
  );

  const removeClip = useCallback(
    (idx: number) => {
      setClipOrder((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        persistReuse(next);
        return next;
      });
    },
    [persistReuse],
  );

  const addFromPool = useCallback(
    (url: string) => {
      setClipOrder((prev) => {
        if (prev.includes(url)) return prev;
        const next = [...prev, url];
        persistReuse(next);
        return next;
      });
    },
    [persistReuse],
  );

  const resetToDefault = useCallback(async () => {
    // Apaga reuse map: clipOrder volta ao filtro default nomear-<ep>-*
    setClipOrder(epClips.map((c) => c.url));
    await persistReuse([]);
  }, [epClips, persistReuse]);

  // ── Render ────────────────────────────────────────────────────────────
  const render = async () => {
    if (clipOrder.length === 0) return setErr("Sem clips.");
    if (!selectedNarration) return setErr("Sem narração seleccionada.");
    if (selectedMusic.length === 0) return setErr("Sem música seleccionada.");

    setRendering(true);
    setErr(null);
    setVideoUrl(null);
    setProgress({ percent: 0, label: "A iniciar..." });

    try {
      if (engine === "ffmpeg") {
        // FFmpeg em GitHub Actions — mesmo padrão do Ancient Ground e Shorts.
        setProgress({ percent: 5, label: "A despachar GitHub Actions..." });
        const submitRes = await fetch("/api/admin/funil/render-funil-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: ep.label,
            clips: clipOrder,
            clipDuration: 10,
            narrationUrl: selectedNarration,
            musicUrls: selectedMusic,
            musicVolume,
            // SRT (opcional). Se vazio, render passa sem legendas. Se já
            // existia em cache para o epKey, foi pré-preenchido pelo useEffect.
            subtitlesUrl: srtUrl || undefined,
            // Alongar duração sem re-gravar narração:
            //   lead-in = música-só após intro brand e antes da voz entrar
            //   outro hold = música-só após a voz acabar, antes do outro brand
            //   atempo = abrandar narração (preserva pitch)
            narrationLeadIn,
            outroHold,
            narrationAtempo,
          }),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.jobId) {
          throw new Error(submitData.erro || `HTTP ${submitRes.status}`);
        }

        while (true) {
          await new Promise((r) => setTimeout(r, 10_000));
          let data: {
            status?: string;
            phase?: string;
            progress?: number;
            videoUrl?: string;
            error?: string;
            erro?: string;
          };
          try {
            const r = await fetch(`/api/admin/funil/render-funil-status?jobId=${encodeURIComponent(submitData.jobId)}`);
            data = await r.json();
          } catch {
            setProgress({ percent: 0, label: "Ligação perdida — a tentar de novo..." });
            continue;
          }
          if (data.erro) throw new Error(data.erro);
          const status = data.status || "...";
          const phase = data.phase ? ` (${data.phase})` : "";
          setProgress({
            percent: typeof data.progress === "number" ? data.progress : 0,
            label: `${status}${phase}`,
          });
          if (status === "failed") throw new Error(data.error || "FFmpeg render failed.");
          if (status === "done" && data.videoUrl) {
            setVideoUrl(data.videoUrl);
            setProgress({ percent: 100, label: "Vídeo pronto!" });
            break;
          }
        }
      } else {
        // Shotstack fallback — SSE stream original
        const endpoint = "/api/admin/funil/render";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: ep.label,
            clips: clipOrder,
            clipDuration: 10,
            narrationUrl: selectedNarration,
            musicUrls: selectedMusic,
            musicVolume,
          }),
        });

        if (!res.body) throw new Error("Sem stream.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const data = line.replace(/^data: /, "").trim();
            if (!data) continue;
            try {
              const ev = JSON.parse(data);
              if (ev.type === "progress") setProgress({ percent: ev.percent, label: ev.label });
              if (ev.type === "result") setVideoUrl(ev.videoUrl);
              if (ev.type === "error") setErr(ev.message);
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRendering(false);
    }
  };

  if (loading) return <p className="text-xs text-escola-creme-50">A carregar...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Funil — Montar vídeo
          </h2>
          <p className="mt-1 text-xs text-escola-creme-50">
            Clips + narração ElevenLabs + Ancient Ground de fundo → MP4.
          </p>
        </div>
        <Link href="/admin/producao/funil" className="text-xs text-escola-creme-50 hover:text-escola-creme">
          ← voltar
        </Link>
      </div>

      {err && <p className="mb-3 text-xs text-escola-terracota">{err}</p>}

      {/* ── 1. Episode ───────────────────────────────────────────── */}
      <EpisodePicker
        episodes={EPISODES}
        epKey={epKey}
        setEpKey={setEpKey}
        allClips={allClips}
        allVideos={allVideos}
        funilPrompts={funilPrompts}
      />

      {/* ── 2. Narration ─────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">2. Narração ElevenLabs</h3>
        {epNarration ? (
          <>
            <div className="flex items-center gap-3">
              <audio src={selectedNarration} controls className="flex-1 max-w-md" />
              <span className="text-xs text-escola-creme-50">{epNarration.name}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={async () => {
                  setSrtGenerating(true);
                  setSrtErr(null);
                  try {
                    const r = await fetch("/api/admin/funil/generate-srt", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        narrationUrl: selectedNarration,
                        scriptId: ep.slug,
                        filename: ep.key,
                      }),
                    });
                    const d = await r.json();
                    if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
                    setSrtUrl(d.url);
                    // Push para a lista local para futuros mounts/eps
                    if (d.url) {
                      const name = d.url.split("/").pop() || `${ep.key}-${Date.now()}.srt`;
                      setAllSrts((prev) => [{ name, url: d.url }, ...prev]);
                    }
                  } catch (e) {
                    setSrtErr(e instanceof Error ? e.message : String(e));
                  } finally {
                    setSrtGenerating(false);
                  }
                }}
                disabled={srtGenerating || !selectedNarration}
                className="rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
              >
                {srtGenerating
                  ? "A gerar SRT..."
                  : srtUrl
                    ? "↻ Regenerar SRT (paga ElevenLabs outra vez)"
                    : `Gerar SRT (ElevenLabs Scribe · ~$0.04 trailer / ~$0.30 ep)`}
              </button>
              {srtUrl && (
                <>
                  <span className="rounded bg-escola-dourado/10 px-3 py-1.5 text-escola-dourado">
                    ✓ SRT em cache · será queimada no vídeo
                  </span>
                  <a
                    href={srtUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-escola-creme-50 underline hover:text-escola-creme"
                  >
                    abrir SRT
                  </a>
                </>
              )}
              {!srtUrl && !srtGenerating && (
                <span className="text-escola-creme-50">
                  Sem SRT — render passa sem legendas. Clica para gerar uma vez (cache).
                </span>
              )}
              {srtErr && <span className="text-escola-terracota">{srtErr}</span>}
            </div>
            <p className="mt-1 text-[10px] text-escola-creme-50">
              SRT gerada uma vez e cacheada em Supabase — re-renders deste episódio
              não voltam a pagar Scribe. Para upload manual no YouTube Studio,
              clica &quot;abrir SRT&quot;.
            </p>
          </>
        ) : (
          <p className="text-xs text-escola-terracota">
            Sem áudio Nomear no Supabase para <code>{ep.slug}</code>. Gera em /admin/producao/audios primeiro.
          </p>
        )}
      </section>

      {/* ── 3. Music ─────────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">3. Música Ancient Ground (fundo)</h3>
        <div className="mb-2 flex items-center gap-3 text-xs">
          <label className="text-escola-creme-50">Volume:</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="flex-1 max-w-xs"
          />
          <span className="text-escola-creme">{Math.round(musicVolume * 100)}%</span>
        </div>
        <select
          value={selectedMusic[0] ?? ""}
          onChange={(e) => setSelectedMusic(e.target.value ? [e.target.value] : [])}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-2 text-xs text-escola-creme"
        >
          <option value="">— escolhe uma faixa —</option>
          {tracks.map((t) => (
            <option key={t.url} value={t.url}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-escola-creme-50">
          Uma faixa só. Trocar a meio distrai da narração. AG dura ~3-5 min, cobre o vídeo todo.
        </p>
      </section>

      {/* ── Preview timeline ─────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">Preview — ordem de montagem</h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Intro e outro com mandala + texto brand são adicionados automaticamente no render.
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <BrandCard
            label="Intro · 5s"
            sublabel="A ESCOLA DOS VÉUS"
            src={`${supabasePublicUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`}
          />
          {clipOrder.map((url, i) => {
            const name = allClips.find((c) => c.url === url)?.name ?? "?";
            return (
              <div key={url} className="shrink-0 overflow-hidden rounded border border-escola-border">
                <video src={url} className="h-[90px] w-40 object-cover" muted />
                <p className="truncate border-t border-escola-border bg-escola-bg px-1.5 py-0.5 text-[9px] text-escola-creme-50">
                  {i + 1}. {name.replace(/\.mp4$/, "").replace(/^nomear-\w+-\d+-/, "")}
                </p>
              </div>
            );
          })}
          <BrandCard
            label="Outro · 5s"
            sublabel="A ESCOLA DOS VÉUS · seteveus.space"
            src={`${supabasePublicUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`}
          />
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          Total estimado: ~{5 + clipOrder.length * 9.5 + 5}s (intro 5s + {clipOrder.length} clips × ~9.5s + outro 5s)
        </p>
      </section>

      {/* ── 4. Clips ─────────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm text-escola-creme">4. Clips ({clipOrder.length})</h3>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-escola-creme-50">
              {allClips.length} em Supabase · {epClips.length} para{" "}
              <code>nomear-{epKey}-</code>
              {loading && " · a carregar..."}
            </span>
            {savingReuse && <span className="text-escola-creme-50">a guardar…</span>}
            {reuseInfo && !savingReuse && (
              <span className="text-escola-dourado">{reuseInfo}</span>
            )}
            {reuseExists && (
              <button
                onClick={resetToDefault}
                className="rounded border border-escola-border px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
                title="Apaga ordem fixada, volta ao filtro default nomear-<ep>-*"
              >
                ↺ default
              </button>
            )}
          </div>
        </div>
        {clipOrder.length === 0 ? (
          <div className="space-y-1 text-xs text-escola-terracota">
            <p>
              Sem clips para <code>{ep.slug}</code>. Gera em{" "}
              <code>/admin/producao/funil/gerar</code>
              <strong> ou adiciona da pool abaixo</strong>.
            </p>
            {allClips.length === 0 && !loading && (
              <p className="text-escola-creme-50">
                ⚠ Nenhum clip em Supabase — o endpoint list-clips pode estar
                lento ou bloqueado. Recarrega a página.
              </p>
            )}
            {allClips.length > 0 && epClips.length === 0 && (
              <p className="text-escola-creme-50">
                ⚠ Há {allClips.length} clips em Supabase mas nenhum começa com{" "}
                <code>nomear-{epKey}-</code>. Verifica os nomes:{" "}
                {allClips
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(", ")}
                {allClips.length > 3 && "..."}
              </p>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {clipOrder.map((url, i) => {
              const name = allClips.find((c) => c.url === url)?.name ?? "?";
              const baseId = name.replace(/\.mp4$/, "");
              const sourceEp = baseId.split("-")[1] ?? "";
              const isReused = sourceEp && sourceEp !== epKey;
              return (
                <li key={url} className="overflow-hidden rounded border border-escola-border">
                  <div className="relative">
                    <video src={url} className="aspect-video w-full" muted />
                    {isReused && (
                      <span className="absolute left-1 top-1 rounded bg-escola-dourado/90 px-1.5 py-0.5 text-[9px] font-semibold text-escola-bg">
                        ♻ {sourceEp}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 border-t border-escola-border bg-escola-bg px-2 py-1 text-[10px]">
                    <span className="truncate text-escola-creme-50" title={name}>
                      {i + 1}. {name}
                    </span>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => moveClip(i, i - 1)}
                        disabled={i === 0}
                        className="rounded border border-escola-border px-1 text-escola-creme disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveClip(i, i + 1)}
                        disabled={i === clipOrder.length - 1}
                        className="rounded border border-escola-border px-1 text-escola-creme disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeClip(i)}
                        title="Remover do episódio"
                        className="rounded border border-escola-border px-1 text-escola-terracota hover:bg-escola-terracota/10"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── 4b. Pool de clips reutilizáveis ─────────────────────── */}
      <PoolBrowser
        pool={pool}
        currentEp={epKey}
        clipOrder={clipOrder}
        open={poolOpen}
        setOpen={setPoolOpen}
        query={poolQuery}
        setQuery={setPoolQuery}
        moodFilter={poolMoodFilter}
        setMoodFilter={setPoolMoodFilter}
        epFilter={poolEpFilter}
        setEpFilter={setPoolEpFilter}
        onAdd={addFromPool}
      />

      {/* ── 4c. Esticar duração ─────────────────────────────────── */}
      <StretchControls
        narrationLeadIn={narrationLeadIn}
        setNarrationLeadIn={setNarrationLeadIn}
        outroHold={outroHold}
        setOutroHold={setOutroHold}
        narrationAtempo={narrationAtempo}
        setNarrationAtempo={setNarrationAtempo}
      />

      {/* ── 5. Render ────────────────────────────────────────────── */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-3 flex items-center gap-4 text-xs">
          <span className="text-escola-creme-50">Motor:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={engine === "ffmpeg"}
              onChange={() => setEngine("ffmpeg")}
            />
            <span className="text-escola-creme">FFmpeg · grátis <span className="text-escola-creme-50">(GitHub Actions · ducking automático)</span></span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={engine === "shotstack"}
              onChange={() => setEngine("shotstack")}
            />
            <span className="text-escola-creme-50">Shotstack · ~$0.20</span>
          </label>
        </div>
        <button
          onClick={render}
          disabled={rendering || clipOrder.length === 0 || !selectedNarration || selectedMusic.length === 0}
          className="w-full rounded bg-escola-coral px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {rendering ? "A montar..." : `5. Montar vídeo (${engine === "ffmpeg" ? "FFmpeg" : "Shotstack"})`}
        </button>

        {progress && (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded bg-escola-bg">
              <div
                className="h-full bg-escola-dourado transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-escola-creme-50">
              {progress.percent}% · {progress.label}
            </p>
          </div>
        )}

        {videoUrl && (
          <div className="mt-4 rounded border border-escola-dourado bg-escola-bg p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-escola-dourado">✓ Vídeo pronto</p>
              <VideoStamp url={videoUrl} />
            </div>
            <video src={videoUrl} className="w-full rounded" controls />
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              abrir URL ↗
            </a>
          </div>
        )}
      </section>

      {/* ── 6. Thumbnail YouTube ─────────────────────────────────── */}
      <ThumbnailSection
        videoUrl={videoUrl}
        epLabel={ep.label}
        epKey={ep.key}
        thumbUrl={thumbUrl}
        setThumbUrl={setThumbUrl}
        thumbGenerating={thumbGenerating}
        setThumbGenerating={setThumbGenerating}
        thumbErr={thumbErr}
        setThumbErr={setThumbErr}
        onGenerated={(url, name) => setAllThumbs((prev) => [{ name, url }, ...prev])}
      />

      {/* ── 7. Publicar no YouTube ────────────────────────────────── */}
      {videoUrl && (
        <PublishSection
          videoUrl={videoUrl}
          srtUrl={srtUrl}
          thumbUrl={thumbUrl}
          epLabel={ep.label}
          epKey={ep.key}
          episodeText={findScriptById(ep.slug)?.texto ?? ""}
        />
      )}
    </div>
  );
}

// ─── VideoStamp ─────────────────────────────────────────────────────────────
// Mostra a data/hora do render actual (lido do filename `-<ms>.mp4`) e
// badge "mais recente" se este é o MP4 mais novo em Supabase para o slug.
// Ajuda a user a saber se está a ver a versão certa sem abrir URL.

function VideoStamp({ url }: { url: string }) {
  const filename = decodeURIComponent(url.split("/").pop() || "");
  const m = filename.match(/-(\d{13})\.mp4$/);
  if (!m) {
    return <span className="text-[10px] text-escola-creme-50">{filename}</span>;
  }
  const ts = parseInt(m[1], 10);
  const d = new Date(ts);
  const now = Date.now();
  const ageMs = now - ts;
  const ageMin = Math.floor(ageMs / 60_000);
  const ageH = Math.floor(ageMs / 3_600_000);

  const rel =
    ageMs < 60_000
      ? "agora mesmo"
      : ageMin < 60
        ? `há ${ageMin} min`
        : ageH < 24
          ? `há ${ageH} h`
          : d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
  const hhmm = d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // "fresco" = renderizado há < 10 min → verde, provavelmente o render actual
  const fresh = ageMs < 10 * 60_000;

  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] ${
        fresh
          ? "bg-escola-dourado/20 text-escola-dourado"
          : "bg-escola-border/40 text-escola-creme-50"
      }`}
      title={filename}
    >
      {fresh ? "🟢 " : "📅 "}
      {rel} · {hhmm}
    </span>
  );
}

// ─── Publish Section ────────────────────────────────────────────────────────
// Organiza TUDO num sítio: download + partilhar (mobile) + campos
// pré-preenchidos copy-to-clipboard + link direto para YouTube Studio.
// Desenhado para minimizar cliques: 3 passos, visíveis, numerados.

function buildYoutubeMetadata(epLabel: string, episodeText: string) {
  // Título: "ep01 — A culpa | Nomear · A Escola dos Véus" (máx 100 chars)
  const cleanLabel = epLabel.replace(/^(\w+)\s*—\s*/, (_m, pref) => `${pref} · `);
  const title = `${cleanLabel} | Nomear · A Escola dos Véus`.slice(0, 100);

  // Descrição: texto do episódio + CTA + hashtags
  const cta = [
    "",
    "━━━━━━━━━━━━━━━━",
    "A Escola dos Véus é um espaço para mulheres que querem nomear o que nunca teve nome.",
    "",
    "→ Subscreve para receberes novos episódios da série Nomear.",
    "→ Junta-te à escola: https://seteveus.space",
    "",
    "#EscolaDosVéus #Nomear #Mulheres #Consciência #Herança",
  ].join("\n");

  // Remove marcações [long pause] / [pause] / CTA duplicado do script
  const body = episodeText
    .replace(/\[(long pause|pause)\]/gi, "")
    .replace(/Escola dos Véus\.\s*seteveus\.space\.?/gi, "")
    .replace(/Se isto te nomeou alguma coisa[^.]*\./gi, "")
    .trim();

  const description = `${body}\n${cta}`.slice(0, 5000);

  // Tags
  const tags = [
    "escola dos véus",
    "nomear",
    "mulheres",
    "consciência",
    "herança",
    "dinheiro",
    "culpa",
    "vergonha",
    "autoconhecimento",
    "vivianne nascimento",
  ];

  return { title, description, tags };
}

async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

async function nativeShareFile(url: string, filename: string, title: string) {
  const nav = navigator as Navigator & {
    share?: (d: { title?: string; files?: File[]; url?: string }) => Promise<void>;
    canShare?: (d: { files?: File[] }) => boolean;
  };
  const res = await fetch(url);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "video/mp4" });
  if (nav.canShare?.({ files: [file] })) {
    await nav.share?.({ title, files: [file] });
    return true;
  }
  if (nav.share) {
    await nav.share({ title, url });
    return true;
  }
  return false;
}

function PublishSection({
  videoUrl,
  srtUrl,
  thumbUrl,
  epLabel,
  epKey,
  episodeText,
}: {
  videoUrl: string;
  srtUrl: string | null;
  thumbUrl: string | null;
  epLabel: string;
  epKey: string;
  episodeText: string;
}) {
  const meta = useMemo(
    () => buildYoutubeMetadata(epLabel, episodeText),
    [epLabel, episodeText],
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const canShare =
    typeof navigator !== "undefined" &&
    !!(navigator as Navigator & { share?: unknown }).share;

  const doCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const baseFilename = `${epKey}-escola-veus`;

  return (
    <section className="mt-4 rounded-xl border border-escola-dourado/40 bg-escola-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-escola-dourado">
          7. Publicar no YouTube
        </h3>
        <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
          manual · 3 passos
        </span>
      </div>

      {/* Passo 1: Descarregar / Partilhar ficheiros */}
      <div className="mb-4 rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">
            1
          </span>
          Guardar ficheiros no teu dispositivo
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => downloadBlob(videoUrl, `${baseFilename}.mp4`)}
            className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
          >
            ⬇ MP4 (vídeo)
          </button>
          {canShare && (
            <button
              onClick={async () => {
                try {
                  setShareMsg("A abrir partilha...");
                  const ok = await nativeShareFile(
                    videoUrl,
                    `${baseFilename}.mp4`,
                    meta.title,
                  );
                  setShareMsg(ok ? "Partilha aberta" : "Sem suporte neste dispositivo");
                } catch {
                  setShareMsg("Cancelado");
                } finally {
                  setTimeout(() => setShareMsg(null), 2000);
                }
              }}
              className="rounded border border-escola-dourado px-3 py-2 font-semibold text-escola-dourado"
              title="No mobile abre o sheet de partilha (YouTube Studio, TikTok, IG)"
            >
              ↗ Partilhar MP4
            </button>
          )}
          {srtUrl && (
            <button
              onClick={() => downloadBlob(srtUrl, `${baseFilename}.srt`)}
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ SRT (legendas)
            </button>
          )}
          {thumbUrl && (
            <button
              onClick={() => downloadBlob(thumbUrl, `${baseFilename}-thumb.png`)}
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ Thumbnail
            </button>
          )}
        </div>
        {shareMsg && (
          <p className="mt-2 text-[10px] text-escola-creme-50">{shareMsg}</p>
        )}
        <p className="mt-2 text-[10px] text-escola-creme-50">
          📱 Mobile: &quot;Partilhar MP4&quot; abre o sheet nativo → escolhe YouTube Studio,
          TikTok ou Instagram. 💻 Desktop: usa &quot;⬇ MP4&quot; e arrasta para o Studio.
        </p>
      </div>

      {/* Passo 2: Abrir YouTube Studio */}
      <div className="mb-4 rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">
            2
          </span>
          Abrir YouTube Studio e fazer upload
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href="https://studio.youtube.com/channel/UC/videos/upload"
            target="_blank"
            rel="noreferrer"
            className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
          >
            → Abrir YouTube Studio Upload
          </a>
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          Arrasta o MP4 para a janela. Depois: Subtitles → Upload file → escolhe o
          .srt. Thumbnail → sobe o PNG. Visibility → Scheduled → sexta 18h Maputo.
        </p>
      </div>

      {/* Passo 3: Copy fields (título / descrição / tags) */}
      <div className="rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">
            3
          </span>
          Copiar campos e colar no Studio
        </p>
        <div className="space-y-2 text-xs">
          <CopyRow
            label={`Título (${meta.title.length}/100)`}
            value={meta.title}
            copied={copied === "title"}
            onCopy={() => doCopy("title", meta.title)}
            rows={1}
            warn={meta.title.length > 100}
          />
          <CopyRow
            label={`Descrição (${meta.description.length}/5000)`}
            value={meta.description}
            copied={copied === "desc"}
            onCopy={() => doCopy("desc", meta.description)}
            rows={6}
            warn={meta.description.length > 5000}
          />
          <CopyRow
            label="Tags (separadas por vírgula)"
            value={meta.tags.join(", ")}
            copied={copied === "tags"}
            onCopy={() => doCopy("tags", meta.tags.join(", "))}
            rows={2}
          />
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          💡 Edita livremente antes de copiar — o título/descrição são só sugestões
          derivadas do script.
        </p>
      </div>

      <details className="mt-4 rounded-lg border border-escola-border bg-escola-bg/50 p-3">
        <summary className="cursor-pointer text-xs text-escola-creme-50 hover:text-escola-creme">
          📱 Partilhar também em TikTok e Instagram Reels (para o shorts, depois)
        </summary>
        <div className="mt-2 space-y-1 text-[11px] text-escola-creme-50">
          <p>
            <b>TikTok</b>: App → + → Upload → seleciona MP4 vertical → caption +
            hashtags → agenda até 10 dias à frente dentro da app.
          </p>
          <p>
            <b>Instagram Reels</b>: App → + → Reel → MP4 → Caption. Agendamento em
            <a
              href="https://business.facebook.com/latest/content_planner"
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-escola-dourado underline"
            >
              Meta Business Suite
            </a>{" "}
            (grátis).
          </p>
          <p>
            As legendas já estão queimadas no MP4 → funcionam automaticamente em
            TikTok e Reels (que não têm CC nativo).
          </p>
        </div>
      </details>

      <p className="mt-3 text-[10px] text-escola-creme-50">
        ⚙️ Quando configurares o Google OAuth, aparece aqui o botão
        &quot;Publicar &amp; agendar automaticamente&quot; — um click faz tudo
        (upload + thumbnail + captions + schedule).
      </p>
    </section>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  rows,
  warn,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  rows: number;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label
          className={`text-[10px] uppercase tracking-wider ${warn ? "text-escola-terracota" : "text-escola-creme-50"}`}
        >
          {label}
        </label>
        <button
          onClick={onCopy}
          className="rounded bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado hover:bg-escola-dourado/20"
        >
          {copied ? "✓ copiado" : "copiar"}
        </button>
      </div>
      <textarea
        value={value}
        readOnly
        rows={rows}
        className="w-full rounded border border-escola-border bg-escola-card px-2 py-1.5 text-[11px] text-escola-creme"
        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
      />
    </div>
  );
}

// ─── Thumbnail Section ──────────────────────────────────────────────────────
// Extrai um frame do VÍDEO FINAL do episódio (não do intro brand — senão
// todas as thumbnails ficavam iguais). Slider permite escolher o segundo.
// Preview do frame actual antes de queimar o texto (para o user validar a
// escolha). Se ainda não há vídeo final, usa intro.mp4 como fallback.

function ThumbnailSection({
  videoUrl,
  epLabel,
  epKey,
  thumbUrl,
  setThumbUrl,
  thumbGenerating,
  setThumbGenerating,
  thumbErr,
  setThumbErr,
  onGenerated,
}: {
  videoUrl: string | null;
  epLabel: string;
  epKey: string;
  thumbUrl: string | null;
  setThumbUrl: (u: string | null) => void;
  thumbGenerating: boolean;
  setThumbGenerating: (b: boolean) => void;
  thumbErr: string | null;
  setThumbErr: (s: string | null) => void;
  onGenerated: (url: string, name: string) => void;
}) {
  // Tempo default: 10s se há vídeo final (após intro 5s + crossfade, já no 1º
  // clip Runway do ep). 2.5s se fallback intro.mp4 (pico de brilho mandala).
  const defaultFrameT = videoUrl ? 10 : 2.5;
  const [frameT, setFrameT] = useState(defaultFrameT);
  const previewRef = useRef<HTMLVideoElement>(null);

  // Ajusta default quando videoUrl aparece (depois de render)
  useEffect(() => {
    setFrameT(videoUrl ? 10 : 2.5);
  }, [videoUrl]);

  // Seek no preview video para o frame escolhido
  useEffect(() => {
    const v = previewRef.current;
    if (v && videoUrl) {
      try { v.currentTime = frameT; } catch { /* ignore */ }
    }
  }, [frameT, videoUrl]);

  const duration = previewRef.current?.duration ?? 0;
  const maxFrameT = duration > 0 ? Math.max(1, Math.floor(duration - 0.5)) : 120;

  return (
    <section className="mt-4 rounded-xl border border-escola-border bg-escola-card p-4">
      <h3 className="mb-2 text-sm text-escola-creme">6. Thumbnail YouTube</h3>
      <p className="mb-3 text-xs text-escola-creme-50">
        {videoUrl
          ? "Frame extraído do TEU vídeo final do episódio. Usa o slider para escolher o momento que melhor representa o ep."
          : "Ainda não há vídeo final renderizado — vai ser usada a mandala brand como fallback. Monta o vídeo primeiro (secção 5) para uma thumbnail única."}
      </p>

      {/* Preview do frame escolhido (antes de queimar o texto) */}
      {videoUrl && (
        <div className="mb-3">
          <video
            ref={previewRef}
            src={videoUrl}
            className="w-full max-w-2xl rounded border border-escola-border"
            muted
            playsInline
            preload="auto"
          />
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-escola-creme-50 whitespace-nowrap">
              Frame: <b className="text-escola-creme">{frameT.toFixed(1)}s</b>
            </span>
            <input
              type="range"
              min="0"
              max={maxFrameT}
              step="0.5"
              value={frameT}
              onChange={(e) => setFrameT(parseFloat(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => {
                const cur = previewRef.current?.currentTime;
                if (typeof cur === "number") setFrameT(+cur.toFixed(1));
              }}
              className="whitespace-nowrap rounded border border-escola-dourado bg-escola-dourado/10 px-2 py-1 text-escola-dourado hover:bg-escola-dourado/20"
              title="Usa o tempo actual do leitor"
            >
              📍 daqui
            </button>
          </div>
          <p className="mt-1 text-[10px] text-escola-creme-50">
            💡 Reproduz o vídeo, pausa no momento que quiseres e clica &quot;📍 daqui&quot;. Ou arrasta o slider.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={async () => {
            setThumbGenerating(true);
            setThumbErr(null);
            try {
              const titulo = epLabel.includes("—")
                ? epLabel.split("—").slice(1).join("—").trim()
                : epLabel;
              const r = await fetch("/api/admin/funil/generate-thumbnail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  titulo,
                  epKey,
                  filename: epKey,
                  videoUrl: videoUrl || undefined,
                  frameTimeSec: frameT,
                }),
              });
              const d = await r.json();
              if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
              setThumbUrl(d.url);
              if (d.url) {
                const name = d.url.split("/").pop() || `${epKey}-${Date.now()}.png`;
                onGenerated(d.url, name);
              }
            } catch (e) {
              setThumbErr(e instanceof Error ? e.message : String(e));
            } finally {
              setThumbGenerating(false);
            }
          }}
          disabled={thumbGenerating}
          className="rounded bg-escola-dourado px-4 py-2 font-semibold text-escola-bg disabled:opacity-50"
        >
          {thumbGenerating
            ? "A gerar..."
            : thumbUrl
              ? "↻ Regenerar com este frame"
              : "Gerar thumbnail deste frame"}
        </button>
        {thumbUrl && (
          <a
            href={thumbUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-escola-dourado/10 px-3 py-1.5 text-escola-dourado hover:bg-escola-dourado/20"
          >
            ✓ abrir / descarregar PNG
          </a>
        )}
        {thumbErr && <span className="text-escola-terracota">{thumbErr}</span>}
      </div>

      {thumbUrl && (
        <div className="mt-3">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-escola-creme-50">
            Thumbnail gerada (1280×720)
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbUrl}
            alt="Thumbnail"
            className="w-full max-w-2xl rounded border border-escola-border"
          />
        </div>
      )}
    </section>
  );
}

function BrandCard({
  label,
  sublabel,
  src,
}: {
  label: string;
  sublabel: string;
  src: string;
}) {
  return (
    <div className="shrink-0 overflow-hidden rounded border-2 border-escola-dourado/40 bg-escola-bg">
      <video
        src={src}
        className="h-[90px] w-40 object-cover"
        muted
        loop
        autoPlay
        playsInline
      />
      <div className="border-t border-escola-dourado/40 bg-escola-dourado/5 px-1.5 py-0.5">
        <p className="truncate text-[9px] font-semibold text-escola-dourado">{label}</p>
        <p className="truncate text-[8px] text-escola-creme-50">{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Episode Picker ──────────────────────────────────────────────────────────
// Suporta 124 eps (trailer + ep01..ep123). Mostra contagem de clips disponíveis
// e "prontidão" do ep (quantos prompts estão reciclados + quantos têm clip
// gerado). Pesquisa + filtro rápido por estado.

function EpisodePicker({
  episodes,
  epKey,
  setEpKey,
  allClips,
  allVideos,
  funilPrompts,
}: {
  episodes: Episode[];
  epKey: string;
  setEpKey: (k: string) => void;
  allClips: Clip[];
  allVideos: Audio[];
  funilPrompts: {
    id: string;
    reuseClipId?: string;
  }[];
}) {
  const [query, setQuery] = useState("");
  const [showOnlyReady, setShowOnlyReady] = useState(false);

  // Contagens por ep (memo para ser rápido).
  const epStats = useMemo(() => {
    const byEp = new Map<
      string,
      { clips: number; prompts: number; reused: number; rendered: boolean }
    >();
    for (const ep of episodes) {
      const prefix = ep.key === "trailer" ? "nomear-trailer-" : `nomear-${ep.key}-`;
      const nClips = allClips.filter((c) => c.name.startsWith(prefix)).length;
      const epPrompts = funilPrompts.filter((p) => p.id.startsWith(prefix));
      const nReused = epPrompts.filter((p) => !!p.reuseClipId).length;
      // Vídeo renderizado = há MP4 em youtube/funil-videos/ que comece com
      // o slug do titulo OU com o epKey (mesma lógica do epCachedVideo).
      const rendered = allVideos.some(
        (v) =>
          v.name.startsWith(`${ep.key}-`) ||
          v.name.startsWith(prefix.replace("nomear-", "")),
      );
      byEp.set(ep.key, {
        clips: nClips,
        prompts: epPrompts.length,
        reused: nReused,
        rendered,
      });
    }
    return byEp;
  }, [episodes, allClips, allVideos, funilPrompts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = episodes;
    if (q) {
      list = list.filter(
        (e) => e.key.includes(q) || e.label.toLowerCase().includes(q),
      );
    }
    if (showOnlyReady) {
      list = list.filter((e) => {
        const st = epStats.get(e.key);
        return st && st.rendered;
      });
    }
    return list;
  }, [episodes, query, showOnlyReady, epStats]);

  const renderedCount = useMemo(() => {
    return episodes.filter((e) => epStats.get(e.key)?.rendered).length;
  }, [episodes, epStats]);

  return (
    <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm text-escola-creme">
          1. Episódio ({episodes.length} total ·{" "}
          <span className="text-escola-dourado">{renderedCount} renderizados</span>)
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[10px] text-escola-creme-50">
            <input
              type="checkbox"
              checked={showOnlyReady}
              onChange={(e) => setShowOnlyReady(e.target.checked)}
            />
            só renderizados
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="pesquisar ep (ep11, vergonha…)"
            className="w-48 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
          />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto rounded border border-escola-border bg-escola-bg/40 p-2">
        <div className="flex flex-wrap gap-1">
          {filtered.map((e) => {
            const st = epStats.get(e.key);
            const active = epKey === e.key;
            const rendered = st?.rendered ?? false;
            return (
              <button
                key={e.key}
                onClick={() => setEpKey(e.key)}
                className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                  active
                    ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                    : rendered
                      ? "border-escola-dourado/40 bg-escola-dourado/5 text-escola-dourado/80 hover:border-escola-dourado"
                      : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
                }`}
                title={
                  e.label +
                  (rendered ? " · vídeo renderizado" : "") +
                  (st ? ` · ${st.clips} clips` : "")
                }
              >
                {rendered && (
                  <span className="mr-0.5 text-escola-dourado" title="vídeo já renderizado">
                    ✓
                  </span>
                )}
                <span className="font-semibold">{e.key}</span>
                {st && st.clips > 0 && (
                  <span className="ml-1 text-[9px] text-escola-creme-50">
                    · {st.clips}
                  </span>
                )}
                {st && st.reused > 0 && (
                  <span
                    className="ml-1 text-[9px] text-escola-dourado"
                    title={`${st.reused} prompts reciclados`}
                  >
                    ♻{st.reused}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="p-2 text-[10px] text-escola-creme-50">
              Nenhum ep bate com &quot;{query}&quot;.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Pool Browser ────────────────────────────────────────────────────────────
// Navegador da pool de clips existentes (todos os eps). Permite reutilizar
// clips já renderizados em novos episódios em vez de gerar imagem MJ + motion
// Runway novos — importante para ep11+ enquanto a subscrição MJ está activa.
//
// Scoring implícito: clips com usageCount alto aparecem com badge, user pode
// evitar puxar o mesmo muitas vezes. Não força reciclagem — só sugere.

function PoolBrowser({
  pool,
  currentEp,
  clipOrder,
  open,
  setOpen,
  query,
  setQuery,
  moodFilter,
  setMoodFilter,
  epFilter,
  setEpFilter,
  onAdd,
}: {
  pool: PoolClip[];
  currentEp: string;
  clipOrder: string[];
  open: boolean;
  setOpen: (b: boolean) => void;
  query: string;
  setQuery: (s: string) => void;
  moodFilter: string;
  setMoodFilter: (s: string) => void;
  epFilter: string;
  setEpFilter: (s: string) => void;
  onAdd: (url: string) => void;
}) {
  // Todos os moods disponíveis na pool — dropdown.
  const allMoods = useMemo(() => {
    const s = new Set<string>();
    for (const c of pool) for (const m of c.mood) s.add(m);
    return [...s].sort();
  }, [pool]);

  // Todos os eps com clips — dropdown.
  const allEps = useMemo(() => {
    const s = new Set<string>();
    for (const c of pool) if (c.episode) s.add(c.episode);
    return [...s].sort((a, b) => {
      const ord = (e: string) =>
        e === "trailer" ? -1 : parseInt(e.replace(/\D/g, ""), 10) || 999;
      return ord(a) - ord(b);
    });
  }, [pool]);

  // Filtros aplicados
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((c) => {
      // Excluir clips do próprio ep (são o default, não reuse)
      if (c.episode === currentEp) return false;
      if (epFilter && c.episode !== epFilter) return false;
      if (moodFilter && !c.mood.includes(moodFilter)) return false;
      if (q) {
        const hay = `${c.clipId} ${c.imagePrompt ?? ""} ${c.mood.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [pool, currentEp, query, moodFilter, epFilter]);

  const inOrder = new Set(clipOrder);

  return (
    <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm text-escola-creme">
            4b. Pool de clips reutilizáveis ({pool.length} na pool)
          </h3>
          <p className="text-[10px] text-escola-creme-50">
            Evita regerar imagens MJ/Runway — reutiliza clips de episódios anteriores.
          </p>
        </div>
        <span className="text-escola-creme-50">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="pesquisar (gota, corda, vidro, cortina…)"
              className="flex-1 min-w-[200px] rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
            />
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
            >
              <option value="">todos os moods</option>
              {allMoods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={epFilter}
              onChange={(e) => setEpFilter(e.target.value)}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
            >
              <option value="">todos os eps</option>
              {allEps.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            {(query || moodFilter || epFilter) && (
              <button
                onClick={() => {
                  setQuery("");
                  setMoodFilter("");
                  setEpFilter("");
                }}
                className="rounded border border-escola-border px-2 py-1.5 text-escola-creme-50 hover:text-escola-creme"
              >
                limpar
              </button>
            )}
          </div>

          <p className="text-[10px] text-escola-creme-50">
            {filtered.length} de {pool.length} clips · clips do próprio ep
            <code className="mx-1">{currentEp}</code> ficam ocultos (não é reuse).
          </p>

          {filtered.length === 0 ? (
            <p className="text-xs text-escola-creme-50">
              Sem clips para mostrar com estes filtros.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((c) => {
                const alreadyIn = inOrder.has(c.clipUrl);
                const highUse = c.usageCount >= 2;
                return (
                  <li
                    key={c.clipId}
                    className="overflow-hidden rounded border border-escola-border bg-escola-bg"
                  >
                    <div className="relative">
                      <video
                        src={c.clipUrl}
                        className="aspect-video w-full"
                        muted
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const v = e.currentTarget as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                      <span className="absolute left-1 top-1 rounded bg-escola-bg/80 px-1.5 py-0.5 text-[9px] text-escola-creme-50">
                        {c.episode}
                      </span>
                      {c.usageCount > 0 && (
                        <span
                          className={`absolute right-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                            highUse
                              ? "bg-escola-terracota/80 text-white"
                              : "bg-escola-dourado/80 text-escola-bg"
                          }`}
                          title={`Já reutilizado ${c.usageCount}× noutros eps`}
                        >
                          ♻ {c.usageCount}
                        </span>
                      )}
                    </div>
                    <div className="p-1.5 text-[10px]">
                      <p className="truncate text-escola-creme" title={c.clipId}>
                        {c.clipId.replace(/^nomear-/, "")}
                      </p>
                      {c.mood.length > 0 && (
                        <p className="truncate text-escola-creme-50">
                          {c.mood.join(" · ")}
                        </p>
                      )}
                      <button
                        onClick={() => onAdd(c.clipUrl)}
                        disabled={alreadyIn}
                        className={`mt-1 w-full rounded px-2 py-1 text-[10px] font-semibold ${
                          alreadyIn
                            ? "cursor-not-allowed bg-escola-border text-escola-creme-50"
                            : highUse
                              ? "border border-escola-terracota/40 bg-escola-terracota/10 text-escola-terracota hover:bg-escola-terracota/20"
                              : "bg-escola-dourado text-escola-bg hover:opacity-90"
                        }`}
                        title={
                          highUse && !alreadyIn
                            ? "Já foi usado 2× — evita repetição excessiva"
                            : undefined
                        }
                      >
                        {alreadyIn ? "✓ já adicionado" : "+ adicionar a este ep"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Stretch Controls ────────────────────────────────────────────────────────
// Estica o vídeo final mantendo a mesma narração. 3 alavancas independentes —
// user combina até chegar ao target. Típico: 1:40s → 3:00s com +10s lead-in,
// +15s outro hold, atempo=0.93 (voz 7% mais lenta).
//
// Todas as alavancas são passadas ao render.mjs que faz o trabalho em ffmpeg.

function StretchControls({
  narrationLeadIn,
  setNarrationLeadIn,
  outroHold,
  setOutroHold,
  narrationAtempo,
  setNarrationAtempo,
}: {
  narrationLeadIn: number;
  setNarrationLeadIn: (n: number) => void;
  outroHold: number;
  setOutroHold: (n: number) => void;
  narrationAtempo: number;
  setNarrationAtempo: (n: number) => void;
}) {
  const activeCount =
    (narrationLeadIn > 0 ? 1 : 0) +
    (outroHold > 0 ? 1 : 0) +
    (narrationAtempo < 1 ? 1 : 0);
  const extraSeconds = narrationLeadIn + outroHold;
  // Nota: atempo estica proporcionalmente à narração (não calculável aqui sem
  // saber narrSec). Render.mjs sabe o valor real.

  return (
    <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm text-escola-creme">
          4c. Esticar duração{" "}
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
              {activeCount} activo{activeCount > 1 ? "s" : ""} · +
              {extraSeconds.toFixed(0)}s música-só
              {narrationAtempo < 1 && ` + voz ${(narrationAtempo * 100).toFixed(0)}%`}
            </span>
          )}
        </h3>
      </div>
      <p className="mb-3 text-[10px] text-escola-creme-50">
        Para quando o áudio ElevenLabs é curto (&lt;2min) e queres vídeo mais longo sem
        re-gravar. Combina as alavancas até chegares ao alvo.
      </p>

      <div className="space-y-3">
        {/* Lead-in */}
        <div className="flex items-center gap-3 text-xs">
          <label className="w-32 shrink-0 text-escola-creme-50">
            Pausa pós-intro
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={narrationLeadIn}
            onChange={(e) => setNarrationLeadIn(parseInt(e.target.value, 10))}
            className="flex-1 max-w-xs"
          />
          <span className="w-12 text-right text-escola-creme">
            {narrationLeadIn}s
          </span>
          <span className="flex-1 text-[10px] text-escola-creme-50">
            música + 1º clip antes da voz entrar
          </span>
        </div>

        {/* Outro hold */}
        <div className="flex items-center gap-3 text-xs">
          <label className="w-32 shrink-0 text-escola-creme-50">
            Hold pós-narração
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={outroHold}
            onChange={(e) => setOutroHold(parseInt(e.target.value, 10))}
            className="flex-1 max-w-xs"
          />
          <span className="w-12 text-right text-escola-creme">{outroHold}s</span>
          <span className="flex-1 text-[10px] text-escola-creme-50">
            música + último clip depois de a voz acabar
          </span>
        </div>

        {/* Atempo */}
        <div className="flex items-center gap-3 text-xs">
          <label className="w-32 shrink-0 text-escola-creme-50">
            Narração (atempo)
          </label>
          <input
            type="range"
            min="0.88"
            max="1"
            step="0.01"
            value={narrationAtempo}
            onChange={(e) => setNarrationAtempo(parseFloat(e.target.value))}
            className="flex-1 max-w-xs"
          />
          <span className="w-12 text-right text-escola-creme">
            {(narrationAtempo * 100).toFixed(0)}%
          </span>
          <span className="flex-1 text-[10px] text-escola-creme-50">
            abranda a voz (preserva pitch). Abaixo de 0.88 soa arrastado.
          </span>
        </div>
      </div>
    </section>
  );
}
