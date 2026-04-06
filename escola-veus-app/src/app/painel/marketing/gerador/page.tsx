"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { professionalCarousels } from "@/data/content-calendar-weeks";
import { captureElement, isMobile } from "@/lib/export-image";
const AUTHOR_EMAILS = ["viv.saraiva@gmail.com"];

// ─── PRINTS (fundos) ────────────────────────────────────────────────────────

const PRINTS = [
  // Mockups da plataforma
  { id: "hero", src: "/prints/homepage-hero-mandala.jpeg", label: "Hero ~ Mandala" },
  { id: "experiencia", src: "/prints/experiencia-funcionalidades.jpeg", label: "Experiência" },
  { id: "quiz", src: "/prints/quiz-qual-veu.jpeg", label: "Quiz" },
  { id: "dashboard", src: "/prints/dashboard-membro.jpeg", label: "Dashboard" },
  { id: "leitura", src: "/prints/leitura-capitulo.jpeg", label: "Leitura" },
  { id: "ecos", src: "/prints/comunidade-ecos-tabs.jpeg", label: "Ecos" },
  { id: "marcas", src: "/prints/comunidade-marcas-caminho.jpeg", label: "Marcas" },
  { id: "reflexoes", src: "/prints/comunidade-reflexoes-leitoras.jpeg", label: "Reflexões" },
  { id: "livro", src: "/prints/livro-fisico-preco-whatsapp.jpeg", label: "Livro físico" },
  { id: "passos", src: "/prints/acesso-digital-3-passos.jpeg", label: "3 Passos" },
  { id: "cta", src: "/prints/comunidade-cta-dark.jpeg", label: "CTA dark" },
  // Mockups novos ~ device frames
  { id: "inicio-left", src: "/prints/7veus- incio-left.png", label: "Início (landscape)" },
  { id: "inicio-portrait", src: "/prints/7veus- incio-portrait.png", label: "Início (retrato)" },
  { id: "3niveis-left", src: "/prints/7veus-3niveis-left.png", label: "3 Níveis (landscape)" },
  { id: "3niveis-portrait", src: "/prints/7veus-3niveis-portrait.png", label: "3 Níveis (retrato)" },
  { id: "darkmode-left", src: "/prints/7veus-darkmode-left.png", label: "Dark mode (landscape)" },
  { id: "darkmode-portrait", src: "/prints/7veus-darkmode-portrait.png", label: "Dark mode (retrato)" },
  { id: "dessolucao-left", src: "/prints/7veus-dessolucao-left.png", label: "Dissolução (landscape)" },
  { id: "dessolucao-portrait", src: "/prints/7veus-dessolucao-portrait.png", label: "Dissolução (retrato)" },
  { id: "introdeveu-left", src: "/prints/7veus-introdeveu-left.png", label: "Intro véu (landscape)" },
  { id: "introdeveu-portrait", src: "/prints/7veus-introdeveu-portrait.png", label: "Intro véu (retrato)" },
  { id: "pedircod-left", src: "/prints/7veuspedircod-left.png", label: "Pedir código (landscape)" },
  { id: "pedircod-portrait", src: "/prints/7veuspedircod-portrait.png", label: "Pedir código (retrato)" },
  // Capas dos livros
  { id: "mandala", src: "/images/mandala-7veus.png", label: "Mandala" },
  { id: "espelho-ilusao", src: "/images/espelho-ilusao.png", label: "Espelho Ilusão" },
  { id: "espelho-medo", src: "/images/espelho-medo.png", label: "Espelho Medo" },
  { id: "espelho-culpa", src: "/images/espelho-culpa.png", label: "Espelho Culpa" },
  { id: "espelho-identidade", src: "/images/espelho-identidade.png", label: "Espelho Identidade" },
  { id: "espelho-controlo", src: "/images/espelho-controlo.png", label: "Espelho Controlo" },
  { id: "espelho-desejo", src: "/images/espelho-desejo.png", label: "Espelho Desejo" },
  { id: "espelho-separacao", src: "/images/espelho-separacao.png", label: "Espelho Separação" },
  { id: "no-heranca", src: "/images/capa-no-heran\u00e7a2.png", label: "Nó Herança" },
  { id: "no-silencio", src: "/images/capa-no-silencio2.png", label: "Nó Silêncio" },
  { id: "no-sacrificio", src: "/images/capa-no-sacrifico2.png", label: "Nó Sacrifício" },
  { id: "no-vergonha", src: "/images/capa-no-vergonha2.png", label: "Nó Vergonha" },
  { id: "no-solidao", src: "/images/capa-no-solidao2.png", label: "Nó Solidão" },
  { id: "no-vazio", src: "/images/capa-no-vazio2.png", label: "Nó Vazio" },
  { id: "no-pertenca", src: "/images/capa-no-perten\u00e7a2.png", label: "Nó Pertença" },
  // Catalogo (Lumina / Vitalis)
  { id: "lumina-comecar", src: "/catalogo/Lumina_come\u00e7ar.jpeg", label: "Lumina começar" },
  { id: "lumina-leitura", src: "/catalogo/Lumina_leitura.jpeg", label: "Lumina leitura" },
  { id: "lumina-cuidado", src: "/catalogo/Lumina_leitura8-cuidado-proprio.jpeg", label: "Lumina cuidado" },
  { id: "vitalis-dashboard", src: "/catalogo/Vitalis_dashboard.jpeg", label: "Vitalis dashboard" },
  { id: "vitalis-checkin", src: "/catalogo/Vitalis_checkin.jpeg", label: "Vitalis check-in" },
  { id: "vitalis-lumina", src: "/catalogo/Vitalis_lumina-abertura.jpeg", label: "Vitalis lumina" },
  { id: "vitalis-plano", src: "/catalogo/Vitalis_plano.jpeg", label: "Vitalis plano" },
  { id: "catalogo-comunidade", src: "/catalogo/comunidade.jpeg", label: "Comunidade (catálogo)" },
  // Artigos
  { id: "artigo-agradar", src: "/images/artigo-agradar.png", label: "Artigo agradar" },
  { id: "artigo-escolha", src: "/images/artigo-escolha.png", label: "Artigo escolha" },
  { id: "artigo-vida", src: "/images/artigo-vida-funciona.png", label: "Artigo vida funciona" },
  // Recursos
  { id: "recurso-teste", src: "/images/recurso-teste.png", label: "Recurso teste" },
  { id: "recurso-diario", src: "/images/recurso-diario.png", label: "Recurso diário" },
  { id: "recurso-checklist", src: "/images/recurso-checklist.png", label: "Recurso checklist" },
  { id: "recurso-miniguia", src: "/images/recurso-miniguia.png", label: "Recurso mini-guia" },
  { id: "recurso-perguntas", src: "/images/recurso-perguntas.png", label: "Recurso perguntas" },
  { id: "recurso-wallpapers", src: "/images/recurso-wallpapers.png", label: "Recurso wallpapers" },
];

// ─── MENSAGENS ────────────────────────────────────────────────────────────────
// Tom: "Vejo-te, e há mais para ti." — Da Confrontação ao Convite
// 5 pilares: O Mundo Convida · O Corpo Lembra · Fissura não Diagnóstico
//             Presença Compassiva · Densidade que Respira
// Regra de ouro: a leitora sai a sentir-se vista, acompanhada, com porta aberta.
// Nunca: diagnosticada, julgada, mais pesada.

const MENSAGENS = [
  // ─── Assinatura ───
  {
    label: "Há mais para ti",
    title: "Há mais para ti.",
    subtitle: "Não como promessa.\nComo observação.\nDe alguém que\ntambém passou por aqui.",
    cta: "seteveus.space",
  },

  // ─── O Mundo Convida ───
  {
    label: "A manhã bonita",
    title: "A manhã era bonita\nde uma forma que\nnão pedia esforço\npara ser notada.",
    subtitle: "Ela ainda não sabia\no que fazer com essa beleza.",
    cta: "O Espelho da Ilusão ~ seteveus.space",
  },
  {
    label: "Rotina que sustenta",
    title: "Há uma diferença\nentre rotina que\nsustenta e rotina\nque adormece.",
    subtitle: "Qual é a tua?",
    cta: "seteveus.space",
  },

  // ─── Convite e reconhecimento ───
  {
    label: "Reconheces-te?",
    title: "Reconheces-te\nnisto?",
    subtitle: "Não é diagnóstico.\nÉ reconhecimento.\nE no reconhecimento,\nalgo começa a mover-se.",
    cta: "seteveus.space",
  },
  {
    label: "Talvez",
    title: "Talvez.",
    subtitle: "Minúsculo. Frágil.\nQuase inaudível.\nMas novo.\n\nÉ a primeira coisa viva.",
    cta: "seteveus.space",
  },
  {
    label: "E se começasses",
    title: "E se\ncomecasses\npor aqui?",
    subtitle: "Sem promessa de mudança.\nSó um primeiro olhar.",
    cta: "seteveus.space/recursos/teste",
  },

  // ─── Espelho da Ilusão ───
  {
    label: "Quando foi que",
    title: "Quando foi que\nescolhi tomar café\nem vez de chá?",
    subtitle: "Uma pergunta absurda\nque muda tudo.\n\nO Espelho da Ilusão.",
    cta: "seteveus.space",
  },
  {
    label: "O corpo lembra",
    title: "Houve um tempo\nem que ficava sentada\na beber devagar,\na olhar pela janela.",
    subtitle: "O corpo lembra\nmesmo quando\na mente esqueceu.",
    cta: "O Espelho da Ilusão ~ seteveus.space",
  },
  {
    label: "A ilusão mais perigosa",
    title: "A ilusão mais\nperigosa é acreditar\nque escolheste\nquando apenas\nrepetiste.",
    subtitle: "O Espelho da Ilusão",
    cta: "seteveus.space",
  },
  {
    label: "Perguntar é começar",
    title: "Perguntar,\nmesmo tarde,\né o primeiro gesto\nde se escolher.",
    subtitle: "O Espelho da Ilusão",
    cta: "seteveus.space",
  },

  // ─── Espelho do Medo ───
  {
    label: "O medo é humano",
    title: "O medo é humano.\nViver uma vida inteira\nem função dele\né outra coisa.",
    subtitle: "E essa outra coisa\npode mudar.",
    cta: "O Espelho do Medo ~ seteveus.space",
  },
  {
    label: "Museus impossíveis",
    title: "E se os dedos\nque um dia desenharam\nmuseus impossíveis\nainda souberem\nmover-se?",
    subtitle: "O Espelho do Medo",
    cta: "seteveus.space",
  },
  {
    label: "A sede",
    title: "A sede de quem\npassou tanto tempo\nsem beber que\nse esqueceu\nde que tinha sede.",
    subtitle: "O Espelho do Medo, Parte VI",
    cta: "seteveus.space",
  },
  {
    label: "Ver o medo e continuar",
    title: "Ver o medo.\nE continuar\nmesmo assim.",
    subtitle: "Não é fraqueza.\nÉ o custo que parece\nmaior do que\no custo de ficar.\n\nO Espelho do Medo.",
    cta: "seteveus.space",
  },
  {
    label: "O talvez do Rui",
    title: "\"Amanhã será\nsegunda-feira.\nProvavelmente\ntudo se repetirá.\nMas há agora\num talvez.\"",
    subtitle: "O Espelho do Medo, Epílogo",
    cta: "seteveus.space",
  },

  // ─── Nós ───
  {
    label: "Nó da Herança",
    title: "A mãe sempre viu.\nEsperou anos.\nAgora que Sara acordou,\nHelena tem algo\npara lhe dizer.",
    subtitle: "O Nó da Herança\nO silêncio herdado\nentre mãe e filha.",
    cta: "seteveus.space",
  },
  {
    label: "Nó do Silêncio",
    title: "O medo calou\ntudo o que\nela queria dizer.",
    subtitle: "O Nó do Silêncio\nEm breve.",
    cta: "seteveus.space",
  },

  // ─── Ecos da comunidade ───
  {
    label: "Eco ~ acordar",
    title: '"saí do modo automático.\nnão sei para onde vou\nmas pelo menos\nestou acordada."',
    subtitle: "~ leitora anónima, Espelho da Ilusão",
    cta: "seteveus.space",
  },
  {
    label: "Eco ~ reconhecimento",
    title: '"chorei no banho.\noutra vez.\nmas desta vez\nnão foi por tristeza.\nfoi por reconhecimento."',
    subtitle: "~ leitora anónima, Espelho da Ilusão",
    cta: "seteveus.space",
  },
  {
    label: "Eco ~ automático",
    title: '"o meu marido perguntou\nestás bem?\ne eu disse que sim.\nautomaticamente."',
    subtitle: "~ leitora anónima, Espelho da Ilusão",
    cta: "seteveus.space",
  },
  {
    label: "Eco ~ silêncio",
    title: '"o silêncio entre nós\nnão era paz.\nera tudo o que\nnunca dissemos."',
    subtitle: "~ leitora anónima, Espelho do Medo",
    cta: "seteveus.space",
  },

  // ─── Experiência digital ───
  {
    label: "Três formas de ler",
    title: "O mesmo livro.\nTrês profundidades\ndiferentes.",
    subtitle: "Semente ~ guia acessível\nRaiz ~ contexto filosófico\nÁrvore ~ texto original\n\nTu escolhes.",
    cta: "seteveus.space",
  },
  {
    label: "Ler e escrever",
    title: "Ler sem escrever\né como olhar\npara um espelho\nde olhos fechados.",
    subtitle: "Diário reflexivo integrado.\nSó tu lês.",
    cta: "seteveus.space",
  },
  {
    label: "Respirar entre capítulos",
    title: "Entre cada capítulo,\numa pausa.\nTrês respirações.\nO corpo também lê.",
    subtitle: "Respiração guiada integrada\nna experiência de leitura.",
    cta: "seteveus.space",
  },
  {
    label: "Sozinha mas não só",
    title: "Lês sozinha.\nMas não estás só.",
    subtitle: "Comunidade Ecos\nReflexões anónimas.\nReconhecimentos silenciosos.\nTudo desaparece.",
    cta: "seteveus.space/comunidade",
  },
  {
    label: "Não é autoajuda",
    title: "Não é autoajuda.\nNão é terapia.\nÉ um espelho.",
    subtitle: "Um livro que te devolve\naquilo que sempre foi teu.",
    cta: "seteveus.space",
  },

  // ─── Livro físico + digital ───
  {
    label: "Do papel ao digital",
    title: "O teu livro físico\nabre portas que\nainda não conheces.",
    subtitle: "Se já tens o livro,\no acesso digital é gratuito.\nDiário. Comunidade. 3 níveis.",
    cta: "seteveus.space/pedir-codigo",
  },
  {
    label: "O livro que te lê",
    title: "O livro que\nte lê a ti.",
    subtitle: "Edição impressa ~ 1.500 MT\nExperiência digital incluída.",
    cta: "+258 845 243 875",
  },

  // ─── Convites suaves ───
  {
    label: "Ao teu ritmo",
    title: "Sem pressa.\nSem prazo.\nAo ritmo da tua\nverdade.",
    subtitle: "Os 7 Véus do Despertar",
    cta: "seteveus.space",
  },
  {
    label: "Teste gratuito",
    title: "E se comecasses\npor aqui?",
    subtitle: "Um teste de 3 minutos.\nNão dá respostas.\nDá perguntas.",
    cta: "seteveus.space/recursos/teste",
  },

  // ─── Vazio (canvas limpo) ───
  {
    label: "Vazio",
    title: "",
    subtitle: "",
    cta: "",
  },
];

// ─── FORMATOS ───────────────────────────────────────────────────────────────

type Format = "story" | "post" | "carousel";

const FORMATS: Record<Format, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story 9:16" },
  post: { w: 1080, h: 1080, label: "Post 1:1" },
  carousel: { w: 1080, h: 1350, label: "Carrossel 4:5" },
};

type TextPos = "top" | "center" | "bottom";

// ─── PAGINA ─────────────────────────────────────────────────────────────────

export default function GeradorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  // State
  const [print, setPrint] = useState(PRINTS[0]);
  const [format, setFormat] = useState<Format>("story");
  const [blur, setBlur] = useState(0);
  const [overlay, setOverlay] = useState(72);
  const [overlayColor, setOverlayColor] = useState("#1a1a2e");
  const [title, setTitle] = useState(MENSAGENS[0].title);
  const [subtitle, setSubtitle] = useState(MENSAGENS[0].subtitle);
  const [cta, setCta] = useState(MENSAGENS[0].cta);
  const [textPos, setTextPos] = useState<TextPos>("center");
  const [titleSize, setTitleSize] = useState(48);
  const [subtitleSize, setSubtitleSize] = useState(20);
  const [ctaSize, setCtaSize] = useState(16);
  const [showLogo, setShowLogo] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  // Search / filter
  const [printSearch, setPrintSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");

  // Carousel mode
  const [mode, setMode] = useState<"single" | "carousel">("single");
  const [selectedCarousel, setSelectedCarousel] = useState(professionalCarousels[0]);
  const [exportingCarousel, setExportingCarousel] = useState(false);
  const [exportCarouselStep, setExportCarouselStep] = useState(0);
  const [mobileCarouselPreviews, setMobileCarouselPreviews] = useState<string[]>([]);
  const [mobileCarouselIdx, setMobileCarouselIdx] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auth — redirect via useEffect to avoid client-side crash on navigation
  useEffect(() => {
    if (!loading && (!user || !AUTHOR_EMAILS.includes(user.email || ""))) {
      router.push("/entrar");
    }
  }, [loading, user, router]);

  if (loading || !user || !AUTHOR_EMAILS.includes(user.email || "")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage border-t-transparent" />
      </div>
    );
  }

  const fmt = FORMATS[format];
  const previewScale = Math.min(420 / fmt.h, 380 / fmt.w);

  const posClass: Record<TextPos, string> = {
    top: "justify-start pt-[15%]",
    center: "justify-center",
    bottom: "justify-end pb-[15%]",
  };

  function applyMsg(m: (typeof MENSAGENS)[number]) {
    setTitle(m.title);
    setSubtitle(m.subtitle);
    setCta(m.cta);
  }

  async function handleExport() {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await captureElement(canvasRef.current, {
        width: fmt.w,
        height: fmt.h,
        filename: `sete-veus-${format}-${Date.now()}`,
      });
      if (isMobile()) setMobilePreview(dataUrl);
    } catch {
      alert("Erro ao exportar. Tenta de novo.");
    }
    setExporting(false);
  }

  async function handleExportCarousel() {
    setExportingCarousel(true);
    const mobile = isMobile();
    const PX = 1080;
    const previews: string[] = [];

    for (let i = 0; i < selectedCarousel.slides.length; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      setExportCarouselStep(i + 1);

      try {
        const dataUrl = await captureElement(el, {
          width: PX,
          height: PX,
          filename: `${selectedCarousel.id}-slide-${i + 1}`,
        });
        if (mobile) previews.push(dataUrl);
        else await new Promise((r) => setTimeout(r, 400)); // stagger desktop downloads
      } catch {
        // skip slide on error — captureElement handles desktop download
      }
    }

    if (mobile && previews.length > 0) {
      setMobileCarouselPreviews(previews);
      setMobileCarouselIdx(0);
    }
    setExportCarouselStep(0);
    setExportingCarousel(false);
  }

  return (
    <section className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-brown-100 bg-white/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-sans text-sm text-brown-400 hover:text-brown-700">
              Painel
            </Link>
            <span className="text-brown-200">/</span>
            <h1 className="font-serif text-xl text-brown-900">Gerador de Conteúdo</h1>
          </div>
          {mode === "single" ? (
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`rounded-lg bg-sage px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-sage-dark ${exporting ? "opacity-60" : ""}`}
            >
              {exporting ? "A exportar..." : "Guardar imagem"}
            </button>
          ) : (
            <button
              onClick={handleExportCarousel}
              disabled={exportingCarousel}
              className={`rounded-lg bg-sage px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-sage-dark ${exportingCarousel ? "opacity-60" : ""}`}
            >
              {exportingCarousel
                ? `Slide ${exportCarouselStep}/${selectedCarousel.slides.length}...`
                : `Baixar ${selectedCarousel.slides.length} slides`}
            </button>
          )}
        </div>

        {/* Mode tabs */}
        <div className="mx-auto mt-3 flex max-w-7xl gap-1">
          {(["single", "carousel"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-1.5 font-sans text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-sage/15 text-sage-dark"
                  : "text-brown-400 hover:text-brown-700"
              }`}
            >
              {m === "single" ? "Post unico" : "Carrosseis prontos"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">

        {/* ─── CAROUSEL MODE ─── */}
        {mode === "carousel" && (
          <div className="flex gap-8 max-lg:flex-col">
            {/* Left: selector + caption */}
            <div className="w-full space-y-4 lg:w-[320px] lg:shrink-0">
              <div>
                <label className="mb-2 block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                  Escolhe um carrossel
                </label>
                <div className="space-y-1.5">
                  {professionalCarousels.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCarousel(c); slideRefs.current = []; }}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                        selectedCarousel.id === c.id
                          ? "border-sage bg-sage/10"
                          : "border-brown-100 bg-white hover:border-brown-200"
                      }`}
                    >
                      <p className="font-serif text-sm text-brown-900">{c.title}</p>
                      <p className="mt-0.5 font-sans text-[0.65rem] text-brown-400">{c.slides.length} slides</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="rounded-lg border border-brown-100 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                    Legenda Instagram
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedCarousel.caption)}
                    className="rounded bg-brown-50 px-2 py-0.5 font-sans text-[0.6rem] text-brown-500 hover:bg-brown-100"
                  >
                    Copiar
                  </button>
                </div>
                <p className="whitespace-pre-wrap font-sans text-[0.7rem] leading-relaxed text-brown-700">
                  {selectedCarousel.caption}
                </p>
              </div>
            </div>

            {/* Right: slides preview */}
            <div className="flex-1">
              <p className="mb-4 font-sans text-xs text-brown-400">
                {selectedCarousel.slides.length} slides · 1080×1080px · Com logo
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {selectedCarousel.slides.map((slide, i) => {
                  const PX = 1080;
                  const PREV = 200;
                  const scale = PREV / PX;
                  return (
                    <div key={i} className="space-y-1">
                      <div
                        className="overflow-hidden rounded-lg shadow-md"
                        style={{ width: PREV, height: PREV }}
                      >
                        <div
                          ref={(el) => { slideRefs.current[i] = el; }}
                          className="relative"
                          style={{
                            width: PX,
                            height: PX,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                            backgroundColor: slide.bg,
                          }}
                        >
                          {slide.bgImage && (
                            <>
                              <img
                                src={slide.bgImage}
                                alt=""
                                crossOrigin="anonymous"
                                className="absolute inset-0 h-full w-full object-cover"
                                style={{ opacity: 0.35 }}
                              />
                              <div
                                className="absolute inset-0"
                                style={{ backgroundColor: slide.bg, opacity: 0.55 }}
                              />
                            </>
                          )}
                          {/* Content */}
                          <div className="relative flex h-full flex-col justify-center px-[10%] text-center">
                            {slide.title && (
                              <h2
                                className="whitespace-pre-line font-serif leading-tight"
                                style={{ color: slide.text, fontSize: 52 }}
                              >
                                {slide.title}
                              </h2>
                            )}
                            {slide.title && slide.body && (
                              <div
                                className="mx-auto my-6 h-px w-1/3"
                                style={{ backgroundColor: slide.accent }}
                              />
                            )}
                            {slide.body && (
                              <p
                                className="whitespace-pre-line font-sans font-light"
                                style={{ color: slide.text, opacity: 0.8, fontSize: 26, lineHeight: 1.75 }}
                              >
                                {slide.body}
                              </p>
                            )}
                          </div>
                          {/* Footer CTA */}
                          {slide.footer && (
                            <div className="absolute bottom-[10%] w-full text-center">
                              <p
                                className="font-sans font-medium uppercase tracking-[0.15em]"
                                style={{ color: slide.accent, fontSize: 20 }}
                              >
                                {slide.footer}
                              </p>
                            </div>
                          )}
                          {/* Logo */}
                          <div
                            className="absolute bottom-[4%] left-1/2 flex -translate-x-1/2 items-center gap-2"
                            style={{ opacity: 0.45 }}
                          >
                            <img
                              src="/images/logo-espiral.png.jpeg"
                              alt=""
                              crossOrigin="anonymous"
                              className="h-8 w-8 rounded-full"
                            />
                            <span
                              className="font-serif"
                              style={{ color: slide.text, fontSize: 16 }}
                            >
                              Os Sete Véus
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="font-sans text-[0.6rem] text-brown-400">Slide {i + 1}</p>
                    </div>
                  );
                })}
              </div>

              {/* Mobile export button */}
              <button
                onClick={handleExportCarousel}
                disabled={exportingCarousel}
                className="mt-6 w-full rounded-lg bg-sage py-3 font-sans text-sm font-medium text-white lg:hidden"
              >
                {exportingCarousel
                  ? `Slide ${exportCarouselStep}/${selectedCarousel.slides.length}...`
                  : `Baixar ${selectedCarousel.slides.length} slides`}
              </button>
            </div>
          </div>
        )}

        {/* ─── SINGLE IMAGE MODE ─── */}
        {mode === "single" && (
        <div className="flex gap-8 max-lg:flex-col">

          {/* ── PAINEL ESQUERDO: Controlos ── */}
          <div className="w-full space-y-5 lg:w-[400px]">

            {/* Formato */}
            <div>
              <label className="mb-2 block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                Formato
              </label>
              <div className="flex gap-2">
                {(Object.keys(FORMATS) as Format[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 rounded-lg border px-3 py-2 font-sans text-xs transition-colors ${
                      format === f
                        ? "border-sage bg-sage/10 text-sage-dark"
                        : "border-brown-100 bg-white text-brown-500 hover:border-brown-200"
                    }`}
                  >
                    {FORMATS[f].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fundo (prints) */}
            <div>
              <label className="mb-2 block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                Fundo ~ escolhe um print
              </label>
              <input
                type="search"
                placeholder="Filtrar prints..."
                value={printSearch}
                onChange={(e) => setPrintSearch(e.target.value)}
                className="mb-2 w-full rounded-lg border border-brown-100 bg-white px-3 py-1.5 font-sans text-xs text-brown-900 placeholder:text-brown-300 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20"
              />
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {PRINTS.filter((p) =>
                  !printSearch || p.label.toLowerCase().includes(printSearch.toLowerCase())
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPrint(p)}
                    title={p.label}
                    className={`group relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all ${
                      print.id === p.id
                        ? "border-sage ring-2 ring-sage/30"
                        : "border-transparent hover:border-brown-200"
                    }`}
                  >
                    <img src={p.src} alt={p.label} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                      <span className="font-sans text-[0.45rem] leading-tight text-white">{p.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem (presets) */}
            <div>
              <label className="mb-2 block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                Mensagem ~ escolhe ou edita
              </label>
              <input
                type="search"
                placeholder="Filtrar mensagens..."
                value={msgSearch}
                onChange={(e) => setMsgSearch(e.target.value)}
                className="mb-2 w-full rounded-lg border border-brown-100 bg-white px-3 py-1.5 font-sans text-xs text-brown-900 placeholder:text-brown-300 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20"
              />
              <div className="flex flex-wrap gap-1.5">
                {MENSAGENS.filter((m) =>
                  !msgSearch ||
                  m.label.toLowerCase().includes(msgSearch.toLowerCase()) ||
                  m.title.toLowerCase().includes(msgSearch.toLowerCase())
                ).map((m) => (
                  <button
                    key={m.label}
                    onClick={() => applyMsg(m)}
                    className="rounded-full border border-brown-100 bg-white px-3 py-1 font-sans text-[0.65rem] text-brown-600 transition-colors hover:border-sage hover:bg-sage/5 hover:text-sage-dark"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blur + Overlay */}
            <div className="space-y-2">
              <label className="block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                Fundo ~ ajustes
              </label>
              <div className="flex items-center gap-2">
                <span className="w-14 font-sans text-xs text-brown-400">Blur</span>
                <input type="range" min={10} max={60} value={blur} onChange={(e) => setBlur(+e.target.value)} className="flex-1 accent-sage" />
                <span className="w-10 text-right font-sans text-xs text-brown-500">{blur}px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 font-sans text-xs text-brown-400">Escuro</span>
                <input type="range" min={30} max={90} value={overlay} onChange={(e) => setOverlay(+e.target.value)} className="flex-1 accent-sage" />
                <span className="w-10 text-right font-sans text-xs text-brown-500">{overlay}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 font-sans text-xs text-brown-400">Cor</span>
                <div className="flex gap-2">
                  {[
                    { c: "#000000", l: "Preto" },
                    { c: "#3d3630", l: "Castanho" },
                    { c: "#1a1a2e", l: "Azul escuro" },
                    { c: "#0d1b2a", l: "Noite" },
                  ].map(({ c, l }) => (
                    <button
                      key={c}
                      onClick={() => setOverlayColor(c)}
                      title={l}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        overlayColor === c ? "border-sage scale-110" : "border-brown-200"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Texto editavel */}
            <div className="space-y-3">
              <label className="block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                Texto ~ editar
              </label>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-brown-500">Título</span>
                  <div className="flex items-center gap-1">
                    <input type="range" min={24} max={72} value={titleSize} onChange={(e) => setTitleSize(+e.target.value)} className="w-20 accent-sage" />
                    <span className="w-8 font-sans text-[0.6rem] text-brown-400">{titleSize}</span>
                  </div>
                </div>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-brown-100 bg-white px-3 py-2 font-sans text-sm text-brown-900 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-brown-500">Subtítulo</span>
                  <div className="flex items-center gap-1">
                    <input type="range" min={12} max={36} value={subtitleSize} onChange={(e) => setSubtitleSize(+e.target.value)} className="w-20 accent-sage" />
                    <span className="w-8 font-sans text-[0.6rem] text-brown-400">{subtitleSize}</span>
                  </div>
                </div>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-brown-100 bg-white px-3 py-2 font-sans text-sm text-brown-900 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-brown-500">CTA / Link</span>
                  <div className="flex items-center gap-1">
                    <input type="range" min={10} max={28} value={ctaSize} onChange={(e) => setCtaSize(+e.target.value)} className="w-20 accent-sage" />
                    <span className="w-8 font-sans text-[0.6rem] text-brown-400">{ctaSize}</span>
                  </div>
                </div>
                <input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-brown-100 bg-white px-3 py-2 font-sans text-sm text-brown-900 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                />
              </div>
            </div>

            {/* Posicao + Logo */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                  Posição
                </label>
                <div className="flex gap-1.5">
                  {(["top", "center", "bottom"] as TextPos[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTextPos(p)}
                      className={`flex-1 rounded border px-2 py-1.5 font-sans text-[0.65rem] ${
                        textPos === p
                          ? "border-sage bg-sage/10 text-sage-dark"
                          : "border-brown-100 bg-white text-brown-400"
                      }`}
                    >
                      {p === "top" ? "Topo" : p === "center" ? "Centro" : "Baixo"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-[0.65rem] font-medium uppercase tracking-wider text-brown-400">
                  Logo
                </label>
                <button
                  onClick={() => setShowLogo(!showLogo)}
                  className={`rounded border px-3 py-1.5 font-sans text-[0.65rem] ${
                    showLogo
                      ? "border-sage bg-sage/10 text-sage-dark"
                      : "border-brown-100 bg-white text-brown-400"
                  }`}
                >
                  {showLogo ? "Visível" : "Oculto"}
                </button>
              </div>
            </div>

            {/* Export button (mobile) */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full rounded-lg bg-sage py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-sage-dark lg:hidden"
            >
              {exporting ? "A exportar..." : "Guardar imagem"}
            </button>
          </div>

          {/* ── PAINEL DIREITO: Preview ── */}
          <div className="flex flex-1 flex-col items-center">
            <div className="mb-3 font-sans text-xs text-brown-400">
              {fmt.w} x {fmt.h} ~ {print.label}
            </div>

            <div
              className="overflow-hidden rounded-xl shadow-2xl"
              style={{ width: fmt.w * previewScale, height: fmt.h * previewScale }}
            >
              <div
                ref={canvasRef}
                className="relative overflow-hidden"
                style={{
                  width: fmt.w,
                  height: fmt.h,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* BG image */}
                <img
                  src={print.src}
                  alt=""
                  crossOrigin="anonymous"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ filter: `blur(${blur}px)` }}
                />

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayColor, opacity: overlay / 100 }}
                />

                {/* Texto */}
                <div className={`relative flex h-full flex-col items-center px-[10%] text-center ${posClass[textPos]}`}>
                  {title && (
                    <h2
                      className="whitespace-pre-line font-serif leading-[1.2] text-white"
                      style={{ fontSize: titleSize }}
                    >
                      {title}
                    </h2>
                  )}
                  {title && subtitle && (
                    <div className="my-[3%] h-px w-[40%] bg-white/40" />
                  )}
                  {subtitle && (
                    <p
                      className="whitespace-pre-line font-sans font-light tracking-wide text-white/80"
                      style={{ fontSize: subtitleSize }}
                    >
                      {subtitle}
                    </p>
                  )}
                  {cta && (
                    <p
                      className="mt-[5%] font-sans font-medium uppercase tracking-[0.2em] text-white/60"
                      style={{ fontSize: ctaSize }}
                    >
                      {cta}
                    </p>
                  )}
                </div>

                {/* Logo */}
                {showLogo && (
                  <div className="absolute bottom-[4%] left-1/2 flex -translate-x-1/2 items-center gap-3 opacity-60">
                    <img
                      src="/images/logo-espiral.png.jpeg"
                      alt=""
                      crossOrigin="anonymous"
                      className="h-10 w-10 rounded-full"
                    />
                    <span className="font-serif text-white/80" style={{ fontSize: 18 }}>
                      Os Sete Véus
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 max-w-sm text-center font-sans text-xs text-brown-400">
              Escolhe um print como fundo, uma mensagem, ajusta o blur e exporta.
              Imagem gerada em {fmt.w}x{fmt.h}px.
              No telemovel, mantém premido na imagem para guardar na fototeca.
            </p>
          </div>
        </div>
        )} {/* end mode === "single" */}

      </div>

      {/* Mobile carousel: ecrã inteiro, slide a slide */}
      {mobileCarouselPreviews.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4">
          <p className="mb-2 font-sans text-sm text-white/80">
            Slide {mobileCarouselIdx + 1} de {mobileCarouselPreviews.length}
          </p>
          <p className="mb-4 text-center font-sans text-xs text-white/50">
            Mantém premido para guardar na fototeca
          </p>
          <img
            src={mobileCarouselPreviews[mobileCarouselIdx]}
            alt={`Slide ${mobileCarouselIdx + 1}`}
            className="max-h-[65vh] max-w-full rounded-lg object-contain"
          />
          <div className="mt-6 flex gap-3">
            {mobileCarouselIdx > 0 && (
              <button
                onClick={() => setMobileCarouselIdx((n) => n - 1)}
                className="rounded-lg border border-white/20 px-5 py-2.5 font-sans text-sm text-white/70"
              >
                Anterior
              </button>
            )}
            {mobileCarouselIdx < mobileCarouselPreviews.length - 1 ? (
              <button
                onClick={() => setMobileCarouselIdx((n) => n + 1)}
                className="rounded-lg bg-sage px-5 py-2.5 font-sans text-sm font-medium text-white"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={() => setMobileCarouselPreviews([])}
                aria-label="Fechar pré-visualização do carrossel"
                className="rounded-lg bg-sage px-5 py-2.5 font-sans text-sm font-medium text-white"
              >
                Concluído
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile single: ecrã inteiro para guardar na fototeca */}
      {mobilePreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
          onClick={() => setMobilePreview(null)}
        >
          <p className="mb-4 text-center font-sans text-sm text-white/80">
            Mantém premido na imagem para guardar na fototeca
          </p>
          <img
            src={mobilePreview}
            alt="Imagem gerada"
            className="max-h-[75vh] max-w-full rounded-lg object-contain"
          />
          <button
            onClick={() => setMobilePreview(null)}
            className="mt-6 rounded-lg border border-white/20 px-8 py-3 font-sans text-sm text-white/70"
          >
            Fechar
          </button>
        </div>
      )}
    </section>
  );
}
