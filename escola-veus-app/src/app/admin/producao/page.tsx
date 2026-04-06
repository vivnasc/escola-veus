"use client";

import { useState, useRef } from "react";
import { getAllCourses } from "@/data/courses";
import type { CourseData } from "@/types/course";

const DEFAULT_VOICE_ID = "fnoNuVpfClX7lHKFbyZ2";

type AudioStatus = "idle" | "generating" | "done" | "error";
type ImageStatus = "idle" | "generating" | "done" | "error";

type SubLessonStatus = {
  audioStatus: AudioStatus;
  audioUrl: string | null;
  audioError: string | null;
  imageStatus: ImageStatus;
  imageUrl: string | null;
  imageError: string | null;
};

function lessonKey(courseSlug: string, modNum: number, letter: string) {
  return `${courseSlug}-m${modNum}-${letter}`;
}

export default function CourseProductionPage() {
  const [apiKey, setApiKey] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [modelo, setModelo] = useState<"v2" | "v3">("v2");
  const [comfyuiUrl, setComfyuiUrl] = useState("");
  const [loraName, setLoraName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [statuses, setStatuses] = useState<Record<string, SubLessonStatus>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const shouldStop = useRef(false);

  const courses = getAllCourses();
  const course = courses.find((c) => c.slug === selectedCourse) || null;

  function getStatus(key: string): SubLessonStatus {
    return (
      statuses[key] || {
        audioStatus: "idle",
        audioUrl: null,
        audioError: null,
        imageStatus: "idle",
        imageUrl: null,
        imageError: null,
      }
    );
  }

  function updateStatus(key: string, patch: Partial<SubLessonStatus>) {
    setStatuses((prev) => ({
      ...prev,
      [key]: { ...getStatus(key), ...patch },
    }));
  }

  async function generateAudio(
    courseSlug: string,
    modNum: number,
    letter: string,
    script: string
  ) {
    const key = lessonKey(courseSlug, modNum, letter);
    if (!apiKey.trim()) return;

    updateStatus(key, { audioStatus: "generating", audioError: null });

    try {
      const res = await fetch("/api/admin/courses/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          courseSlug,
          moduleNum: modNum,
          subLetter: letter,
          voiceId: voiceId.trim(),
          apiKey: apiKey.trim(),
          model: modelo,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("audio/")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        updateStatus(key, { audioStatus: "done", audioUrl: url });
      } else {
        const data = await res.json();
        updateStatus(key, { audioStatus: "done", audioUrl: data.url });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      updateStatus(key, { audioStatus: "error", audioError: msg });
    }
  }

  async function generateImage(
    courseSlug: string,
    modNum: number,
    letter: string,
    prompt: string
  ) {
    const key = lessonKey(courseSlug, modNum, letter);
    if (!comfyuiUrl.trim()) return;

    updateStatus(key, { imageStatus: "generating", imageError: null });

    try {
      const { buildLandscapeWorkflow } = await import(
        "@/lib/comfyui-workflows"
      );
      const workflow = buildLandscapeWorkflow({
        prompt,
        loraName: loraName || undefined,
      });

      const res = await fetch("/api/admin/courses/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comfyuiUrl: comfyuiUrl.trim(),
          workflow,
          courseSlug,
          moduleNum: modNum,
          assetType: "landscape",
          filename: `landscape-m${modNum}-${letter.toLowerCase()}.png`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const data = await res.json();
      updateStatus(key, { imageStatus: "done", imageUrl: data.url });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      updateStatus(key, { imageStatus: "error", imageError: msg });
    }
  }

  async function batchGenerateAudio(c: CourseData) {
    if (!apiKey.trim()) {
      alert("Coloca a API key do ElevenLabs.");
      return;
    }

    shouldStop.current = false;
    setBatchRunning(true);

    const allLessons: { mod: number; letter: string; title: string; desc: string }[] = [];
    for (const mod of c.modules) {
      for (const sub of mod.subLessons) {
        allLessons.push({
          mod: mod.number,
          letter: sub.letter,
          title: sub.title,
          desc: sub.description,
        });
      }
    }

    setBatchProgress({ current: 0, total: allLessons.length });

    for (let i = 0; i < allLessons.length; i++) {
      if (shouldStop.current) break;
      setBatchProgress({ current: i + 1, total: allLessons.length });

      const lesson = allLessons[i];
      const key = lessonKey(c.slug, lesson.mod, lesson.letter);
      const status = getStatus(key);

      if (status.audioStatus === "done") continue;

      const script = `${lesson.title}. ${lesson.desc}`;
      await generateAudio(c.slug, lesson.mod, lesson.letter, script);

      if (i < allLessons.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setBatchRunning(false);
    setBatchProgress({ current: 0, total: 0 });
  }

  const audioCount = course
    ? Object.keys(statuses).filter(
        (k) => k.startsWith(course.slug) && statuses[k]?.audioStatus === "done"
      ).length
    : 0;
  const totalLessons = course
    ? course.modules.reduce((a, m) => a + m.subLessons.length, 0)
    : 0;

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-escola-creme">
        Producao de Cursos
      </h1>
      <p className="text-sm text-escola-creme-50 mt-1 mb-8">
        Pipeline: scripts — audio (ElevenLabs) — imagens (ThinkDiffusion) — Supabase
      </p>

      {/* Config section */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-4 mb-8 space-y-4">
        <h2 className="font-serif text-xl font-medium text-escola-creme">
          Configuracao
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">
              ElevenLabs API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
              placeholder="xi-..."
            />
          </div>
          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">
              Voice ID
            </label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">
              Modelo ElevenLabs
            </label>
            <select
              value={modelo}
              onChange={(e) => setModelo(e.target.value as "v2" | "v3")}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            >
              <option value="v2">Multilingual v2</option>
              <option value="v3">Eleven v3</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">
              ComfyUI URL (ThinkDiffusion)
            </label>
            <input
              type="text"
              value={comfyuiUrl}
              onChange={(e) => setComfyuiUrl(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
              placeholder="https://your-instance.thinkdiffusion.com"
            />
          </div>
          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">
              LoRA Model Name (opcional)
            </label>
            <input
              type="text"
              value={loraName}
              onChange={(e) => setLoraName(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
              placeholder="mundo-dos-veus-v1.safetensors"
            />
          </div>
        </div>
      </div>

      {/* Course selector */}
      <div className="mb-8">
        <label className="text-xs text-escola-creme-50 block mb-2">
          Selecciona o curso
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full max-w-md rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
        >
          <option value="">-- Escolhe um curso --</option>
          {courses.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.number}. {c.title} — {c.subtitle}
            </option>
          ))}
        </select>
      </div>

      {/* Course production panel */}
      {course && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-medium text-escola-creme">
                {course.title}
              </h2>
              <p className="text-sm text-escola-dourado">{course.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-escola-creme-50">
                Audio: {audioCount}/{totalLessons}
              </span>
              {batchRunning ? (
                <button
                  onClick={() => {
                    shouldStop.current = true;
                  }}
                  className="rounded-lg bg-escola-terracota/80 px-4 py-3 text-sm font-medium text-escola-creme hover:bg-escola-terracota"
                >
                  Parar ({batchProgress.current}/{batchProgress.total})
                </button>
              ) : (
                <button
                  onClick={() => batchGenerateAudio(course)}
                  disabled={!apiKey.trim()}
                  className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-50"
                >
                  Gerar todos os audios
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {totalLessons > 0 && (
            <div className="mb-6">
              <div className="h-1 overflow-hidden rounded-full bg-escola-border">
                <div
                  className="h-full rounded-full bg-escola-dourado transition-all"
                  style={{ width: `${(audioCount / totalLessons) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Modules */}
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <details
                key={mod.number}
                className="rounded-xl border border-escola-border bg-escola-card overflow-hidden group"
              >
                <summary className="flex items-center justify-between px-4 py-4 cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-escola-dourado w-8">
                      {String(mod.number).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-escola-creme">{mod.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
                      {mod.subLessons.length} sub-aulas
                    </span>
                    <span className="text-escola-creme-50 group-open:rotate-180 transition-transform">
                      &#9662;
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-4 border-t border-escola-border space-y-3 pt-4">
                  {mod.subLessons.map((sub) => {
                    const key = lessonKey(course.slug, mod.number, sub.letter);
                    const st = getStatus(key);
                    return (
                      <div
                        key={sub.letter}
                        className="flex items-start gap-4 rounded-lg border border-escola-border bg-escola-bg p-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-escola-dourado">
                              {sub.letter})
                            </span>
                            <span className="text-sm text-escola-creme">
                              {sub.title}
                            </span>
                          </div>
                          <p className="text-xs text-escola-creme-50 truncate">
                            {sub.description}
                          </p>
                          {st.audioError && (
                            <p className="text-xs text-escola-terracota mt-1">
                              {st.audioError}
                            </p>
                          )}
                          {st.audioUrl && (
                            <audio
                              controls
                              src={st.audioUrl}
                              className="mt-2 h-8 w-full max-w-xs"
                            />
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() =>
                              generateAudio(
                                course.slug,
                                mod.number,
                                sub.letter,
                                `${sub.title}. ${sub.description}`
                              )
                            }
                            disabled={
                              !apiKey.trim() ||
                              st.audioStatus === "generating"
                            }
                            className={`text-xs rounded-lg px-3 py-1.5 border ${
                              st.audioStatus === "done"
                                ? "border-escola-dourado/30 bg-escola-dourado/10 text-escola-dourado"
                                : st.audioStatus === "generating"
                                ? "border-escola-border bg-escola-card text-escola-creme-50 animate-pulse"
                                : st.audioStatus === "error"
                                ? "border-escola-terracota/30 bg-escola-terracota/10 text-escola-terracota"
                                : "border-escola-border bg-escola-card text-escola-creme-50 hover:border-escola-dourado/40"
                            }`}
                          >
                            {st.audioStatus === "generating"
                              ? "A gerar..."
                              : st.audioStatus === "done"
                              ? "Audio OK"
                              : st.audioStatus === "error"
                              ? "Tentar de novo"
                              : "Gerar audio"}
                          </button>
                          <button
                            onClick={() =>
                              generateImage(
                                course.slug,
                                mod.number,
                                sub.letter,
                                sub.description
                              )
                            }
                            disabled={
                              !comfyuiUrl.trim() ||
                              st.imageStatus === "generating"
                            }
                            className={`text-xs rounded-lg px-3 py-1.5 border ${
                              st.imageStatus === "done"
                                ? "border-escola-dourado/30 bg-escola-dourado/10 text-escola-dourado"
                                : st.imageStatus === "generating"
                                ? "border-escola-border bg-escola-card text-escola-creme-50 animate-pulse"
                                : st.imageStatus === "error"
                                ? "border-escola-terracota/30 bg-escola-terracota/10 text-escola-terracota"
                                : "border-escola-border bg-escola-card text-escola-creme-50 hover:border-escola-dourado/40"
                            }`}
                          >
                            {st.imageStatus === "generating"
                              ? "A gerar..."
                              : st.imageStatus === "done"
                              ? "Imagem OK"
                              : st.imageStatus === "error"
                              ? "Tentar de novo"
                              : "Gerar imagem"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
