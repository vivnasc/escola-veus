"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { professionalCarousels, reelScripts, thematicHub, WEEKLY_RHYTHM, nicheCarousels } from "@/data/content-calendar-weeks";
import type { CarouselSlide } from "@/data/content-calendar-weeks";
import { capcutContent, AUDIO_BASE_PATH } from "@/data/capcut-content";
import { REELS_VOZ, CARROSSEIS_VOZ, EDUCATIVOS_VOZ } from "@/data/marketing-reels-audio";
import { isMobile } from "@/lib/export-image";

const AUTHOR_EMAILS = ["viv.saraiva@gmail.com"];
const DIMS = { w: 1080, h: 1080 };
const STORY_DIMS = { w: 1080, h: 1920 };

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentPiece = {
  id: string;
  label: string;
  type: "carousel" | "feed" | "reel" | "capcut";
  slides?: CarouselSlide[];
  caption?: string;
  reelScript?: { hook: string; scenes: string[]; cta: string; music: string; duration: string };
  capcutEntry?: typeof capcutContent[0];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHashtags(text: string): string {
  return text.replace(/\n*#[^\s#]+(\s+#[^\s#]+)*/g, "").trim();
}

async function saveImage(dataUrl: string, filename: string): Promise<void> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  if (isMobile() && typeof navigator.share === "function" && typeof navigator.canShare === "function") {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch { /* fallthrough */ }
    }
  }
  if (isMobile()) {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } else {
    const a = document.createElement("a");
    a.download = filename;
    a.href = dataUrl;
    a.click();
  }
}

function getDayName(d: number): string {
  return ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][d];
}

function getDateStr(): string {
  const d = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/** Build today's content pool — max 3 pieces, all visual */
function buildTodayPool(): ContentPiece[] {
  const today = new Date().getDay();
  const r = WEEKLY_RHYTHM[today];
  const dayData = thematicHub[r.themeIdx]?.days[r.dayIdx];
  const pool: ContentPiece[] = [];

  // 1. Visual from thematicHub (carousel or feed post)
  if (dayData) {
    for (const slot of dayData.slots) {
      if (slot.carousel && slot.carousel.length > 0) {
        pool.push({
          id: `hub-carousel-${pool.length}`,
          label: dayData.theme,
          type: "carousel",
          slides: slot.carousel,
          caption: slot.caption,
        });
      } else if (slot.visual) {
        pool.push({
          id: `hub-feed-${pool.length}`,
          label: dayData.theme,
          type: "feed",
          slides: [{
            bg: slot.visual.bg, text: slot.visual.text, accent: slot.visual.accent,
            title: slot.visual.title, body: slot.visual.body || "", footer: slot.visual.footer || "",
          }],
          caption: slot.caption,
        });
      }
      if (pool.length >= 2) break; // max 2 from hub
    }
  }

  // 2. Educational carousel (rotates by day of year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const eduIdx = dayOfYear % nicheCarousels.length;
  const edu = nicheCarousels[eduIdx];
  pool.push({
    id: edu.id,
    label: edu.title,
    type: "carousel",
    slides: edu.slides,
    caption: edu.caption,
  });

  return pool.slice(0, 3);
}

// ─── Slide Preview Components ─────────────────────────────────────────────────

function SlidePreview({ slide, index, scale }: { slide: CarouselSlide; index: number; scale: number }) {
  return (
    <div style={{
      width: DIMS.w, height: DIMS.h,
      transform: `scale(${scale})`, transformOrigin: "top left",
      backgroundColor: slide.bg, color: slide.text,
      position: "relative", overflow: "hidden",
    }}>
      {slide.bgImage && (
        <>
          <img src={slide.bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: slide.bg, opacity: 0.82 }} />
        </>
      )}
      <div style={{ position: "absolute", right: 60, top: 60, width: 60, height: 60, borderRadius: "50%",
        backgroundColor: slide.accent + "25", color: slide.accent, display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "system-ui, sans-serif", fontSize: 22, fontWeight: 700 }}>
        {index + 1}
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "120px 90px" }}>
        {slide.title && (
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 72,
            lineHeight: 1.15, fontWeight: 700, whiteSpace: "pre-line", margin: 0 }}>{slide.title}</h2>
        )}
        {slide.title && slide.body && (
          <div style={{ width: "10%", height: 3, backgroundColor: slide.accent, opacity: 0.6, margin: "44px 0" }} />
        )}
        {slide.body && (
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 34, lineHeight: 1.6,
            whiteSpace: "pre-line", margin: 0, opacity: 0.85 }}>{slide.body}</p>
        )}
      </div>
      {slide.footer && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 90px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 22, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase", color: slide.accent, margin: 0 }}>{slide.footer}</p>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 36, opacity: 0.3, color: slide.accent }}>~</span>
          </div>
        </div>
      )}
      <img src="/images/mandala-7veus.png" alt=""
        style={{ position: "absolute", left: 60, bottom: 60, width: 60, height: 60, opacity: 0.1, objectFit: "contain" }} />
    </div>
  );
}

function SlidePreviewVertical({ slide, index, scale }: { slide: CarouselSlide; index: number; scale: number }) {
  return (
    <div style={{
      width: STORY_DIMS.w, height: STORY_DIMS.h,
      transform: `scale(${scale})`, transformOrigin: "top left",
      backgroundColor: slide.bg, color: slide.text,
      position: "relative", overflow: "hidden",
    }}>
      {slide.bgImage && (
        <>
          <img src={slide.bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: slide.bg, opacity: 0.82 }} />
        </>
      )}
      <div style={{ position: "absolute", left: 60, top: 80, width: 80, height: 80, borderRadius: "50%",
        backgroundColor: slide.accent + "30", color: slide.accent, display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "system-ui, sans-serif", fontSize: 32, fontWeight: 700 }}>
        {index + 1}
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "200px 90px" }}>
        {slide.title && (
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 80,
            lineHeight: 1.15, fontWeight: 700, whiteSpace: "pre-line", margin: 0 }}>{slide.title}</h2>
        )}
        {slide.title && slide.body && (
          <div style={{ width: "12%", height: 4, backgroundColor: slide.accent, opacity: 0.7, margin: "48px 0" }} />
        )}
        {slide.body && (
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 38, lineHeight: 1.55,
            whiteSpace: "pre-line", margin: 0 }}>{slide.body}</p>
        )}
      </div>
      {slide.footer && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 90px 100px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 26, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase", color: slide.accent, margin: 0 }}>{slide.footer}</p>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 40, opacity: 0.3, color: slide.accent }}>~</span>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "80px 90px 0", display: "flex", justifyContent: "flex-end" }}>
        <img src="/images/mandala-7veus.png" alt="" style={{ width: 80, height: 80, opacity: 0.12, objectFit: "contain" }} />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  type View = "hoje" | "arquivo";
  type ArquivoSub = "carrosseis" | "feed" | "status" | "reels" | "educativo";

  const [view, setView] = useState<View>("hoje");
  const [arquivoSub, setArquivoSub] = useState<ArquivoSub>("carrosseis");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [published, setPublished] = useState<string[]>([]);

  // Export state
  const [hubModal, setHubModal] = useState<{ slides: CarouselSlide[]; title: string; caption?: string } | null>(null);
  const hubSlideSquareRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hubSlideVertRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hubExportingSquare, setHubExportingSquare] = useState<number | "all" | null>(null);
  const [hubExportingVert, setHubExportingVert] = useState<number | "all" | null>(null);

  // CapCut modal
  const [capcutModal, setCapcutModal] = useState<typeof capcutContent[0] | null>(null);
  const capcutSlideSquareRef = useRef<HTMLDivElement | null>(null);
  const capcutSlideVertRef = useRef<HTMLDivElement | null>(null);
  const [capcutExportingSquare, setCapcutExportingSquare] = useState(false);
  const [capcutExportingVert, setCapcutExportingVert] = useState(false);

  const todayPool = useMemo(() => buildTodayPool(), []);
  const today = new Date().getDay();
  const rhythm = WEEKLY_RHYTHM[today];
  const piece = todayPool[currentIdx];

  // Load published from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sv-published");
      if (stored) setPublished(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const markPublished = useCallback((id: string) => {
    setPublished(prev => {
      const next = [...prev, id];
      localStorage.setItem("sv-published", JSON.stringify(next));
      return next;
    });
  }, []);

  const captureElement = useCallback(async (el: HTMLElement, dims: { w: number; h: number }, filename: string) => {
    const { toPng } = await import("html-to-image");
    const orig = { t: el.style.transform, w: el.style.width, h: el.style.height };
    el.style.transform = "none";
    el.style.width = `${dims.w}px`;
    el.style.height = `${dims.h}px`;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
    await Promise.all(imgs.map((img) => img.complete ? Promise.resolve() : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); })));
    try {
      const opts = { width: dims.w, height: dims.h, pixelRatio: 1, skipAutoScale: true };
      await toPng(el, opts);
      const dataUrl = await toPng(el, opts);
      await saveImage(dataUrl, filename);
    } finally {
      el.style.transform = orig.t;
      el.style.width = orig.w;
      el.style.height = orig.h;
    }
  }, []);

  const exportHubSlide = useCallback(async (idx: number, fmt: "square" | "vert") => {
    const refs = fmt === "square" ? hubSlideSquareRefs : hubSlideVertRefs;
    const wrapper = refs.current[idx];
    if (!wrapper) return;
    const el = (wrapper.firstElementChild as HTMLElement) || wrapper;
    const dims = fmt === "vert" ? STORY_DIMS : DIMS;
    if (fmt === "square") setHubExportingSquare(idx); else setHubExportingVert(idx);
    try {
      await captureElement(el, dims, `slide-${idx + 1}-${fmt}.png`);
    } catch (err) {
      console.error("Erro ao exportar slide", idx + 1, err);
    }
    if (fmt === "square") setHubExportingSquare(null); else setHubExportingVert(null);
  }, [captureElement]);

  const exportAllHub = useCallback(async (count: number, fmt: "square" | "vert") => {
    const refs = fmt === "square" ? hubSlideSquareRefs : hubSlideVertRefs;
    const dims = fmt === "vert" ? STORY_DIMS : DIMS;
    if (fmt === "square") setHubExportingSquare("all"); else setHubExportingVert("all");
    for (let i = 0; i < count; i++) {
      const wrapper = refs.current[i];
      if (!wrapper) continue;
      const el = (wrapper.firstElementChild as HTMLElement) || wrapper;
      try {
        await captureElement(el, dims, `slide-${i + 1}-${fmt}.png`);
      } catch (err) {
        console.error("Erro ao exportar slide", i + 1, err);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (fmt === "square") setHubExportingSquare(null); else setHubExportingVert(null);
  }, [captureElement]);

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  useEffect(() => {
    if (!loading && !user) router.push("/entrar");
    else if (!loading && user && !AUTHOR_EMAILS.includes(user.email || "")) router.push("/membro");
  }, [loading, user, router]);

  if (loading || !user || !AUTHOR_EMAILS.includes(user.email || "")) {
    return <div className="flex min-h-screen items-center justify-center bg-[#1a1814]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9b896]/30 border-t-[#c9b896]" /></div>;
  }

  // ── Archive data ──────────────────────────────────────────────────────────
  const hubFeedPosts = thematicHub.flatMap((week) =>
    week.days.flatMap((day) =>
      day.slots
        .filter((s) => s.visual != null)
        .map((s, i) => ({
          id: `feed-${week.weekNumber}-${day.day}-${i}`,
          theme: day.theme,
          weekTitle: week.title,
          slide: {
            bg: s.visual!.bg, text: s.visual!.text, accent: s.visual!.accent,
            title: s.visual!.title || "", body: s.visual!.body || "", footer: s.visual!.footer || "",
          },
          caption: s.caption,
        }))
    )
  );

  const hubStatusPosts = thematicHub.flatMap((week) =>
    week.days.flatMap((day) =>
      day.slots
        .filter((s) => s.type === "WhatsApp Status" && s.carousel && s.carousel.length > 0)
        .map((s, i) => ({
          id: `status-${week.weekNumber}-${day.day}-${i}`,
          theme: day.theme,
          weekTitle: week.title,
          slides: s.carousel!,
          caption: s.caption,
        }))
    )
  );

  return (
    <>
    <div className="min-h-screen bg-[#1a1814]">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 border-b border-[#c9b896]/10 bg-[#1a1814]/95 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-1.5 font-sans text-xs text-[#c9b896]/50 hover:text-[#c9b896]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Painel
            </Link>
            <p className="font-serif text-sm font-medium tracking-wide text-cream/90">Conteúdo</p>
            <Link href="/painel/marketing/gerador"
              className="rounded-lg border border-[#c9b896]/30 px-2.5 py-1.5 font-sans text-[0.6rem] font-medium text-[#c9b896]/80 hover:border-[#c9b896]/60">
              Gerador
            </Link>
          </div>

          {/* ── Nav: Hoje / Arquivo ── */}
          <div className="mt-3 flex gap-1">
            {([
              { id: "hoje" as const, label: "Hoje" },
              { id: "arquivo" as const, label: "Arquivo" },
            ]).map((s) => (
              <button key={s.id} onClick={() => setView(s.id)}
                className={`flex-1 rounded-xl py-2 font-sans text-[0.7rem] font-semibold transition-all ${
                  view === s.id
                    ? "bg-[#c9b896] text-[#1a1814]"
                    : "text-cream/30 hover:text-cream/50 hover:bg-cream/5"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-28">

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* HOJE — uma recomendação, tudo pronto                                 */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {view === "hoje" && (
          <div className="py-6 space-y-5">

            {/* Day header */}
            <div className="text-center space-y-2">
              <p className="font-serif text-lg text-cream/90">{getDayName(today)}</p>
              <p className="font-sans text-xs text-cream/40">{getDateStr()}</p>
              <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[#c9b896]/20 bg-[#c9b896]/8 px-4 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9b896" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="font-sans text-xs font-semibold text-[#c9b896]">{rhythm.bestTime}</span>
                <span className="font-sans text-[0.55rem] text-[#c9b896]/60">{rhythm.bestTimeNote}</span>
              </div>
            </div>

            {/* Progress dots (like Lumina) */}
            <div className="flex items-center justify-center gap-2">
              {todayPool.map((_, i) => (
                <button key={i} onClick={() => setCurrentIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIdx ? "w-6 bg-[#c9b896]" : "w-2 bg-cream/15 hover:bg-cream/25"
                  }`} />
              ))}
            </div>

            {/* THE recommendation */}
            {piece && (
              <div className="space-y-4">

                {/* Label */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[#c9b896]/50">
                      {piece.type === "carousel" ? `Carrossel · ${piece.slides?.length || 0} slides` : piece.type === "feed" ? "Post Feed" : piece.type === "reel" ? "Reel" : "CapCut"}
                    </p>
                    <p className="mt-0.5 font-serif text-sm text-cream/70">{piece.label}</p>
                  </div>
                  {published.includes(piece.id) && (
                    <span className="rounded-full bg-green-900/30 px-2.5 py-1 font-sans text-[0.5rem] font-semibold text-green-400/80">Publicado</span>
                  )}
                </div>

                {/* Visual preview — tap to open export modal */}
                {piece.slides && piece.slides.length > 0 && (
                  <button
                    onClick={() => setHubModal({ slides: piece.slides!, title: piece.label, caption: piece.caption })}
                    className="w-full overflow-hidden rounded-2xl text-left transition-all active:scale-[0.98] hover:opacity-90"
                    style={{ backgroundColor: piece.slides[0].bg }}>
                    <div className="p-6">
                      {piece.slides[0].title && (
                        <p className="font-serif text-base font-bold leading-snug" style={{ color: piece.slides[0].text, whiteSpace: "pre-line" }}>
                          {piece.slides[0].title}
                        </p>
                      )}
                      {piece.slides[0].body && (
                        <p className="mt-2 font-sans text-xs leading-relaxed" style={{ color: piece.slides[0].text, opacity: 0.7, whiteSpace: "pre-line" }}>
                          {piece.slides[0].body}
                        </p>
                      )}
                      {piece.slides[0].footer && (
                        <p className="mt-3 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.15em]" style={{ color: piece.slides[0].accent }}>
                          {piece.slides[0].footer}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: piece.slides[0].text + "15" }}>
                      <div className="flex items-center gap-1.5">
                        {piece.slides.length > 1 && piece.slides.map((sl, sli) => (
                          <div key={sli} className="rounded-sm" style={{
                            width: sli === 0 ? 14 : 6, height: 6,
                            backgroundColor: sli === 0 ? piece.slides![0].accent : sl.bg === piece.slides![0].bg ? piece.slides![0].text + "30" : sl.bg,
                            opacity: sli === 0 ? 1 : 0.5,
                          }} />
                        ))}
                        <span className="ml-1 font-sans text-[0.5rem] font-semibold uppercase tracking-widest" style={{ color: piece.slides[0].text, opacity: 0.3 }}>
                          {piece.slides.length > 1 ? `${piece.slides.length} slides` : "1:1 + 9:16"} · Toca para exportar
                        </span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={piece.slides[0].accent} strokeWidth="2.5" opacity="0.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                  </button>
                )}

                {/* Caption */}
                {piece.caption && (
                  <div className="rounded-2xl border border-cream/8 bg-[#222019] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-cream/25">Legenda</span>
                      <button onClick={() => copyText(piece.id, piece.caption!)}
                        className="rounded bg-cream/8 px-2.5 py-1 font-sans text-[0.5rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                        {copiedId === piece.id ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                    <p className="font-sans text-xs leading-relaxed text-cream/50 whitespace-pre-wrap">
                      {stripHashtags(piece.caption)}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!published.includes(piece.id) && (
                    <button onClick={() => markPublished(piece.id)}
                      className="flex-1 rounded-xl bg-[#c9b896] py-3 font-sans text-xs font-bold text-[#1a1814] transition-all hover:opacity-90 active:scale-[0.98]">
                      Publicado
                    </button>
                  )}
                  {currentIdx < todayPool.length - 1 && (
                    <button onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="flex-1 rounded-xl border border-cream/10 py-3 font-sans text-xs font-semibold text-cream/40 transition-all hover:border-cream/20 hover:text-cream/60">
                      Outro
                    </button>
                  )}
                </div>
              </div>
            )}

            {!piece && (
              <div className="rounded-2xl border border-cream/5 bg-[#222019] p-8 text-center">
                <p className="font-sans text-xs text-cream/30">Sem conteúdo para hoje.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ARQUIVO — todo o conteúdo organizado por tipo                        */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {view === "arquivo" && (
          <div className="py-4">
            {/* Sub-nav */}
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-none mb-4">
              <div className="flex gap-1" style={{ width: "max-content" }}>
                {([
                  { id: "carrosseis" as const, label: "Carrosseis", count: professionalCarousels.length },
                  { id: "feed" as const, label: "Feed", count: hubFeedPosts.length },
                  { id: "status" as const, label: "Status", count: hubStatusPosts.length },
                  { id: "reels" as const, label: "Reels", count: capcutContent.length + reelScripts.length },
                  { id: "educativo" as const, label: "Educativo", count: nicheCarousels.length },
                ] satisfies { id: ArquivoSub; label: string; count: number }[]).map((s) => (
                  <button key={s.id} onClick={() => setArquivoSub(s.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-sans text-[0.65rem] font-semibold whitespace-nowrap transition-all ${
                      arquivoSub === s.id
                        ? "bg-[#c9b896] text-[#1a1814]"
                        : "text-cream/30 hover:text-cream/50 hover:bg-cream/5"
                    }`}>
                    {s.label}
                    <span className={`rounded-full px-1.5 py-px font-mono text-[0.45rem] ${
                      arquivoSub === s.id ? "bg-[#1a1814]/20 text-[#1a1814]/70" : "bg-cream/10 text-cream/25"
                    }`}>{s.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Carrosseis ── */}
            {arquivoSub === "carrosseis" && (
              <div className="space-y-2">
                {professionalCarousels.map((car, ci) => {
                  const vozMatch = CARROSSEIS_VOZ.find(cv => cv.carouselId === car.id);
                  return (
                  <div key={car.id} className="overflow-hidden rounded-2xl">
                    <button
                      onClick={() => setHubModal({ slides: car.slides, title: car.title, caption: car.caption })}
                      className="w-full overflow-hidden text-left transition-all active:scale-[0.98] hover:opacity-90"
                      style={{ backgroundColor: car.slides[0]?.bg || "#3d3630" }}>
                      <div className="p-5">
                        <p className="font-serif text-sm font-bold leading-snug" style={{ color: car.slides[0]?.text || "#f7f5f0", whiteSpace: "pre-line" }}>
                          {car.slides[0]?.title || car.title}
                        </p>
                        {car.description && <p className="mt-2 font-sans text-[0.65rem] leading-relaxed" style={{ color: car.slides[0]?.text || "#f7f5f0", opacity: 0.6 }}>{car.description}</p>}
                      </div>
                      <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: (car.slides[0]?.text || "#f7f5f0") + "15" }}>
                        <div className="flex items-center gap-1.5">
                          {car.slides.map((sl, sli) => (
                            <div key={sli} className="rounded-sm" style={{ width: sli === 0 ? 16 : 8, height: 8, backgroundColor: sli === 0 ? (sl.accent || "#c9b896") : sl.bg, opacity: sli === 0 ? 1 : 0.45 }} />
                          ))}
                          <span className="ml-1 font-sans text-[0.5rem] font-semibold uppercase tracking-widest" style={{ color: car.slides[0]?.text || "#f7f5f0", opacity: 0.3 }}>
                            {car.slides.length} slides{vozMatch ? " · com audio" : ""}
                          </span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={car.slides[0]?.accent || "#c9b896"} strokeWidth="2.5" opacity="0.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                    </button>
                    {car.caption && (
                      <div className="border-t border-cream/5 bg-[#1a1814] px-4 pb-4 pt-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-cream/25">Legenda</span>
                          <button onClick={() => copyText(`carr-${ci}`, car.caption!)}
                            className="rounded bg-cream/8 px-2 py-0.5 font-sans text-[0.45rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                            {copiedId === `carr-${ci}` ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <p className="font-sans text-[0.6rem] leading-relaxed text-cream/40 whitespace-pre-wrap">{car.caption}</p>
                      </div>
                    )}
                    {vozMatch && (
                      <div className="border-t border-[#c9b896]/10 bg-[#c9b896]/5 px-4 pb-4 pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-[#c9b896]/50">Narracao · Vivianne</span>
                          <a href={`${AUDIO_BASE_PATH}/${vozMatch.ficheiro}`} download={vozMatch.ficheiro}
                            className="rounded bg-[#c9b896]/15 px-2 py-0.5 font-sans text-[0.45rem] font-semibold text-[#c9b896]/70 hover:bg-[#c9b896]/25 transition-all">
                            Baixar
                          </a>
                        </div>
                        <audio controls preload="metadata" className="w-full rounded-xl" style={{ height: 36, colorScheme: "dark" }}>
                          <source src={`${AUDIO_BASE_PATH}/${vozMatch.ficheiro}`} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}

            {/* ── Feed ── */}
            {arquivoSub === "feed" && (
              <div className="space-y-2">
                {hubFeedPosts.map((item, fi) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl">
                    <button
                      onClick={() => setHubModal({ slides: [item.slide], title: item.theme, caption: item.caption })}
                      className="w-full overflow-hidden text-left transition-all active:scale-[0.98] hover:opacity-90"
                      style={{ backgroundColor: item.slide.bg }}>
                      <div className="p-5">
                        {item.slide.title && <p className="font-serif text-sm font-bold leading-snug" style={{ color: item.slide.text, whiteSpace: "pre-line" }}>{item.slide.title}</p>}
                        {item.slide.body && <p className="mt-2 font-sans text-[0.65rem] leading-relaxed" style={{ color: item.slide.text, opacity: 0.7, whiteSpace: "pre-line" }}>{item.slide.body}</p>}
                        {item.slide.footer && <p className="mt-3 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.15em]" style={{ color: item.slide.accent }}>{item.slide.footer}</p>}
                      </div>
                      <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: item.slide.text + "15" }}>
                        <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-widest" style={{ color: item.slide.text, opacity: 0.3 }}>1:1 + 9:16 · {item.weekTitle}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={item.slide.accent} strokeWidth="2.5" opacity="0.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                    </button>
                    {item.caption && (
                      <div className="border-t border-cream/5 bg-[#1a1814] px-4 pb-4 pt-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-cream/25">Legenda</span>
                          <button onClick={() => copyText(`feed-${fi}`, item.caption!)}
                            className="rounded bg-cream/8 px-2 py-0.5 font-sans text-[0.45rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                            {copiedId === `feed-${fi}` ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <p className="font-sans text-[0.6rem] leading-relaxed text-cream/40 whitespace-pre-wrap">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Status ── */}
            {arquivoSub === "status" && (
              <div className="space-y-2">
                {hubStatusPosts.map((item, si) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl">
                    <button
                      onClick={() => setHubModal({ slides: item.slides, title: item.theme, caption: item.caption })}
                      className="w-full overflow-hidden text-left transition-all active:scale-[0.98] hover:opacity-90"
                      style={{ backgroundColor: item.slides[0]?.bg || "#3d3630" }}>
                      <div className="flex gap-3 p-5">
                        <div className="shrink-0 rounded-lg overflow-hidden flex flex-col justify-center px-1.5"
                          style={{ width: 40, height: 72, backgroundColor: item.slides[0]?.bg }}>
                          <p className="font-serif text-center leading-tight" style={{ fontSize: 4.5, color: item.slides[0]?.text, whiteSpace: "pre-line" }}>
                            {item.slides[0]?.title?.split("\n").slice(0, 5).join("\n")}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm font-bold leading-snug" style={{ color: item.slides[0]?.text || "#f7f5f0", whiteSpace: "pre-line" }}>
                            {item.slides[0]?.title?.split("\n").slice(0, 2).join("\n")}
                          </p>
                          <p className="mt-1 font-sans text-[0.55rem]" style={{ color: item.slides[0]?.text || "#f7f5f0", opacity: 0.4 }}>{item.theme}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: (item.slides[0]?.text || "#f7f5f0") + "15" }}>
                        <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-widest" style={{ color: item.slides[0]?.text || "#f7f5f0", opacity: 0.3 }}>
                          {item.slides.length} imagem{item.slides.length > 1 ? "ns" : ""} · 9:16 · {item.weekTitle}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={item.slides[0]?.accent || "#c9b896"} strokeWidth="2.5" opacity="0.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                    </button>
                    {item.caption && (
                      <div className="border-t border-cream/5 bg-[#1a1814] px-4 pb-4 pt-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-cream/25">Legenda</span>
                          <button onClick={() => copyText(`status-${si}`, item.caption!)}
                            className="rounded bg-cream/8 px-2 py-0.5 font-sans text-[0.45rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                            {copiedId === `status-${si}` ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <p className="font-sans text-[0.6rem] leading-relaxed text-cream/40 whitespace-pre-wrap">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Reels ── */}
            {arquivoSub === "reels" && (
              <div className="space-y-4">
                {/* CapCut */}
                <div className="space-y-2">
                  <p className="font-sans text-[0.55rem] text-cream/25">CapCut · imagem + audio</p>
                  {capcutContent.map((entry) => (
                    <button key={entry.id}
                      onClick={() => setCapcutModal(entry)}
                      className="w-full rounded-2xl border border-cream/10 bg-[#222019] p-3 text-left transition-all hover:border-[#c9b896]/20 active:scale-[0.98]">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 rounded-xl overflow-hidden" style={{ width: 56, height: 56, backgroundColor: entry.slide.bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "6px" }}>
                          <p className="font-serif leading-tight text-center" style={{ fontSize: 6, color: entry.slide.text, whiteSpace: "pre-line" }}>{entry.slide.title}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-semibold text-cream/70 truncate">{entry.title}</p>
                          <p className="mt-0.5 font-sans text-[0.55rem] text-cream/30 truncate">{entry.categoryLabel}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 rounded-lg border border-[#c9b896]/20 px-2 py-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9b896" strokeWidth="2" opacity="0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          <span className="font-sans text-[0.45rem] font-semibold text-[#c9b896]/50">CapCut</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Narração de Reels */}
                <div className="space-y-2">
                  <p className="font-sans text-[0.55rem] text-cream/25">Narracao · voz da Vivianne · {REELS_VOZ.length} audios</p>
                  {REELS_VOZ.map((rv) => (
                    <div key={rv.id} className="overflow-hidden rounded-2xl border border-cream/10 bg-[#222019]">
                      <div className="px-4 py-3 border-b border-cream/5">
                        <p className="font-sans text-xs font-semibold text-cream/70">{rv.nome}</p>
                        <p className="mt-1 font-mono text-[0.45rem] text-cream/20">{rv.ficheiro}</p>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        <p className="font-sans text-[0.6rem] leading-relaxed text-cream/40 italic">&ldquo;{rv.texto}&rdquo;</p>
                        <audio controls preload="metadata" className="w-full rounded-xl" style={{ height: 40, colorScheme: "dark" }}>
                          <source src={`${AUDIO_BASE_PATH}/${rv.ficheiro}`} type="audio/mpeg" />
                        </audio>
                        <div className="flex items-center justify-between">
                          <button onClick={() => copyText(rv.id, rv.texto)}
                            className="rounded bg-cream/8 px-2.5 py-1 font-sans text-[0.45rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                            {copiedId === rv.id ? "Copiado" : "Copiar texto"}
                          </button>
                          <a href={`${AUDIO_BASE_PATH}/${rv.ficheiro}`} download={rv.ficheiro}
                            className="rounded bg-[#c9b896]/15 px-2.5 py-1 font-sans text-[0.45rem] font-semibold text-[#c9b896]/70 hover:bg-[#c9b896]/25 transition-all">
                            Baixar audio
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scripts de Reel */}
                <div className="space-y-2">
                  <p className="font-sans text-[0.55rem] text-cream/25">Scripts de Reel</p>
                  {reelScripts.map((reel, ri) => (
                    <div key={ri} className="overflow-hidden rounded-2xl border border-cream/10 bg-[#222019]">
                      <div className="px-4 py-3 border-b border-cream/5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-sans text-xs font-semibold text-cream/70 line-clamp-1">{reel.hook}</p>
                          <button onClick={() => copyText(`reel-${ri}`, [reel.hook, ...reel.scenes, `CTA: ${reel.cta}`].join("\n\n"))}
                            className="shrink-0 rounded-lg bg-cream/8 px-2.5 py-1 font-sans text-[0.5rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                            {copiedId === `reel-${ri}` ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <p className="mt-1 font-sans text-[0.5rem] text-cream/30">{reel.duration} · {reel.music.split(",")[0]}</p>
                      </div>
                      <div className="px-4 py-3 space-y-1.5">
                        {reel.scenes.map((scene, si) => (
                          <p key={si} className="font-sans text-[0.6rem] leading-relaxed text-cream/40">{scene}</p>
                        ))}
                        <p className="mt-2 font-sans text-[0.6rem] font-semibold text-[#c9b896]/60">CTA: {reel.cta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Educativo ── */}
            {arquivoSub === "educativo" && (
              <div className="space-y-2">
                <p className="mb-3 font-sans text-[0.55rem] text-cream/25">Carrosseis educativos · autoridade no nicho · {nicheCarousels.length} carrosseis</p>
                {nicheCarousels.map((car, ci) => {
                  const vozMatch = EDUCATIVOS_VOZ.find(ev => ev.carouselId === car.id);
                  return (
                  <div key={car.id} className="overflow-hidden rounded-2xl">
                    <button
                      onClick={() => setHubModal({ slides: car.slides, title: car.title, caption: car.caption })}
                      className="w-full overflow-hidden text-left transition-all active:scale-[0.98] hover:opacity-90"
                      style={{ backgroundColor: car.slides[0]?.bg || "#3d3630" }}>
                      <div className="p-5">
                        <p className="font-serif text-sm font-bold leading-snug" style={{ color: car.slides[0]?.text || "#f7f5f0", whiteSpace: "pre-line" }}>
                          {car.slides[0]?.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: (car.slides[0]?.text || "#f7f5f0") + "15" }}>
                        <div className="flex items-center gap-1.5">
                          {car.slides.map((sl, sli) => (
                            <div key={sli} className="rounded-sm" style={{ width: sli === 0 ? 16 : 8, height: 8, backgroundColor: sli === 0 ? (sl.accent || "#c9b896") : sl.bg, opacity: sli === 0 ? 1 : 0.45 }} />
                          ))}
                          <span className="ml-1 font-sans text-[0.5rem] font-semibold uppercase tracking-widest" style={{ color: car.slides[0]?.text || "#f7f5f0", opacity: 0.3 }}>
                            {car.slides.length} slides{vozMatch ? " · com audio" : ""}
                          </span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={car.slides[0]?.accent || "#c9b896"} strokeWidth="2.5" opacity="0.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                    </button>
                    {car.caption && (
                      <div className="border-t border-cream/5 bg-[#1a1814] px-4 pb-4 pt-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-cream/25">Legenda</span>
                          <button onClick={() => copyText(`edu-${ci}`, car.caption)}
                            className="rounded bg-cream/8 px-2 py-0.5 font-sans text-[0.45rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                            {copiedId === `edu-${ci}` ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <p className="font-sans text-[0.6rem] leading-relaxed text-cream/40 whitespace-pre-wrap">{car.caption}</p>
                      </div>
                    )}
                    {vozMatch && (
                      <div className="border-t border-[#c9b896]/10 bg-[#c9b896]/5 px-4 pb-4 pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[0.45rem] font-bold uppercase tracking-[0.15em] text-[#c9b896]/50">Narracao · Vivianne · v3</span>
                          <a href={`${AUDIO_BASE_PATH}/${vozMatch.ficheiro}`} download={vozMatch.ficheiro}
                            className="rounded bg-[#c9b896]/15 px-2 py-0.5 font-sans text-[0.45rem] font-semibold text-[#c9b896]/70 hover:bg-[#c9b896]/25 transition-all">
                            Baixar
                          </a>
                        </div>
                        <audio controls preload="metadata" className="w-full rounded-xl" style={{ height: 36, colorScheme: "dark" }}>
                          <source src={`${AUDIO_BASE_PATH}/${vozMatch.ficheiro}`} type="audio/mpeg" />
                        </audio>
                        <p className="font-sans text-[0.5rem] leading-relaxed text-cream/30 italic">&ldquo;{vozMatch.texto.replace(/\[(short |long )?pause\]/g, "...").substring(0, 120)}...&rdquo;</p>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    {/* ════════════════════════════════════════════════════════════════════════ */}
    {/* MODAL DE EXPORTAÇÃO — slides quadrados + verticais                      */}
    {/* ════════════════════════════════════════════════════════════════════════ */}
    {hubModal && (() => {
      const sqW = 280, sqScale = sqW / DIMS.w;
      const vtW = 160, vtH = Math.round(STORY_DIMS.h * (vtW / STORY_DIMS.w)), vtScale = vtW / STORY_DIMS.w;
      const slides = hubModal.slides;
      return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1814]">
          {/* Header */}
          <div className="shrink-0 border-b border-cream/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setHubModal(null); hubSlideSquareRefs.current = []; hubSlideVertRefs.current = []; }}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream/10 text-cream/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs font-semibold text-cream/70 truncate">{hubModal.title}</p>
                <p className="font-sans text-[0.5rem] text-cream/30">{slides.length} imagem{slides.length > 1 ? "ns" : ""}</p>
              </div>
              {slides.length > 1 && (
                <div className="flex gap-2">
                  <button onClick={() => exportAllHub(slides.length, "square")} disabled={hubExportingSquare !== null}
                    className="rounded-lg bg-cream/10 px-2.5 py-1.5 font-sans text-[0.55rem] font-semibold text-cream/60 hover:bg-cream/15 disabled:opacity-40 transition-all">
                    {hubExportingSquare === "all" ? "..." : "1:1 x" + slides.length}
                  </button>
                  <button onClick={() => exportAllHub(slides.length, "vert")} disabled={hubExportingVert !== null}
                    className="rounded-lg bg-cream/10 px-2.5 py-1.5 font-sans text-[0.55rem] font-semibold text-cream/60 hover:bg-cream/15 disabled:opacity-40 transition-all">
                    {hubExportingVert === "all" ? "..." : "9:16 x" + slides.length}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Caption */}
            {hubModal.caption && (
              <div className="rounded-2xl border border-cream/10 bg-[#222019] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-sans text-[0.5rem] font-bold uppercase tracking-[0.15em] text-cream/30">Legenda</span>
                  <button onClick={() => copyText("modal-caption", hubModal.caption!)}
                    className="rounded bg-cream/8 px-2.5 py-1 font-sans text-[0.5rem] font-semibold text-cream/40 hover:bg-cream/15 transition-all">
                    {copiedId === "modal-caption" ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="font-sans text-[0.65rem] leading-relaxed text-cream/50 whitespace-pre-wrap">
                  {stripHashtags(hubModal.caption)}
                </p>
              </div>
            )}

            {/* Slides */}
            {slides.map((slide, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[0.5rem] font-bold uppercase tracking-[0.15em] text-cream/30">Imagem {idx + 1}</span>
                  <div className="flex-1" />
                  <button onClick={() => exportHubSlide(idx, "square")} disabled={hubExportingSquare !== null}
                    className="rounded-lg bg-[#E1306C]/15 px-3 py-1 font-sans text-[0.55rem] font-semibold text-[#E1306C]/80 hover:bg-[#E1306C]/25 disabled:opacity-40 transition-all">
                    {hubExportingSquare === idx ? "..." : "1:1"}
                  </button>
                  <button onClick={() => exportHubSlide(idx, "vert")} disabled={hubExportingVert !== null}
                    className="rounded-lg bg-[#25D366]/10 px-3 py-1 font-sans text-[0.55rem] font-semibold text-[#25D366]/80 hover:bg-[#25D366]/20 disabled:opacity-40 transition-all">
                    {hubExportingVert === idx ? "..." : "9:16"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <div ref={(el) => { hubSlideSquareRefs.current[idx] = el; }}
                    className="overflow-hidden rounded-xl border border-cream/10" style={{ width: sqW, height: sqW }}>
                    <SlidePreview slide={slide} index={idx} scale={sqScale} />
                  </div>
                  <div ref={(el) => { hubSlideVertRefs.current[idx] = el; }}
                    className="overflow-hidden rounded-xl border border-cream/10" style={{ width: vtW, height: vtH }}>
                    <SlidePreviewVertical slide={slide} index={idx} scale={vtScale} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })()}

    {/* ════════════════════════════════════════════════════════════════════════ */}
    {/* MODAL CAPCUT                                                             */}
    {/* ════════════════════════════════════════════════════════════════════════ */}
    {capcutModal && (() => {
      const sqW = 280, sqH = 280, sqScale = sqW / DIMS.w;
      const vtW = 160, vtH = Math.round(STORY_DIMS.h * (vtW / STORY_DIMS.w)), vtScale = vtW / STORY_DIMS.w;
      const audioUrl = `${AUDIO_BASE_PATH}/${capcutModal.audioFile}`;
      return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1814]">
          <div className="shrink-0 border-b border-cream/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setCapcutModal(null); setCapcutExportingSquare(false); setCapcutExportingVert(false); }}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream/10 text-cream/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs font-semibold text-cream/70 truncate">{capcutModal.title}</p>
                <p className="font-sans text-[0.5rem] text-cream/30">{capcutModal.categoryLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Audio */}
            <div className="rounded-2xl border border-[#c9b896]/15 bg-[#c9b896]/5 p-4 space-y-3">
              <p className="font-sans text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[#c9b896]/50">Audio da Vivianne</p>
              <p className="font-sans text-[0.65rem] leading-relaxed text-cream/70 italic">&ldquo;{capcutModal.script}&rdquo;</p>
              <audio key={audioUrl} controls preload="metadata" className="w-full rounded-xl" style={{ height: 44, colorScheme: "dark" }}>
                <source src={audioUrl} type="audio/mpeg" />
                <source src={audioUrl} type="audio/mp4" />
              </audio>
              <div className="flex items-center justify-between border-t border-cream/5 pt-2">
                <p className="font-mono text-[0.5rem] text-cream/25">{capcutModal.audioFile}</p>
                <a href={audioUrl} download={capcutModal.audioFile}
                  className="rounded-lg bg-[#c9b896]/15 px-3 py-1.5 font-sans text-[0.55rem] font-semibold text-[#c9b896]/80 hover:bg-[#c9b896]/25 transition-all">
                  Baixar
                </a>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-sans text-[0.5rem] font-bold uppercase tracking-[0.2em] text-cream/30">Imagens</p>
                <div className="flex gap-2">
                  <button onClick={async () => { const wrapper = capcutSlideSquareRef.current; if (!wrapper) return; const el = (wrapper.firstElementChild as HTMLElement) || wrapper; setCapcutExportingSquare(true); try { await captureElement(el, DIMS, `${capcutModal.id}-square.png`); } catch { /**/ } setCapcutExportingSquare(false); }} disabled={capcutExportingSquare}
                    className="rounded-lg bg-[#E1306C]/15 px-3 py-1 font-sans text-[0.55rem] font-semibold text-[#E1306C]/80 hover:bg-[#E1306C]/25 disabled:opacity-40 transition-all">
                    {capcutExportingSquare ? "..." : "1:1"}
                  </button>
                  <button onClick={async () => { const wrapper = capcutSlideVertRef.current; if (!wrapper) return; const el = (wrapper.firstElementChild as HTMLElement) || wrapper; setCapcutExportingVert(true); try { await captureElement(el, STORY_DIMS, `${capcutModal.id}-story.png`); } catch { /**/ } setCapcutExportingVert(false); }} disabled={capcutExportingVert}
                    className="rounded-lg bg-[#25D366]/10 px-3 py-1 font-sans text-[0.55rem] font-semibold text-[#25D366]/80 hover:bg-[#25D366]/20 disabled:opacity-40 transition-all">
                    {capcutExportingVert ? "..." : "9:16"}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <div ref={capcutSlideSquareRef} className="overflow-hidden rounded-xl border border-cream/10" style={{ width: sqW, height: sqH }}>
                  <SlidePreview slide={capcutModal.slide} index={0} scale={sqScale} />
                </div>
                <div ref={capcutSlideVertRef} className="overflow-hidden rounded-xl border border-cream/10" style={{ width: vtW, height: vtH }}>
                  <SlidePreviewVertical slide={capcutModal.slide} index={0} scale={vtScale} />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-2xl border border-cream/5 bg-[#222019] p-4 space-y-2">
              <p className="font-sans text-[0.5rem] font-bold uppercase tracking-[0.15em] text-cream/30">Como usar no CapCut</p>
              <ol className="space-y-1.5">
                {["Baixa a imagem (9:16) e o audio", "Abre o CapCut → Novo projecto → Adiciona a imagem", "Adiciona o audio na timeline", "Ajusta timing se necessario → Exporta", "Publica como Reel"].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="shrink-0 font-mono text-[0.5rem] font-bold text-[#c9b896]/30">{i + 1}.</span>
                    <span className="font-sans text-[0.6rem] leading-relaxed text-cream/40">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      );
    })()}
    </>
  );
}
