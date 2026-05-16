"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Auto-tag de motions noturnos via Claude vision.
 *
 * Para cada motion da library extrai um frame (canvas → base64 jpeg)
 * e envia em batch para `/api/admin/hoje-em-mim/motions/auto-tag`,
 * que devolve o mood (1 de 10) por URL. O resultado é persistido em
 * `motion-prompts.json` (campo `moodByMotion`), e a partir daí o
 * pareamento motion↔dia↔áudio na pré-montagem usa estas tags.
 *
 * O frame é extraído no cliente, não no servidor, para não pagar
 * download dos MP4 (alguns até 150 MB) duas vezes.
 */

type Motion = { url: string; name: string; sizeBytes: number };

const BATCH_SIZE = 20;

export function AutoTagMotionsSection() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [moodByMotion, setMoodByMotion] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; phase: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [reasoningLog, setReasoningLog] = useState<string[]>([]);
  const cancelRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("/api/admin/hoje-em-mim/motions"),
        fetch("/api/admin/hoje-em-mim/motion-prompts"),
      ]);
      const mJson = await mRes.json();
      const pJson = await pRes.json();
      if (mRes.ok) setMotions(mJson.motions ?? []);
      if (pRes.ok) setMoodByMotion(pJson.moodByMotion ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const extractFrame = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const v = document.createElement("video");
      v.crossOrigin = "anonymous";
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.src = url;
      let settled = false;
      const cleanup = () => {
        v.removeAttribute("src");
        v.load();
      };
      const fail = (msg: string) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(msg));
      };
      const timeout = setTimeout(() => fail("timeout a carregar video"), 20000);
      v.addEventListener("loadeddata", () => {
        // Avança um pouco para garantir que não é frame preto
        try {
          v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
        } catch {
          /* alguns iOS lançam aqui */
        }
      });
      v.addEventListener("seeked", () => {
        if (settled) return;
        try {
          const w = v.videoWidth;
          const h = v.videoHeight;
          if (!w || !h) return fail("video sem dimensões");
          // Reduz para 360p curto, mais que suficiente para Claude vision
          const targetW = 270;
          const scale = targetW / w;
          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = Math.round(h * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return fail("canvas sem 2d");
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
          const b64 = dataUrl.split(",")[1];
          settled = true;
          clearTimeout(timeout);
          cleanup();
          resolve(b64);
        } catch (err) {
          fail(err instanceof Error ? err.message : String(err));
        }
      });
      v.addEventListener("error", () => fail("erro a carregar video"));
    });

  const persistMoods = async (next: Record<string, string>) => {
    await fetch("/api/admin/hoje-em-mim/motion-prompts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ moodByMotion: next }),
    });
  };

  const runAutoTag = async (mode: "missing" | "all") => {
    setRunning(true);
    setError(null);
    setReasoningLog([]);
    cancelRef.current = false;
    try {
      const targets =
        mode === "all"
          ? motions
          : motions.filter((m) => !moodByMotion[m.url]);
      if (targets.length === 0) {
        setError("Não há motions para taggear.");
        setRunning(false);
        return;
      }

      // Fase 1: extrair frames (cliente)
      const frames: Array<{ url: string; name: string; base64: string }> = [];
      for (let i = 0; i < targets.length; i++) {
        if (cancelRef.current) break;
        setProgress({
          done: i,
          total: targets.length,
          phase: "frame",
        });
        try {
          const b64 = await extractFrame(targets[i].url);
          frames.push({ url: targets[i].url, name: targets[i].name, base64: b64 });
        } catch (e) {
          setReasoningLog((l) => [
            ...l,
            `⚠ ${targets[i].name}: ${e instanceof Error ? e.message : String(e)}`,
          ]);
        }
      }
      if (cancelRef.current || frames.length === 0) {
        setRunning(false);
        setProgress(null);
        return;
      }

      // Fase 2: chamar Claude em batches
      const merged: Record<string, string> = { ...moodByMotion };
      for (let i = 0; i < frames.length; i += BATCH_SIZE) {
        if (cancelRef.current) break;
        const chunk = frames.slice(i, i + BATCH_SIZE);
        setProgress({
          done: i,
          total: frames.length,
          phase: `claude (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
        });
        const res = await fetch("/api/admin/hoje-em-mim/motions/auto-tag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ frames: chunk }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.erro ?? `HTTP ${res.status}`);
        }
        if (json.tags && typeof json.tags === "object") {
          Object.assign(merged, json.tags);
        }
        if (json.reasoning) {
          setReasoningLog((l) => [...l, `· ${json.reasoning}`]);
        }
        setMoodByMotion({ ...merged });
        // Persiste a cada batch para não perder se cair
        await persistMoods(merged);
      }

      setProgress({ done: frames.length, total: frames.length, phase: "done" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
      setTimeout(() => setProgress(null), 2000);
    }
  };

  const untaggedCount = motions.filter((m) => !moodByMotion[m.url]).length;
  const taggedCount = motions.length - untaggedCount;

  return (
    <section className="space-y-3 rounded-lg border border-escola-border bg-escola-card/30 p-3">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-serif text-base text-escola-dourado">
            🤖 Auto-tag motions (Claude vision)
          </h3>
          <p className="text-[11px] text-escola-creme-50">
            Classifica cada motion num dos 10 night moods. O pareamento da
            pré-montagem usa estas tags para casar motion + áudio + dia
            (sexta = lareira/tambor, sábado = coruja/brisa, etc).
            <br />
            {motions.length > 0 && (
              <span className="text-escola-creme">
                {taggedCount} tagged · {untaggedCount} por taggear
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => load()}
            disabled={loading || running}
            className="rounded-md border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme disabled:opacity-40"
          >
            Recarregar
          </button>
          <button
            onClick={() => runAutoTag("missing")}
            disabled={running || loading || untaggedCount === 0}
            className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
          >
            {running ? "A correr…" : `Taggear sem mood (${untaggedCount})`}
          </button>
          <button
            onClick={() => runAutoTag("all")}
            disabled={running || loading || motions.length === 0}
            className="rounded-md border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme disabled:opacity-40"
            title="Re-taggear todos, mesmo os que já têm mood"
          >
            Re-taggear tudo ({motions.length})
          </button>
          {running && (
            <button
              onClick={() => {
                cancelRef.current = true;
              }}
              className="rounded-md border border-red-700/60 bg-red-900/20 px-3 py-1.5 text-xs text-red-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {progress && (
        <div className="rounded border border-escola-dourado/40 bg-escola-dourado/10 p-2 text-[11px] text-escola-dourado">
          {progress.phase} · {progress.done}/{progress.total}
          <div className="mt-1 h-1 w-full rounded bg-escola-dourado/20">
            <div
              className="h-1 rounded bg-escola-dourado"
              style={{
                width:
                  progress.total > 0
                    ? `${(progress.done / progress.total) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
          {error}
        </div>
      )}

      {reasoningLog.length > 0 && (
        <details className="rounded border border-escola-border bg-escola-bg/50 p-2 text-[10px] text-escola-creme-50">
          <summary className="cursor-pointer">Log do Claude ({reasoningLog.length})</summary>
          <div className="mt-1 space-y-1 max-h-40 overflow-y-auto">
            {reasoningLog.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">{l}</div>
            ))}
          </div>
        </details>
      )}

      {motions.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {motions.map((m) => {
            const mood = moodByMotion[m.url];
            return (
              <div
                key={m.url}
                className="relative overflow-hidden rounded border border-escola-border"
              >
                <video
                  src={m.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black object-cover"
                  onMouseEnter={(e) => {
                    const v = e.currentTarget;
                    v.currentTime = 0;
                    v.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1">
                  <div className="truncate text-[9px] text-escola-creme">
                    {m.name}
                  </div>
                  <div
                    className="text-[9px]"
                    style={{ color: mood ? "#d4a853" : "#7a7264" }}
                  >
                    {mood ? `🏷 ${mood}` : "sem mood"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
