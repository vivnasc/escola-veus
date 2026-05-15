"use client";

import { useState } from "react";

interface Props {
  motionUrl: string;
  motionName: string;
  audioUrl: string | null;
  phrase: string;
  dateLabel: string;
  captionInstagram: string;
  captionTiktok: string;
  captionWhatsapp: string;
}

/**
 * Painel para download manual dos componentes do post de hoje.
 * Util enquanto o pipeline de render automatico nao esta pronto:
 * a utilizadora baixa os 4 ficheiros, combina manualmente na app de
 * Stories/Reels e publica.
 */
export function ManualDownloadPanel({
  motionUrl,
  motionName,
  audioUrl,
  phrase,
  dateLabel,
  captionInstagram,
  captionTiktok,
  captionWhatsapp,
}: Props) {
  const [composingPng, setComposingPng] = useState(false);
  const [pngError, setPngError] = useState<string | null>(null);

  const slug = (phrase || "frase")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const downloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadRemote = async (url: string, filename: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objUrl);
  };

  const composePng = async () => {
    setComposingPng(true);
    setPngError(null);
    try {
      const frame = await extractMotionFrame(motionUrl);
      const png = await drawOverlay(frame, phrase, dateLabel);
      const a = document.createElement("a");
      a.href = png;
      a.download = `vc-sabia-${slug}.png`;
      a.click();
    } catch (e) {
      setPngError(e instanceof Error ? e.message : String(e));
    } finally {
      setComposingPng(false);
    }
  };

  const fullCaptionTxt = `WHATSAPP STATUS\n${"=".repeat(40)}\n${captionWhatsapp}\n\n\nINSTAGRAM\n${"=".repeat(40)}\n${captionInstagram}\n\n\nTIKTOK\n${"=".repeat(40)}\n${captionTiktok}\n`;

  return (
    <section className="space-y-3 rounded-lg border border-escola-dourado/40 bg-escola-dourado/5 p-4">
      <div>
        <h2 className="font-serif text-lg text-escola-dourado">
          Pacote para postar hoje
        </h2>
        <p className="text-xs text-escola-creme-50">
          Baixa os ficheiros e combina manualmente no Stories/Reels enquanto
          o pipeline de render automático não está pronto.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            downloadText(`vc-sabia-${slug}-captions.txt`, fullCaptionTxt)
          }
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20"
        >
          ↓ Captions (.txt)
        </button>

        <button
          onClick={() => downloadRemote(motionUrl, `${motionName}`)}
          disabled={!motionUrl}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
        >
          ↓ Motion (.mp4)
        </button>

        <button
          onClick={() =>
            audioUrl &&
            downloadRemote(audioUrl, `vc-sabia-${slug}-audio.mp3`)
          }
          disabled={!audioUrl}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
          title={audioUrl ? undefined : "Não há áudio activo para o mood deste motion"}
        >
          ↓ Áudio (.mp3)
        </button>

        <button
          onClick={composePng}
          disabled={composingPng}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
        >
          {composingPng ? "A compor…" : "↓ Frame com texto (.png)"}
        </button>
      </div>

      {pngError && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {pngError}
        </div>
      )}

      <div className="text-[11px] text-escola-creme-50">
        <strong className="text-escola-creme">Como usar:</strong> baixa o
        Frame .png + o áudio .mp3. No WhatsApp, mete o png como Status e o
        áudio dá para anexar separado. No Instagram/TikTok, importa o motion
        .mp4 + áudio .mp3 no editor (CapCut, etc) e cola por cima o png
        como overlay com fade-in.
      </div>
    </section>
  );
}

/** Extrai 1 frame do motion via canvas. */
function extractMotionFrame(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.style.position = "fixed";
    video.style.left = "-9999px";
    video.style.opacity = "0";
    document.body.appendChild(video);

    let done = false;
    const cleanup = () => {
      try {
        document.body.removeChild(video);
      } catch {
        /* ignore */
      }
    };
    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      fn();
    };
    const timer = setTimeout(
      () => finish(() => reject(new Error("timeout a ler motion"))),
      15000
    );

    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1920;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("ctx null");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(() => resolve(canvas.toDataURL("image/png")));
      } catch (e) {
        finish(() => reject(e));
      }
    };

    video.addEventListener("seeked", capture, { once: true });
    video.addEventListener(
      "loadedmetadata",
      () => {
        const t = Math.min(0.5, (video.duration || 1) / 4);
        if (Math.abs(video.currentTime - t) < 0.001) capture();
        else video.currentTime = t;
      },
      { once: true }
    );
    video.addEventListener("error", () =>
      finish(() => reject(new Error("erro a carregar motion")))
    );
    video.src = url;
    video.load();
  });
}

/** Compõe o overlay variante C sobre o frame e devolve dataURL PNG. */
async function drawOverlay(
  frameDataUrl: string,
  phrase: string,
  dateLabel: string
): Promise<string> {
  const img = new Image();
  img.src = frameDataUrl;
  await img.decode();

  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ctx null");

  // Fundo: motion frame em cover
  const ratio = Math.max(W / img.width, H / img.height);
  const drawW = img.width * ratio;
  const drawH = img.height * ratio;
  ctx.drawImage(img, (W - drawW) / 2, (H - drawH) / 2, drawW, drawH);

  // Vinheta inferior para legibilidade
  const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Cartão de vidro fosco (variante C)
  const cardX = 90;
  const cardW = W - cardX * 2;
  const cardY = 880;
  const cardH = 760;
  const radius = 28;

  ctx.save();
  roundedRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fill();
  // Moldura dourada
  ctx.strokeStyle = "rgba(212,175,55,0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Cantos dourados decorativos
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3;
  const corner = 36;
  drawCornerL(ctx, cardX + 18, cardY + 18, corner, "tl");
  drawCornerL(ctx, cardX + cardW - 18, cardY + 18, corner, "tr");
  drawCornerL(ctx, cardX + 18, cardY + cardH - 18, corner, "bl");
  drawCornerL(ctx, cardX + cardW - 18, cardY + cardH - 18, corner, "br");

  // Kicker
  ctx.fillStyle = "#D4AF37";
  ctx.font = "italic 56px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.fillText("Sabias que...", W / 2, cardY + 110);

  // Frase (wrap)
  ctx.fillStyle = "#FAF7F0";
  ctx.font = "italic 60px 'Cormorant Garamond', serif";
  const lines = wrapText(ctx, phrase, cardW - 120);
  let y = cardY + 240;
  const lineHeight = 80;
  for (const ln of lines) {
    ctx.fillText(ln, W / 2, y);
    y += lineHeight;
  }

  // Footer: data + assinatura
  ctx.fillStyle = "rgba(250,247,240,0.65)";
  ctx.font = "22px sans-serif";
  ctx.fillText(dateLabel, W / 2, H - 80);
  ctx.fillStyle = "#D4AF37";
  ctx.font = "22px sans-serif";
  ctx.fillText("seteveus.space", W / 2, H - 48);

  return canvas.toDataURL("image/png");
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCornerL(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pos: "tl" | "tr" | "bl" | "br"
) {
  ctx.beginPath();
  if (pos === "tl") {
    ctx.moveTo(x, y + size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
  } else if (pos === "tr") {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + size);
  } else if (pos === "bl") {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
  } else {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - size);
  }
  ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
