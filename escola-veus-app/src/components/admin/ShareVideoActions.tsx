"use client";

// ShareVideoActions: botões mobile-first para partilhar vídeos gerados
// (shorts AG ou vídeo longo AG) directamente do telemóvel para YouTube,
// TikTok, Instagram, WhatsApp, etc. via Web Share API.
//
// Modos:
// - "short" (~10–30 MB): tenta partilhar o FICHEIRO (permite upload directo
//   na app receptora — TikTok abre o composer, IG abre Reels, etc.). Se o
//   navegador não suportar, cai para partilhar só o URL.
// - "long" (GB): só URL. A app receptora (YouTube Studio) descarrega de lá.

import { useState } from "react";

type ShareMode = "short" | "long";

export function ShareVideoActions({
  videoUrl,
  title,
  text,
  mode,
}: {
  videoUrl: string;
  title: string;
  text?: string;
  mode: ShareMode;
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof (navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare === "function";

  const hasNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Falhou copiar link.");
    }
  };

  const shareUrlOnly = async () => {
    setBusy(true);
    setStatus(null);
    try {
      if (hasNativeShare) {
        await navigator.share({ title, text, url: videoUrl });
      } else {
        await copyUrl();
        setStatus("Navegador sem partilha nativa — link copiado. Cola onde quiseres publicar.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/abort|cancel/i.test(msg)) setStatus(`Partilha: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async () => {
    setBusy(true);
    setStatus("A preparar ficheiro...");
    try {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const filename = videoUrl.split("/").pop()?.split("?")[0] || "video.mp4";
      const file = new File([blob], filename, { type: blob.type || "video/mp4" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        setStatus(null);
      } else if (hasNativeShare) {
        await navigator.share({ title, text, url: videoUrl });
        setStatus("Partilhado apenas link (ficheiro não suportado aqui).");
      } else {
        await copyUrl();
        setStatus("Sem partilha nativa — link copiado.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/abort|cancel/i.test(msg)) setStatus(`Fallback para link: ${msg}`);
      try {
        if (hasNativeShare) await navigator.share({ title, text, url: videoUrl });
      } catch { /* user cancel or unsupported */ }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {mode === "short" && canShareFiles && (
          <button
            onClick={shareFile}
            disabled={busy}
            className="min-w-[140px] flex-1 rounded bg-escola-coral px-4 py-3 text-sm font-semibold text-white disabled:opacity-30"
          >
            {busy ? "..." : "📤 Partilhar (TikTok / IG / YT)"}
          </button>
        )}
        <button
          onClick={shareUrlOnly}
          disabled={busy}
          className={`${
            mode === "long" ? "min-w-[140px] flex-1 bg-escola-coral text-white" : "border border-escola-border text-escola-creme hover:bg-escola-border/20"
          } rounded px-4 py-3 text-sm font-semibold disabled:opacity-30`}
        >
          {mode === "long" ? "📤 Partilhar link" : "🔗 Partilhar só link"}
        </button>
        <button
          onClick={copyUrl}
          className="rounded border border-escola-border px-4 py-3 text-sm text-escola-creme hover:bg-escola-border/20"
        >
          {copied ? "✓ Copiado" : "📋 Copiar link"}
        </button>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-escola-border px-4 py-3 text-sm text-escola-creme hover:bg-escola-border/20"
        >
          ⬇️ Abrir MP4
        </a>
      </div>
      {status && <p className="text-xs text-escola-creme-50">{status}</p>}
      {mode === "short" && !canShareFiles && (
        <p className="text-xs text-escola-creme-50">
          💡 Para partilha directa para TikTok / Instagram / YouTube, abre esta página no telemóvel.
        </p>
      )}
      {mode === "long" && (
        <p className="text-xs text-escola-creme-50">
          Vídeo longo (GB) — partilhamos o link do Supabase. No YouTube Studio (telemóvel) cola o link para descarregar e publicar.
        </p>
      )}
    </div>
  );
}
