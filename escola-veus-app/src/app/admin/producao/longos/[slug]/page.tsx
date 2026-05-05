"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * /admin/producao/longos/[slug]
 *
 * Detail view dum projecto long-form. Fase 1: read-only (script +
 * capítulos + prompts visíveis), download JSON, edit título/thumbnail,
 * editar narrationUrl manualmente. Fase 2/3 expandem: image gen, render.
 */

type LongoProject = {
  slug: string;
  titulo: string;
  tema: string;
  thumbnailText: string;
  capitulos: { titulo: string; ancora: string }[];
  script: string;
  prompts: {
    id: string;
    category: string;
    mood: string[];
    prompt: string;
    clipUrl?: string;
    clipDurationSec?: number;
  }[];
  promptCount: number;
  wordCount: number;
  narrationUrl?: string;
  durationSec?: number; // real, vem do MP3 gerado
  subtitlesUrl?: string; // SRT em Supabase, gerada via /generate-srt
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Voz default (usada como fallback inicial — user pode mudar no test panel).

// Parte o script por capítulos (## headings markdown). Cada capítulo é
// um chunk para gerar separadamente em ElevenLabs (mais fiável que enviar
// 3000+ palavras numa só chamada — fica dentro dos limits de char por
// request seja qual for o plano, e permite progress bar).
function splitScriptByChapters(script: string): { titulo: string; texto: string }[] {
  const lines = script.split("\n");
  const chapters: { titulo: string; texto: string }[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (currentLines.length > 0 || currentTitle) {
        chapters.push({
          titulo: currentTitle || "Intro",
          texto: currentLines.join("\n").trim(),
        });
      }
      currentTitle = m[1].trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0 || currentTitle) {
    chapters.push({
      titulo: currentTitle || "Intro",
      texto: currentLines.join("\n").trim(),
    });
  }
  // Filtra capítulos sem texto (só título)
  return chapters.filter((c) => c.texto.length > 20);
}

export default function LongoDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;

  const [project, setProject] = useState<LongoProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [narrationInput, setNarrationInput] = useState("");
  const [tituloDraft, setTituloDraft] = useState("");
  const [thumbDraft, setThumbDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // SRT generation (ElevenLabs Scribe). Cacheado em longos-subtitles/<slug>.srt
  // — re-execução sobrescreve. Patcha o projecto com subtitlesUrl.
  const [srtGenerating, setSrtGenerating] = useState(false);
  const [srtErr, setSrtErr] = useState<string | null>(null);

  const generateSrt = async () => {
    if (!project) return;
    if (!project.narrationUrl) {
      setSrtErr("Sem narração — gera primeiro");
      return;
    }
    setSrtGenerating(true);
    setSrtErr(null);
    try {
      const r = await fetch("/api/admin/longos/generate-srt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug }),
      });
      const ct = r.headers.get("content-type") || "";
      const text = await r.text();
      if (!ct.includes("application/json")) {
        throw new Error(
          `HTTP ${r.status}: ${text.slice(0, 200)} — provavelmente Vercel timeout`,
        );
      }
      const d = JSON.parse(text);
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setInfo(`✓ SRT gerada: ${d.lineCount} linhas`);
      setTimeout(() => setInfo(null), 3000);
      await load();
    } catch (e) {
      setSrtErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSrtGenerating(false);
    }
  };

  // Geração automática de narração via ElevenLabs (chunked by chapter + concat)
  const [narrating, setNarrating] = useState(false);
  const [narrProgress, setNarrProgress] = useState<{
    phase: "idle" | "chunks" | "concat" | "done";
    currentChunk: number;
    totalChunks: number;
    chunkUrls: string[];
    chunkErrors: string[];
  } | null>(null);
  const [narrErr, setNarrErr] = useState<string | null>(null);

  // ── Editor mode: drafts do script + prompts antes de gravar ──────────
  // Permite rever e editar livremente sem custo. Só persiste em Supabase
  // ao clicar Guardar. Ao gerar narração (ElevenLabs custa créditos),
  // usa-se o draft já guardado — daí o botão Guardar a piscar quando
  // dirty antes de Gerar narração.
  const [scriptDraft, setScriptDraft] = useState("");
  const [promptsDraft, setPromptsDraft] = useState<
    {
      id: string;
      category: string;
      mood: string[];
      prompt: string;
      clipUrl?: string;
      clipDurationSec?: number;
    }[]
  >([]);
  const [scriptDirty, setScriptDirty] = useState(false);
  const [promptsDirty, setPromptsDirty] = useState(false);

  // Per-prompt clip upload status. Key = promptId.
  const [clipUpload, setClipUpload] = useState<
    Record<string, { stage: "signing" | "uploading" | "finalizing"; progress: number }>
  >({});

  // Claude review pass: keyed by promptId. Decora cada prompt com flags.
  type Review = {
    id: string;
    alignment: "aligned" | "weak" | "misaligned";
    slop: "clean" | "generic" | "ai-slop";
    notes: string;
    suggested?: string;
  };
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewing, setReviewing] = useState(false);
  const [reviewErr, setReviewErr] = useState<string | null>(null);

  const reviewPromptsWithClaude = async () => {
    if (!project) return;
    if (
      !confirm(
        "Claude vai ler script + prompts e classificar cada prompt em alinhamento ao script + qualidade visual (AI-slop detection). " +
          `Custo ~$0.05-0.10. Continuar?`,
      )
    )
      return;
    setReviewing(true);
    setReviewErr(null);
    try {
      const r = await fetch("/api/admin/longos/review-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug }),
      });
      const ct = r.headers.get("content-type") || "";
      const text = await r.text();
      if (!ct.includes("application/json")) {
        throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
      }
      const d = JSON.parse(text);
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      const map: Record<string, Review> = {};
      for (const rev of d.reviews ?? []) {
        if (rev?.id) map[rev.id] = rev;
      }
      setReviews(map);
      setInfo(
        `✓ Review feita · ${d.summary.misaligned} misaligned, ${d.summary.weak} weak, ${d.summary.aiSlop} AI-slop, ${d.summary.generic} genéricos · custo $${d.usage.costUsd.toFixed(4)}`,
      );
      setTimeout(() => setInfo(null), 8000);
    } catch (e) {
      setReviewErr(e instanceof Error ? e.message : String(e));
    } finally {
      setReviewing(false);
    }
  };

  // ── Render long-form: música + GitHub Actions polling ────────────────
  type Track = { name: string; url: string };
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [musicVolume, setMusicVolume] = useState(0.15);
  const [crossfade, setCrossfade] = useState(1.0);
  const [includeBrand, setIncludeBrand] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<{
    status: string;
    phase?: string;
    progress?: number;
    videoUrl?: string;
    error?: string;
  } | null>(null);
  const [renderErr, setRenderErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/music/list-album?album=ancient-ground", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.tracks)) {
          setTracks(d.tracks);
          if (d.tracks.length > 0) setSelectedMusic([d.tracks[0].url]);
        }
      })
      .catch(() => {});
  }, []);

  const submitRender = async (preview = false) => {
    if (!project) return;
    if (!project.narrationUrl) {
      setRenderErr("Sem narração — gera primeiro");
      return;
    }
    const clipsReady = (project.prompts ?? []).filter((p) => p.clipUrl).length;
    if (clipsReady === 0) {
      setRenderErr("Nenhum prompt tem clip MJ Video carregado");
      return;
    }
    if (selectedMusic.length === 0) {
      setRenderErr("Escolhe pelo menos 1 track de música");
      return;
    }
    if (
      !confirm(
        `Vais render ${preview ? "PREVIEW (90s, qualidade reduzida)" : "long-form COMPLETO"} com:\n` +
          `- ${clipsReady}/${project.prompts.length} cenas com clip\n` +
          `- Narração: ${
            project.durationSec
              ? `${Math.round(project.durationSec / 60)} min`
              : "duração desconhecida"
          }\n` +
          `- Música: ${selectedMusic.length} track(s)\n` +
          `- Crossfade: ${crossfade}s\n` +
          `- Intro/outro brand: ${includeBrand ? "sim" : "não"}\n` +
          `- Legendas: ${project.subtitlesUrl ? "sim (queimadas)" : "não (gera SRT primeiro se quiseres)"}\n\n` +
          `Cenas SEM clip serão IGNORADAS (não atrasam o render).\n\n` +
          `Tempo estimado: ${preview ? "~1-2 min (CRF agressivo + ultrafast)" : "~5-15 min (CRF20 medium)"}. ` +
          (preview
            ? "Output vai para slug-preview.mp4, NÃO substitui vídeo final."
            : "Output substitui vídeo final do projecto.") +
          " Continuar?",
      )
    ) {
      return;
    }

    setRendering(true);
    setRenderErr(null);
    setRenderProgress({ status: "queued", progress: 0 });
    try {
      const r = await fetch("/api/admin/longos/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: project.slug,
          musicUrls: selectedMusic,
          musicVolume,
          crossfade,
          includeBrand,
          preview,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.jobId) {
        throw new Error(d.erro || `HTTP ${r.status}`);
      }
      // Poll até done/failed
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 12000));
        try {
          const sr = await fetch(
            `/api/admin/longos/render-status?jobId=${encodeURIComponent(d.jobId)}`,
            { cache: "no-store" },
          );
          const sd = await sr.json();
          if (sd.erro) {
            setRenderProgress({ status: "polling-error", error: sd.erro });
            continue;
          }
          setRenderProgress({
            status: sd.status,
            phase: sd.phase,
            progress: sd.progress,
            videoUrl: sd.videoUrl,
            error: sd.error,
          });
          if (sd.status === "done") {
            await load();
            break;
          }
          if (sd.status === "failed") {
            throw new Error(sd.error || "Render falhou");
          }
        } catch (e) {
          setRenderProgress({
            status: "polling-error",
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } catch (e) {
      setRenderErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRendering(false);
    }
  };

  // ── Voice / model: persistência localStorage (mesma UX do /audios) ───
  // Default: UnchUhO6d8TYPl7TuqgU (voz long-form da Vivianne, distinta da
  // dos shorts JGnWZj684pcXmK2SxYIv).
  const [voiceId, setVoiceId] = useState<string>("UnchUhO6d8TYPl7TuqgU");
  const [modelId, setModelId] = useState<string>("eleven_multilingual_v2");
  useEffect(() => {
    try {
      const v = localStorage.getItem("longos-voice");
      const m = localStorage.getItem("longos-model");
      if (v) setVoiceId(v);
      if (m) setModelId(m);
    } catch {
      /* SSR / privacy mode */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("longos-voice", voiceId);
    } catch {
      /* ignore */
    }
  }, [voiceId]);
  useEffect(() => {
    try {
      localStorage.setItem("longos-model", modelId);
    } catch {
      /* ignore */
    }
  }, [modelId]);

  // ── Voice test: sample curto para testar antes de gastar créditos ────
  const [testText, setTestText] = useState(
    "[calm] Há frases que o teu corpo já sabe de cor. [pause] Mas que nunca ninguém te disse.",
  );
  const [testing, setTesting] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [testErr, setTestErr] = useState<string | null>(null);

  const testVoice = async () => {
    if (!testText.trim()) {
      setTestErr("Preenche o texto de teste");
      return;
    }
    setTesting(true);
    setTestErr(null);
    setTestAudioUrl(null);
    try {
      const r = await fetch("/api/admin/audio-bulk/test-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, voiceId, modelId }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setTestAudioUrl(d.audioDataUrl);
    } catch (e) {
      setTestErr(e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  };

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/longos/load?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      const p = d as LongoProject;
      setProject(p);
      setNarrationInput(p.narrationUrl ?? "");
      setTituloDraft(p.titulo ?? "");
      setThumbDraft(p.thumbnailText ?? "");
      setScriptDraft(p.script ?? "");
      setPromptsDraft(p.prompts ?? []);
      setScriptDirty(false);
      setPromptsDirty(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Anti-perda: beforeunload guard ────────────────────────────────────
  // Avisa se o user tenta fechar tab com:
  //   - edits ao script ou prompts não guardados (perde edits)
  //   - upload de clip a meio (perde tempo, mas Supabase pode receber o PUT
  //     completo — recuperável via /scan-clips)
  //   - narração a gerar (chunks já gerados ficam em Supabase, mas concat
  //     final perde-se se browser fecha)
  //   - render a correr (cliente perde polling, mas GitHub Actions continua
  //     e pode ser consultado depois pelo jobId)
  useEffect(() => {
    const hasUnsaved =
      scriptDirty ||
      promptsDirty ||
      Object.keys(clipUpload).length > 0 ||
      narrating ||
      rendering;
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [scriptDirty, promptsDirty, clipUpload, narrating, rendering]);

  const patchProject = async (patch: Partial<LongoProject>) => {
    if (!project) return;
    setSaving(true);
    setInfo(null);
    try {
      const r = await fetch("/api/admin/longos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug, ...patch }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setProject(d.project as LongoProject);
      setInfo("✓ Guardado");
      setTimeout(() => setInfo(null), 2000);
    } catch (e) {
      setInfo(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Gerar narração automaticamente via ElevenLabs ────────────────────
  // Workflow:
  //   1. Parte o script por capítulos (## headings).
  //   2. Para cada capítulo, POST /api/admin/audio-bulk/generate-one (já
  //      existe — mesma infra dos mini-eps Nomear). Voz default
  //      JGnWZj684pcXmK2SxYIv. Folder: longos-audios/<slug>-cap-N.
  //   3. No fim, POST /api/admin/longos/concat-narration que faz ffmpeg
  //      concat e patcha o projecto com narrationUrl + durationSec real.
  const generateNarration = async () => {
    if (!project) return;
    if (scriptDirty || promptsDirty) {
      if (
        !confirm(
          "Tens edições NÃO GUARDADAS. Se gerares agora, vais usar o estado anterior (em Supabase) e os teus edits ficam só em memória. Queres mesmo continuar? Cancela e clica Guardar primeiro.",
        )
      ) {
        return;
      }
    }
    if (
      project.narrationUrl &&
      !confirm("Já existe narração para este projecto. Re-gerar vai gastar créditos ElevenLabs novamente e sobrescrever a actual. Continuar?")
    ) {
      return;
    }
    const chapters = splitScriptByChapters(project.script);
    if (chapters.length === 0) {
      setNarrErr("Sem capítulos detectados no script (precisa de ## headings)");
      return;
    }

    setNarrating(true);
    setNarrErr(null);
    setNarrProgress({
      phase: "chunks",
      currentChunk: 0,
      totalChunks: chapters.length,
      chunkUrls: [],
      chunkErrors: [],
    });

    const chunkUrls: string[] = [];
    const chunkErrors: string[] = [];
    const supabasePublicBase = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // 1. Gerar cada capítulo em série. IDEMPOTENTE:
    //   - keyName fixo (`<slug>-cap-NN`) → re-chamada sobrescreve em vez de
    //     criar novo ficheiro
    //   - Antes de chamar ElevenLabs, fazemos HEAD ao Supabase para ver se
    //     o ficheiro já existe (ex: browser fechou anteriormente). Se sim,
    //     reutiliza o URL → ZERO custo adicional ElevenLabs.
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      setNarrProgress({
        phase: "chunks",
        currentChunk: i,
        totalChunks: chapters.length,
        chunkUrls: [...chunkUrls],
        chunkErrors: [...chunkErrors],
      });

      const keyName = `${project.slug}-cap-${String(i + 1).padStart(2, "0")}`;
      const existingUrl = supabasePublicBase
        ? `${supabasePublicBase}/storage/v1/object/public/course-assets/longos-audios/${keyName}.mp3`
        : null;

      // Probe se já existe — HEAD request é cheap
      if (existingUrl) {
        try {
          const head = await fetch(existingUrl, { method: "HEAD", cache: "no-store" });
          if (head.ok) {
            chunkUrls.push(existingUrl);
            continue; // skip ElevenLabs — resume!
          }
        } catch {
          /* not exists or network — fall through to generate */
        }
      }

      try {
        const r = await fetch("/api/admin/audio-bulk/generate-one", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ch.texto,
            voiceId,
            modelId,
            title: keyName,
            keyName, // ← fixo, sem timestamp
            folder: "longos-audios",
          }),
        });
        const d = await r.json();
        if (!r.ok || d.erro || !d.audioUrl) {
          chunkErrors.push(`cap${i + 1} (${ch.titulo}): ${d.erro || `HTTP ${r.status}`}`);
          continue;
        }
        chunkUrls.push(d.audioUrl);
      } catch (e) {
        chunkErrors.push(
          `cap${i + 1} (${ch.titulo}): ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    if (chunkUrls.length === 0) {
      setNarrating(false);
      setNarrErr(
        `Nenhum capítulo foi gerado com sucesso. Erros: ${chunkErrors.join("; ")}`,
      );
      return;
    }

    // 2. Concatenar tudo num MP3 final + patch o projecto.
    setNarrProgress({
      phase: "concat",
      currentChunk: chapters.length,
      totalChunks: chapters.length,
      chunkUrls: [...chunkUrls],
      chunkErrors: [...chunkErrors],
    });

    try {
      const r = await fetch("/api/admin/longos/concat-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug, chunkUrls }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) {
        throw new Error(d.erro || `HTTP ${r.status}`);
      }
      setNarrProgress({
        phase: "done",
        currentChunk: chapters.length,
        totalChunks: chapters.length,
        chunkUrls: [...chunkUrls],
        chunkErrors: [...chunkErrors],
      });
      setInfo(
        `✓ Narração gerada: ${Math.round((d.durationSec ?? 0) / 60)} min · ${chapters.length} capítulos · ${chunkErrors.length} erros`,
      );
      // Recarrega o projecto para mostrar o novo narrationUrl + durationSec.
      await load();
    } catch (e) {
      setNarrErr(
        `Concat falhou: ${e instanceof Error ? e.message : String(e)}. Os capítulos individuais ficaram em Supabase (longos-audios/${project.slug}-cap-*.mp3) e podes concatenar manualmente.`,
      );
    } finally {
      setNarrating(false);
    }
  };

  // ── Upload de clip MJ Video por cena ─────────────────────────────────
  // Workflow: pede signed URL → PUT directo Supabase (bypass 4.5MB Vercel
  // body limit; clips MJ extend ~10-30MB) → finalize-clip patcha o projecto.
  const uploadClipForPrompt = async (promptId: string, file: File) => {
    if (!project) return;
    if (!file.type.startsWith("video/") && !/\.(mp4|mov|webm|m4v)$/i.test(file.name)) {
      setInfo(`Erro: ${file.name} não é vídeo`);
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setInfo(`Erro: ${file.name} > 200MB (limite Supabase)`);
      return;
    }

    setClipUpload((prev) => ({
      ...prev,
      [promptId]: { stage: "signing", progress: 0 },
    }));

    try {
      // 1. Signed URL
      const signRes = await fetch("/api/admin/longos/upload-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug, promptId }),
      });
      const sign = await signRes.json();
      if (!signRes.ok || sign.erro || !sign.clipUploadUrl) {
        throw new Error(sign.erro || `Sign HTTP ${signRes.status}`);
      }

      // 2. PUT directo
      setClipUpload((prev) => ({
        ...prev,
        [promptId]: { stage: "uploading", progress: 0 },
      }));
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", sign.clipUploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setClipUpload((prev) => ({
              ...prev,
              [promptId]: { stage: "uploading", progress: pct },
            }));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload ${xhr.status}: ${xhr.responseText.slice(0, 200)}`));
        };
        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.send(file);
      });

      // 3. Tentar extrair duração do video local (best-effort)
      let durationSec: number | undefined;
      try {
        const url = URL.createObjectURL(file);
        const v = document.createElement("video");
        v.preload = "metadata";
        v.src = url;
        await new Promise<void>((resolve, reject) => {
          v.addEventListener("loadedmetadata", () => resolve(), { once: true });
          v.addEventListener("error", () => reject(new Error("metadata")), { once: true });
        });
        if (Number.isFinite(v.duration)) durationSec = v.duration;
        URL.revokeObjectURL(url);
      } catch {
        /* duração desconhecida — não bloqueia */
      }

      // 4. Finalize: patch projecto
      setClipUpload((prev) => ({
        ...prev,
        [promptId]: { stage: "finalizing", progress: 100 },
      }));
      const finRes = await fetch("/api/admin/longos/finalize-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: project.slug,
          promptId,
          clipUrl: `${sign.clipUrl}?t=${Date.now()}`,
          clipDurationSec: durationSec,
        }),
      });
      const fin = await finRes.json();
      if (!finRes.ok || fin.erro) {
        throw new Error(fin.erro || `Finalize HTTP ${finRes.status}`);
      }

      // 5. Reload local state
      setClipUpload((prev) => {
        const next = { ...prev };
        delete next[promptId];
        return next;
      });
      await load();
      setInfo(`✓ Clip ${promptId} carregado`);
      setTimeout(() => setInfo(null), 2000);
    } catch (e) {
      setClipUpload((prev) => {
        const next = { ...prev };
        delete next[promptId];
        return next;
      });
      setInfo(`Erro upload ${promptId}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const deleteClipForPrompt = async (promptId: string) => {
    if (!project) return;
    if (!confirm(`Apagar o clip da cena ${promptId}?`)) return;
    try {
      const r = await fetch("/api/admin/longos/delete-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug, promptId }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      await load();
      setInfo(`✓ Clip ${promptId} apagado`);
      setTimeout(() => setInfo(null), 2000);
    } catch (e) {
      setInfo(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const downloadJson = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.slug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadScript = () => {
    if (!project) return;
    const text = `# ${project.titulo}\n\n${project.script}`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.slug}-script.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) return <p className="text-xs text-escola-creme-50">A carregar...</p>;
  if (err)
    return (
      <div className="space-y-2">
        <p className="text-xs text-escola-terracota">{err}</p>
        <Link
          href="/admin/producao/longos"
          className="text-xs text-escola-creme-50 underline"
        >
          ← voltar à lista
        </Link>
      </div>
    );
  if (!project) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href="/admin/producao/longos"
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            ← projectos longos
          </Link>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-escola-creme">
            {project.titulo}
          </h1>
          <p className="text-[10px] text-escola-creme-50">
            <code>{project.slug}</code> ·{" "}
            {project.durationSec
              ? `${Math.floor(project.durationSec / 60)}:${String(
                  Math.round(project.durationSec % 60),
                ).padStart(2, "0")} min real`
              : `${project.wordCount} palavras`}{" "}
            · {project.promptCount} cenas
            {project.updatedAt && (
              <>
                {" "}
                · actualizado{" "}
                {new Date(project.updatedAt).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px]">
          <button
            onClick={downloadJson}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
          >
            ⬇ JSON
          </button>
          <button
            onClick={downloadScript}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
          >
            ⬇ Script .md
          </button>
        </div>
      </div>

      {info && <p className="text-xs text-escola-dourado">{info}</p>}

      {/* Tema */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-3">
        <p className="text-[10px] uppercase tracking-wider text-escola-creme-50">
          Tema original
        </p>
        <p className="mt-1 text-xs text-escola-creme">{project.tema}</p>
      </section>

      {/* Editáveis */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-3 text-sm text-escola-creme">Metadata editável</h2>
        <div className="space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Título do vídeo
            </label>
            <div className="flex gap-2">
              <input
                value={tituloDraft}
                onChange={(e) => setTituloDraft(e.target.value)}
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
              />
              {tituloDraft !== project.titulo && (
                <button
                  onClick={() => patchProject({ titulo: tituloDraft })}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  guardar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Thumbnail text (UPPERCASE auto)
            </label>
            <div className="flex gap-2">
              <input
                value={thumbDraft}
                onChange={(e) => setThumbDraft(e.target.value)}
                maxLength={60}
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
              />
              {thumbDraft !== project.thumbnailText && (
                <button
                  onClick={() => patchProject({ thumbnailText: thumbDraft })}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  guardar
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Voice test panel (gastar 0 antes de gravar tudo) ────── */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-2 text-sm text-escola-creme">
          🔊 Testar voz (sample curto, custo mínimo)
        </h2>
        <p className="mb-3 text-[11px] text-escola-creme-50">
          Antes de gerar a narração inteira (~20-30 min × ElevenLabs chars), testa
          aqui o tom e modelo com um sample. As escolhas ficam guardadas e são
          usadas na geração final.
        </p>
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                Voice ID (ElevenLabs)
              </label>
              <input
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value.trim())}
                className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 font-mono text-escola-creme"
              />
              <p className="mt-1 text-[10px] text-escola-creme-50">
                Default <code>JGnWZj684pcXmK2SxYIv</code> (mesma dos shorts).
              </p>
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                Model
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
              >
                <option value="eleven_multilingual_v2">
                  Multilingual v2 (PT natural, sem tags emoção)
                </option>
                <option value="eleven_v3">
                  v3 (expressivo, suporta [calm]/[thoughtful], beta)
                </option>
              </select>
              <p className="mt-1 text-[10px] text-escola-creme-50">
                v3 honra <code>[calm]</code> <code>[thoughtful]</code>; v2 strip-as
                e usa só <code>[pause]</code>.
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Texto de teste (sample 100-300 chars)
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={3}
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            />
            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
              <button
                onClick={() => {
                  // Pega os primeiros 250 chars do script com tags incluídas
                  const sample = scriptDraft
                    .replace(/^##.*$/gm, "")
                    .trim()
                    .slice(0, 250);
                  setTestText(sample || testText);
                }}
                className="rounded border border-escola-border px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
              >
                ↓ usar primeiros 250 chars do script
              </button>
              <button
                onClick={testVoice}
                disabled={testing || !testText.trim() || !voiceId.trim()}
                className="rounded bg-escola-dourado px-2 py-0.5 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
              >
                {testing ? "a gerar sample..." : "▶ Testar voz"}
              </button>
              {testErr && (
                <span className="text-[10px] text-escola-terracota">{testErr}</span>
              )}
            </div>
          </div>
          {testAudioUrl && (
            <div>
              <p className="mb-1 text-[10px] text-escola-dourado">
                ✓ Sample pronto — ouve, ajusta voice/model/texto, repete até
                gostares
              </p>
              <audio
                src={testAudioUrl}
                controls
                preload="auto"
                className="w-full max-w-md"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Narração ElevenLabs (automática) ────────────────────── */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-2 text-sm text-escola-creme">
          🎙 Narração ElevenLabs
          {project.durationSec ? (
            <span className="ml-2 text-[10px] text-escola-dourado">
              {Math.floor(project.durationSec / 60)}:
              {String(Math.round(project.durationSec % 60)).padStart(2, "0")} min real
            </span>
          ) : null}
        </h2>

        {project.narrationUrl ? (
          <div className="mb-3 space-y-2">
            <audio
              src={project.narrationUrl}
              controls
              preload="metadata"
              className="w-full max-w-md"
            />
            <p className="text-[10px] text-escola-creme-50">
              <code>{project.narrationUrl}</code>
            </p>
          </div>
        ) : (
          <p className="mb-3 text-[11px] text-escola-creme-50">
            Sem narração ainda. Gera com 1 clique abaixo (parte por capítulo,
            usa a mesma voz dos mini-eps Nomear).
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={generateNarration}
            disabled={narrating}
            className="rounded bg-escola-dourado px-3 py-1.5 font-semibold text-escola-bg disabled:opacity-40"
          >
            {narrating
              ? "A gerar..."
              : project.narrationUrl
                ? "↻ Re-gerar narração"
                : "🎙 Gerar narração com ElevenLabs"}
          </button>
          {project.narrationUrl && (
            <button
              onClick={generateSrt}
              disabled={srtGenerating}
              className="rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-[11px] text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
              title="Transcreve a narração via ElevenLabs Scribe e gera ficheiro SRT (cacheado por slug). Será queimada no vídeo final pelo render, e podes descarregar para upload manual no YouTube Studio."
            >
              {srtGenerating
                ? "a transcrever..."
                : project.subtitlesUrl
                  ? "↻ Re-gerar SRT (Scribe)"
                  : "📝 Gerar legenda SRT (Scribe)"}
            </button>
          )}
          {project.subtitlesUrl && (
            <a
              href={project.subtitlesUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-escola-dourado/40 bg-escola-dourado/10 px-2 py-1 text-[10px] text-escola-dourado hover:bg-escola-dourado/20"
            >
              ✓ SRT pronto · abrir
            </a>
          )}
          {srtErr && (
            <span className="text-[10px] text-escola-terracota">{srtErr}</span>
          )}
          <p className="text-[10px] text-escola-creme-50">
            Vai usar: voz <code>{voiceId}</code> · model <code>{modelId}</code>
            {scriptDirty && (
              <span className="ml-2 text-escola-terracota">
                ⚠ tens edits ao script não guardados
              </span>
            )}
          </p>
          {/* Estimativa de custo ElevenLabs.
              Pricing: 1 char = 1 credit em qualquer modelo.
              Pro plan ($22/mo) = 500k credits → $0.044 por 1k chars.
              Creator ($11/mo) = 100k credits → $0.110 por 1k chars.
              Stand-alone (sem plano) = $0.30 por 1k chars (multilingual v2). */}
          {(() => {
            const chars = scriptDraft.length;
            const proCost = (chars / 1000) * 0.044;
            const proPercent = (chars / 500_000) * 100;
            return (
              <div className="rounded border border-escola-border bg-escola-bg p-2 text-[10px] text-escola-creme-50">
                <p>
                  💸 <b>Custo estimado:</b> {chars.toLocaleString("pt-PT")} chars
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  <li>
                    Pro plan ($22/mo, 500k chars): <b className="text-escola-dourado">{proPercent.toFixed(1)}%</b> do mês = ~${proCost.toFixed(2)}
                  </li>
                  <li>
                    Creator plan ($11/mo, 100k chars): {((chars / 100_000) * 100).toFixed(1)}% do mês
                  </li>
                  <li>Stand-alone: ~${((chars / 1000) * 0.3).toFixed(2)}</li>
                </ul>
                <p className="mt-1">
                  ~3-5 min de geração para 20-30 min de áudio. Idempotente: se
                  algo falhar a meio, próxima execução salta capítulos já feitos.
                </p>
              </div>
            );
          })()}
        </div>

        {narrErr && (
          <p className="mt-2 text-xs text-escola-terracota">{narrErr}</p>
        )}

        {narrProgress && (
          <div className="mt-3 rounded border border-escola-dourado/40 bg-escola-bg p-2">
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-escola-dourado">
                {narrProgress.phase === "chunks"
                  ? `A gerar capítulo ${narrProgress.currentChunk + 1}/${narrProgress.totalChunks}…`
                  : narrProgress.phase === "concat"
                    ? "A concatenar capítulos com ffmpeg…"
                    : narrProgress.phase === "done"
                      ? "✓ Narração pronta"
                      : ""}
              </span>
              <span className="text-escola-creme-50">
                {narrProgress.chunkUrls.length} ok ·{" "}
                {narrProgress.chunkErrors.length} erros
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-escola-bg">
              <div
                className="h-full bg-escola-dourado transition-all"
                style={{
                  width: `${
                    narrProgress.phase === "concat"
                      ? 95
                      : narrProgress.phase === "done"
                        ? 100
                        : (narrProgress.currentChunk / Math.max(1, narrProgress.totalChunks)) * 90
                  }%`,
                }}
              />
            </div>
            {narrProgress.chunkErrors.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[10px] text-escola-terracota">
                  {narrProgress.chunkErrors.length} erros (clica p/ ver)
                </summary>
                <ul className="mt-1 space-y-0.5 text-[10px] text-escola-terracota">
                  {narrProgress.chunkErrors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Override manual: caso queira colar URL externa em vez de gerar. */}
        <details className="mt-3 rounded border border-escola-border bg-escola-bg/40 p-2">
          <summary className="cursor-pointer text-[10px] text-escola-creme-50 hover:text-escola-creme">
            Avançado: colar URL de MP3 externo (override manual)
          </summary>
          <div className="mt-2 flex gap-2 text-xs">
            <input
              value={narrationInput}
              onChange={(e) => setNarrationInput(e.target.value)}
              placeholder="https://...mp3"
              className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            />
            {narrationInput !== (project.narrationUrl ?? "") && (
              <button
                onClick={() =>
                  patchProject({
                    narrationUrl: narrationInput || undefined,
                    // Sem durationSec — desconhecida até carregar o áudio.
                  })
                }
                disabled={saving}
                className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
              >
                guardar URL
              </button>
            )}
          </div>
        </details>
      </section>

      {/* Capítulos */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-2 text-sm text-escola-creme">
          Capítulos ({project.capitulos.length})
        </h2>
        <ol className="space-y-2 text-xs">
          {project.capitulos.map((c, i) => (
            <li key={i} className="rounded border border-escola-border bg-escola-bg p-2">
              <p className="font-semibold text-escola-creme">
                {i + 1}. {c.titulo}
              </p>
              <p className="text-[11px] italic text-escola-creme-50">{c.ancora}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Script (editável) */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm text-escola-creme">
            Script (
            {scriptDraft.split(/\s+/).filter(Boolean).length} palavras ·{" "}
            {scriptDraft.length} chars
            {project.durationSec
              ? ` · ${Math.floor(project.durationSec / 60)} min reais`
              : ""}
            ){scriptDirty && (
              <span className="ml-2 text-[10px] text-escola-terracota">
                ● não guardado
              </span>
            )}
          </h2>
          <div className="flex gap-1">
            {scriptDirty && (
              <>
                <button
                  onClick={() => {
                    setScriptDraft(project.script);
                    setScriptDirty(false);
                  }}
                  className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-terracota"
                >
                  ↺ descartar
                </button>
                <button
                  onClick={async () => {
                    await patchProject({ script: scriptDraft });
                    setScriptDirty(false);
                  }}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-0.5 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  ✓ guardar script
                </button>
              </>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(scriptDraft);
                setInfo("✓ Script copiado");
                setTimeout(() => setInfo(null), 1500);
              }}
              className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              copiar
            </button>
          </div>
        </div>
        <textarea
          value={scriptDraft}
          onChange={(e) => {
            setScriptDraft(e.target.value);
            setScriptDirty(e.target.value !== project.script);
          }}
          rows={20}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 font-mono text-[11px] leading-relaxed text-escola-creme"
        />
        <p className="mt-1 text-[10px] text-escola-creme-50">
          💡 Edita livremente. Tags ElevenLabs: <code>[pause]</code>{" "}
          <code>[long pause]</code> <code>[short pause]</code>{" "}
          <code>[calm]</code> <code>[thoughtful]</code> (estas últimas só
          funcionam com modelo v3). Capítulos começam com <code>## </code>.
          Guarda antes de gerar narração.
        </p>
      </section>

      {/* Prompts (editáveis) */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm text-escola-creme">
            Image prompts ({promptsDraft.length}){" "}
            <span className="text-[10px] text-escola-creme-50">
              · {promptsDraft.filter((p) => p.clipUrl).length} com clip
            </span>
            {promptsDirty && (
              <span className="ml-2 text-[10px] text-escola-terracota">
                ● não guardado
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={reviewPromptsWithClaude}
              disabled={reviewing || promptsDraft.length === 0}
              className="rounded border border-escola-dourado bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
              title="Claude lê o script + prompts e classifica cada prompt em alinhamento e AI-slop. Custo ~$0.05-0.10."
            >
              {reviewing ? "a rever..." : "✨ revisar com Claude"}
            </button>
            {reviewErr && (
              <span className="text-[10px] text-escola-terracota">{reviewErr}</span>
            )}
            <button
              onClick={async () => {
                if (!project) return;
                try {
                  const r = await fetch("/api/admin/longos/scan-clips", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug: project.slug }),
                  });
                  const d = await r.json();
                  if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
                  if (d.recovered.length > 0) {
                    setInfo(
                      `🛟 ${d.recovered.length} clip(s) recuperado(s) de Supabase: ${d.recovered.map((x: { promptId: string }) => x.promptId).join(", ")}`,
                    );
                    await load();
                  } else {
                    setInfo(
                      `✓ Nada para recuperar — projecto sincronizado. ${d.missing.length} cenas ainda sem clip.`,
                    );
                  }
                  setTimeout(() => setInfo(null), 5000);
                } catch (e) {
                  setInfo(
                    `Erro scan: ${e instanceof Error ? e.message : String(e)}`,
                  );
                }
              }}
              className="rounded border border-escola-border bg-escola-bg px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
              title="Lista MP4s em longos-clips/<slug>/ e patcha o projecto se algum clip subiu mas não foi finalizado (ex: browser fechou)"
            >
              🛟 scan clips
            </button>
            {promptsDirty && (
              <>
                <button
                  onClick={() => {
                    setPromptsDraft(project.prompts);
                    setPromptsDirty(false);
                  }}
                  className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-terracota"
                >
                  ↺ descartar
                </button>
                <button
                  onClick={async () => {
                    await patchProject({
                      prompts: promptsDraft,
                      promptCount: promptsDraft.length,
                    });
                    setPromptsDirty(false);
                  }}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-0.5 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  ✓ guardar prompts
                </button>
              </>
            )}
          </div>
        </div>
        <ul className="space-y-2">
          {promptsDraft.map((p, i) => {
            const review = reviews[p.id];
            const reviewBorder =
              review?.alignment === "misaligned" || review?.slop === "ai-slop"
                ? "border-escola-terracota"
                : review?.alignment === "weak" || review?.slop === "generic"
                  ? "border-escola-dourado/60"
                  : "border-escola-border";
            return (
            <li
              key={i}
              className={`rounded border ${reviewBorder} bg-escola-bg p-2 text-[11px]`}
            >
              {review && (
                <div className="mb-1 flex flex-wrap items-center gap-1 text-[9px]">
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      review.alignment === "aligned"
                        ? "bg-escola-dourado/20 text-escola-dourado"
                        : review.alignment === "weak"
                          ? "bg-escola-dourado/40 text-escola-bg"
                          : "bg-escola-terracota/30 text-escola-terracota"
                    }`}
                    title={`alinhamento ao script: ${review.alignment}`}
                  >
                    {review.alignment}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      review.slop === "clean"
                        ? "bg-escola-dourado/20 text-escola-dourado"
                        : review.slop === "generic"
                          ? "bg-escola-dourado/40 text-escola-bg"
                          : "bg-escola-terracota/30 text-escola-terracota"
                    }`}
                    title={`qualidade visual: ${review.slop}`}
                  >
                    {review.slop}
                  </span>
                  <span className="text-escola-creme-50 italic">
                    {review.notes}
                  </span>
                  {review.suggested && (
                    <button
                      onClick={() => {
                        const next = [...promptsDraft];
                        next[i] = { ...next[i], prompt: review.suggested! };
                        setPromptsDraft(next);
                        setPromptsDirty(true);
                      }}
                      className="ml-auto rounded border border-escola-dourado bg-escola-dourado/10 px-1.5 py-0.5 text-[9px] font-semibold text-escola-dourado hover:bg-escola-dourado/20"
                      title={review.suggested}
                    >
                      ↪ aplicar sugestão
                    </button>
                  )}
                </div>
              )}
              <div className="mb-1 flex items-center gap-2">
                <input
                  value={p.id}
                  onChange={(e) => {
                    const next = [...promptsDraft];
                    next[i] = { ...next[i], id: e.target.value };
                    setPromptsDraft(next);
                    setPromptsDirty(true);
                  }}
                  className="flex-1 rounded border border-escola-border bg-escola-card px-1.5 py-0.5 font-mono text-[10px] text-escola-creme"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(p.prompt);
                    setInfo(`✓ Prompt ${p.id} copiado`);
                    setTimeout(() => setInfo(null), 1500);
                  }}
                  className="rounded border border-escola-border px-1.5 py-0.5 text-[9px] text-escola-creme-50 hover:text-escola-creme"
                >
                  copiar
                </button>
                <button
                  onClick={() => {
                    if (!confirm(`Apagar prompt ${p.id}?`)) return;
                    const next = promptsDraft.filter((_, idx) => idx !== i);
                    setPromptsDraft(next);
                    setPromptsDirty(true);
                  }}
                  className="rounded border border-escola-border px-1.5 py-0.5 text-[9px] text-escola-creme-50 hover:text-escola-terracota"
                >
                  ✗
                </button>
              </div>
              <input
                value={p.mood.join(", ")}
                onChange={(e) => {
                  const next = [...promptsDraft];
                  next[i] = {
                    ...next[i],
                    mood: e.target.value
                      .split(",")
                      .map((m) => m.trim())
                      .filter(Boolean),
                  };
                  setPromptsDraft(next);
                  setPromptsDirty(true);
                }}
                placeholder="mood (vírgulas)"
                className="mb-1 w-full rounded border border-escola-border bg-escola-card px-1.5 py-0.5 text-[10px] text-escola-creme-50"
              />
              <textarea
                value={p.prompt}
                onChange={(e) => {
                  const next = [...promptsDraft];
                  next[i] = { ...next[i], prompt: e.target.value };
                  setPromptsDraft(next);
                  setPromptsDirty(true);
                }}
                rows={3}
                className="w-full rounded border border-escola-border bg-escola-card px-1.5 py-1 text-[10px] text-escola-creme"
              />

              {/* Clip MJ Video slot — upload + preview + delete */}
              <ClipSlot
                promptId={p.id}
                clipUrl={p.clipUrl}
                clipDurationSec={p.clipDurationSec}
                upload={clipUpload[p.id]}
                onUpload={(file) => uploadClipForPrompt(p.id, file)}
                onDelete={() => deleteClipForPrompt(p.id)}
                disabled={promptsDirty}
              />
            </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          💡 Geras a imagem em Midjourney → usa <b>Image to Video</b> +{" "}
          <b>Extend</b> (3× para chegar aos 15-20s) → faz upload do MP4 aqui.
          Pode ser horizontal ou vertical (a Fase 3 escala/crop ao formato
          final). Limite Supabase: 200MB por clip.
          {promptsDirty && (
            <>
              {" "}
              <span className="text-escola-terracota">
                ⚠ guarda as edições aos prompts antes de upload (o id pode
                mudar e o clip ficaria órfão).
              </span>
            </>
          )}
        </p>
      </section>

      {/* ── Render final long-form ──────────────────────────────── */}
      <section className="rounded-xl border border-escola-dourado/40 bg-escola-dourado/5 p-4">
        <h2 className="mb-2 text-sm font-semibold text-escola-dourado">
          🎬 Render long-form (1920×1080)
        </h2>
        {project.videoUrl ? (
          <div className="mb-3 space-y-2">
            <video
              src={project.videoUrl}
              controls
              preload="metadata"
              className="aspect-video w-full max-w-2xl rounded border border-escola-dourado/40"
            />
            <p className="text-[10px] text-escola-creme-50">
              <code>{project.videoUrl}</code>
            </p>
          </div>
        ) : (
          <p className="mb-3 text-[11px] text-escola-creme-50">
            Sem render ainda. Quando narração + ≥1 clip estão prontos, gera o
            MP4 final aqui (corre em GitHub Actions, ~5-15 min).
          </p>
        )}

        <div className="space-y-3 text-xs">
          {/* Música */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Música de fundo (Ancient Ground · loop com ducking)
            </label>
            <select
              value={selectedMusic[0] ?? ""}
              onChange={(e) =>
                setSelectedMusic(e.target.value ? [e.target.value] : [])
              }
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            >
              <option value="">— escolhe uma faixa —</option>
              {tracks.map((t) => (
                <option key={t.url} value={t.url}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-escola-creme-50">Volume:</span>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="flex-1 max-w-xs"
              />
              <span className="text-[10px] text-escola-creme">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Crossfade */}
          <div className="flex items-center gap-2 text-[11px]">
            <label className="text-escola-creme-50 w-32 shrink-0">
              Crossfade entre clips
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={crossfade}
              onChange={(e) => setCrossfade(parseFloat(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="w-12 text-right text-escola-creme">
              {crossfade.toFixed(1)}s
            </span>
            <span className="text-[10px] text-escola-creme-50">
              (1.0-1.5s contemplativo, &gt;2s arrastado)
            </span>
          </div>

          {/* Brand */}
          <label className="flex items-center gap-2 text-[11px] text-escola-creme">
            <input
              type="checkbox"
              checked={includeBrand}
              onChange={(e) => setIncludeBrand(e.target.checked)}
            />
            Intro + outro com mandala &quot;A ESCOLA DOS VÉUS&quot; (5s cada)
          </label>

          {/* Botões render */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => submitRender(true)}
              disabled={
                rendering || !project.narrationUrl || selectedMusic.length === 0
              }
              className="rounded border border-escola-dourado px-3 py-2 text-[11px] font-semibold text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-40"
              title="Render rápido dos primeiros 90s (CRF26 ultrafast). Para validar sync + legendas + layout sem gastar render completo. NÃO substitui o vídeo final."
            >
              ⏱ Preview (90s · 1-2 min)
            </button>
            <button
              onClick={() => submitRender(false)}
              disabled={
                rendering || !project.narrationUrl || selectedMusic.length === 0
              }
              className="rounded bg-escola-dourado px-4 py-2 font-semibold text-escola-bg disabled:opacity-40"
            >
              {rendering
                ? "A renderizar..."
                : project.videoUrl
                  ? "↻ Re-render completo"
                  : "🎬 Render long-form"}
            </button>
            <span className="text-[10px] text-escola-creme-50">
              {(project.prompts ?? []).filter((p) => p.clipUrl).length}/
              {(project.prompts ?? []).length} cenas com clip
              {project.narrationUrl ? " · narração ✓" : " · ✗ sem narração"}
            </span>
          </div>

          {renderErr && (
            <p className="text-xs text-escola-terracota">{renderErr}</p>
          )}

          {renderProgress && (
            <div className="rounded border border-escola-dourado/40 bg-escola-card p-2">
              <div className="mb-1 flex items-center justify-between text-[10px]">
                <span className="text-escola-dourado">
                  {renderProgress.status === "done"
                    ? "✓ Render terminado"
                    : renderProgress.status === "failed"
                      ? "✗ Render falhou"
                      : `Status: ${renderProgress.status}${renderProgress.phase ? ` · ${renderProgress.phase}` : ""}`}
                </span>
                <span className="text-escola-creme-50">
                  {typeof renderProgress.progress === "number"
                    ? `${renderProgress.progress}%`
                    : ""}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-escola-bg">
                <div
                  className="h-full bg-escola-dourado transition-all"
                  style={{ width: `${renderProgress.progress ?? 0}%` }}
                />
              </div>
              {renderProgress.error && (
                <p className="mt-1 text-[10px] text-escola-terracota">
                  {renderProgress.error}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <details className="rounded border border-escola-border bg-escola-card/40 p-3 text-[10px] text-escola-creme-50">
        <summary className="cursor-pointer text-escola-creme">
          📍 Próximos passos (Fase 2/3)
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Cola cada prompt no MJ → guarda imagens em Supabase. Este passo vai
            ter UI dedicada na Fase 2 (drag &amp; drop tipo /funil/gerar).
          </li>
          <li>
            Cola o script no ElevenLabs Pro → gera 1 MP3 ou 4-5 chunks → faz
            upload → cola URL acima.
          </li>
          <li>
            Quando tiveres MP3 + clips Runway, a Fase 3 vai render automático
            o long-form 15-25 min com capítulos visuais e crossfades 1-2s.
          </li>
        </ol>
      </details>
    </div>
  );
}

// ─── ClipSlot ───────────────────────────────────────────────────────────────
// Per-prompt slot: upload MJ Video clip, preview inline, replace/delete.
// File picker + progress bar quando uploading. Aceita drag-and-drop.
//
// Limite 200MB (Supabase). Aspect ratio livre — a Fase 3 escala/crop ao
// formato final (1920x1080 horizontal long-form ou 1080x1920 vertical).

function ClipSlot({
  promptId,
  clipUrl,
  clipDurationSec,
  upload,
  onUpload,
  onDelete,
  disabled,
}: {
  promptId: string;
  clipUrl?: string;
  clipDurationSec?: number;
  upload?: { stage: "signing" | "uploading" | "finalizing"; progress: number };
  onUpload: (file: File) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const inputId = `clip-up-${promptId}`;
  const isBusy = !!upload;
  return (
    <div className="mt-2 rounded border border-escola-border bg-escola-card/40 p-2">
      {clipUrl && !isBusy ? (
        <div className="flex items-start gap-2">
          <video
            src={clipUrl}
            className="h-16 w-28 shrink-0 rounded border border-escola-border bg-black"
            muted
            preload="metadata"
            onMouseEnter={(e) =>
              (e.currentTarget as HTMLVideoElement).play().catch(() => {})
            }
            onMouseLeave={(e) => {
              const v = e.currentTarget as HTMLVideoElement;
              v.pause();
              v.currentTime = 0;
            }}
          />
          <div className="flex-1 text-[10px] text-escola-creme-50">
            <p className="text-escola-dourado">
              ✓ Clip pronto
              {clipDurationSec ? ` · ${clipDurationSec.toFixed(1)}s` : ""}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <label
                htmlFor={inputId}
                className="cursor-pointer rounded border border-escola-border bg-escola-bg px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
              >
                ↻ trocar
              </label>
              <button
                onClick={onDelete}
                disabled={disabled}
                className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-terracota disabled:opacity-40"
              >
                ✗ apagar
              </button>
              <a
                href={clipUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
              >
                abrir ↗
              </a>
            </div>
          </div>
        </div>
      ) : isBusy ? (
        <div>
          <p className="text-[10px] text-escola-dourado">
            {upload!.stage === "signing"
              ? "A pedir signed URL..."
              : upload!.stage === "uploading"
                ? `A enviar... ${upload!.progress}%`
                : "A guardar no projecto..."}
          </p>
          <div className="mt-1 h-1 w-full rounded bg-escola-border">
            <div
              className="h-full rounded bg-escola-dourado transition-all"
              style={{ width: `${upload!.progress}%` }}
            />
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`flex cursor-pointer items-center gap-2 text-[10px] ${
            disabled
              ? "cursor-not-allowed opacity-40"
              : "text-escola-creme-50 hover:text-escola-creme"
          }`}
        >
          <span className="rounded bg-escola-coral/20 px-2 py-0.5 text-[10px] font-semibold text-escola-coral">
            📤 Upload MP4 (MJ Video)
          </span>
          <span>
            ou arrasta — sem clip = vai precisar de gerar antes do render final
          </span>
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        className="hidden"
        disabled={isBusy || disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}