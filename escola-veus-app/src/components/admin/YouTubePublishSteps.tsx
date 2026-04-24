"use client";

// YouTubePublishSteps: UX de publicação manual em 3 passos numerados,
// inspirada na secção 7 do funil. Consistência visual — o teu fluxo de
// publicar AG fica igual ao de publicar um ep Nomear.
//
// Usado no Calendário AG em cada slot que tenha vídeo associado, e também
// na biblioteca de vídeos AG para publicação pontual.

import { useState } from "react";

type Channel = "cursos" | "ag" | "loranne";

const STUDIO_URLS: Record<Channel, string> = {
  // YouTube Studio abre o canal actualmente activo. Para forçar o canal
  // certo, o utilizador tem de trocar no avatar (canto sup dir). O AG tem
  // canal próprio — se a Vivianne já estiver logada nele, cai lá direto.
  cursos: "https://studio.youtube.com/channel/UC/videos/upload",
  ag: "https://studio.youtube.com/channel/UC/videos/upload",
  loranne: "https://studio.youtube.com/channel/UC/videos/upload",
};

export function YouTubePublishSteps({
  videoUrl,
  title,
  description,
  tags = [],
  thumbnailUrl,
  channel = "ag",
  channelLabel,
  kind = "long",
}: {
  videoUrl: string;
  title: string;
  description: string;
  tags?: string[];
  thumbnailUrl?: string | null;
  channel?: Channel;
  channelLabel?: string;
  // "long" (~GB) = ficheiro não passa pelo Web Share, instruímos download manual.
  // "short" (~10MB) = partilha ficheiro directo via canShare+files no mobile.
  kind?: "long" | "short";
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const doCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1400);
    } catch { /* ignore */ }
  };

  // Para ficheiros grandes NÃO podemos fazer fetch+blob no browser (1GB+
  // rebenta a memória do telemóvel e o Safari abre o MP4 inline em vez de
  // descarregar). Usamos o parâmetro ?download=<filename> do Supabase
  // Storage que devolve Content-Disposition: attachment, forçando o browser
  // a guardar em Ficheiros/Downloads em vez de fazer preview.
  const downloadDirect = (url: string, filename: string) => {
    const sep = url.includes("?") ? "&" : "?";
    const downloadUrl = `${url}${sep}download=${encodeURIComponent(filename)}`;
    // Cria anchor e dispara click — no desktop descarrega, no iOS abre
    // "Save to Files" no share sheet do Safari.
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    a.download = filename; // desktop honra isto; iOS/Android usam Content-Disposition
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const nativeShareFile = async () => {
    // Só faz sentido para shorts (<50MB). Longos não passam pelo Web Share.
    setShareMsg("A preparar ficheiro...");
    try {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const filename = videoUrl.split("/").pop()?.split("?")[0] || "video.mp4";
      const file = new File([blob], filename, { type: blob.type || "video/mp4" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ title, text: description.slice(0, 200), files: [file] });
        setShareMsg(null);
      } else if (canShare) {
        await navigator.share({ title, text: description.slice(0, 200), url: videoUrl });
        setShareMsg("Partilhado só link (ficheiro não suportado aqui).");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/abort|cancel/i.test(msg)) setShareMsg(`Erro: ${msg}`);
    } finally {
      setTimeout(() => setShareMsg(null), 3000);
    }
  };

  const nativeShareLink = async () => {
    // Para longos: partilha só o URL (WhatsApp/email/etc). YouTube app não
    // aceita URLs como fonte de upload — para isso é mesmo baixar e upload
    // manual da galeria.
    try {
      if (canShare) {
        await navigator.share({ title, text: description.slice(0, 200), url: videoUrl });
      } else {
        await navigator.clipboard.writeText(videoUrl);
        setShareMsg("Link copiado.");
        setTimeout(() => setShareMsg(null), 2500);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/abort|cancel/i.test(msg)) setShareMsg(`Erro: ${msg}`);
    }
  };

  const slug = (title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
  const filename = `${slug}.mp4`;
  const tagsStr = tags.join(", ");

  return (
    <section className="rounded-xl border border-escola-dourado/40 bg-escola-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-escola-dourado">
          📤 Publicar no YouTube
        </h3>
        <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
          {channelLabel || (channel === "ag" ? "canal AG · 3 passos" : "3 passos")}
        </span>
      </div>

      {/* Passo 1: Guardar / Partilhar ficheiros */}
      <div className="mb-3 rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">1</span>
          Guardar ficheiros no teu dispositivo
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => downloadDirect(videoUrl, filename)}
            className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
          >
            ⬇ MP4 (vídeo)
          </button>
          {canShare && kind === "short" && (
            <button
              onClick={nativeShareFile}
              className="rounded border border-escola-dourado px-3 py-2 font-semibold text-escola-dourado"
              title="No mobile abre o sheet de partilha (YouTube Shorts, TikTok, IG Reels)"
            >
              ↗ Partilhar MP4
            </button>
          )}
          {canShare && kind === "long" && (
            <button
              onClick={nativeShareLink}
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
              title="Partilha só o link (WhatsApp/email). YouTube não aceita URL como upload — usa ⬇ MP4."
            >
              ↗ Partilhar link
            </button>
          )}
          {thumbnailUrl && (
            <button
              onClick={() => downloadDirect(thumbnailUrl, `${slug}-thumb.png`)}
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ Thumbnail
            </button>
          )}
        </div>
        {shareMsg && <p className="mt-2 text-[10px] text-escola-creme-50">{shareMsg}</p>}
        {kind === "long" ? (
          <div className="mt-2 rounded border border-escola-coral/30 bg-escola-coral/5 p-2 text-[11px] text-escola-creme-50">
            <p className="mb-1 text-escola-coral">📱 No telemóvel (vídeo longo ~1 GB)</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Carrega <strong className="text-escola-creme">⬇ MP4</strong> — guarda em Ficheiros/Galeria (pode demorar 2-5 min).</li>
              <li>Abre a app <strong className="text-escola-creme">YouTube</strong> (não Studio).</li>
              <li>Toca no <strong className="text-escola-creme">+</strong> em baixo → <strong className="text-escola-creme">Upload a video</strong> → escolhe o MP4 da galeria.</li>
              <li>Cola título/descrição/tags dos passos 3 abaixo.</li>
            </ol>
            <p className="mt-1">
              Partilhar o ficheiro directo não funciona para vídeos deste tamanho — a app YouTube não aceita ficheiros via share sheet, e Web Share API explode em GBs.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-escola-creme-50">
            📱 Mobile: <strong>↗ Partilhar MP4</strong> abre o sheet nativo → YouTube Shorts / TikTok / IG Reels envia o ficheiro directo.
            💻 Desktop: usa <strong>⬇ MP4</strong> e arrasta para o Studio.
          </p>
        )}
      </div>

      {/* Passo 2: Abrir YouTube Studio */}
      <div className="mb-3 rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">2</span>
          Abrir YouTube Studio {channel === "ag" ? "(confirma canal Ancient Ground)" : ""}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href={STUDIO_URLS[channel]}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
          >
            → Abrir YouTube Studio Upload
          </a>
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          {channel === "ag"
            ? "No canto superior direito do Studio, clica no avatar e confirma que estás no canal Ancient Ground antes de fazer upload."
            : "Arrasta o MP4 para a janela do Studio e preenche os campos abaixo."}
        </p>
      </div>

      {/* Passo 3: Copiar campos */}
      <div className="rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">3</span>
          Copiar campos e colar no Studio
        </p>
        <div className="space-y-2 text-xs">
          <CopyRow
            label={`Título (${title.length}/100)`}
            value={title}
            copied={copied === "title"}
            onCopy={() => doCopy("title", title)}
            rows={1}
            warn={title.length > 100}
          />
          <CopyRow
            label={`Descrição (${description.length}/5000)`}
            value={description}
            copied={copied === "desc"}
            onCopy={() => doCopy("desc", description)}
            rows={6}
            warn={description.length > 5000}
          />
          {tags.length > 0 && (
            <CopyRow
              label={`Tags (${tags.length} · separadas por vírgula)`}
              value={tagsStr}
              copied={copied === "tags"}
              onCopy={() => doCopy("tags", tagsStr)}
              rows={2}
            />
          )}
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          💡 Edita livremente antes de copiar — são só sugestões.
        </p>
      </div>

      <p className="mt-3 text-[10px] text-escola-creme-50">
        ⚙️ Quando configurares o OAuth do {channel === "ag" ? "canal AG (envs YT_AG_*)" : "canal (envs OAuth)"}, este bloco ganha um botão &quot;Publicar &amp; agendar automaticamente&quot;.
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
        <label className={`text-[10px] uppercase tracking-wider ${warn ? "text-red-400" : "text-escola-creme-50"}`}>
          {label}
        </label>
        <button
          onClick={onCopy}
          disabled={!value}
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
            copied
              ? "bg-green-700 text-white"
              : "bg-escola-dourado/20 text-escola-dourado hover:bg-escola-dourado/30"
          } disabled:opacity-30`}
        >
          {copied ? "✓ Copiado" : "📋 Copiar"}
        </button>
      </div>
      <textarea
        value={value}
        readOnly
        rows={rows}
        className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
      />
    </div>
  );
}
