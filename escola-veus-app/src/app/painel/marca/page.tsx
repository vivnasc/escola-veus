"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Brand Kit — Identidade Visual Sete Ecos
 *
 * Guia completo para manter consistência em todo o material
 * de marketing: redes sociais, WhatsApp, email, e impresso.
 */

const palette = {
  primarias: [
    { name: "Cream", hex: "#f7f5f0", css: "bg-cream", usage: "Fundo principal, backgrounds de stories" },
    { name: "Brown 900", hex: "#3d3630", css: "bg-brown-900", usage: "Texto principal, fundos escuros (hero, reels)" },
    { name: "Sage", hex: "#7a8c6e", css: "bg-sage", usage: "Cor de acção — botões, CTAs, destaques positivos" },
    { name: "Gold", hex: "#c9b896", css: "bg-gold", usage: "Cor de luxo suave — capas, detalhes, separadores" },
  ],
  veus: [
    { name: "Véu 1 — Ilusão", hex: "#c9b896", label: "Dourado" },
    { name: "Véu 2 — Medo", hex: "#8b9b8e", label: "Sage" },
    { name: "Véu 3 — Desejo", hex: "#c08aaa", label: "Mauve" },
    { name: "Véu 4 — Controlo", hex: "#8aaaca", label: "Azul" },
    { name: "Véu 5 — Culpa", hex: "#9aac8e", label: "Verde" },
    { name: "Véu 6 — Identidade", hex: "#ab9375", label: "Castanho" },
    { name: "Véu 7 — Separação", hex: "#baaacc", label: "Lilás" },
  ],
  suporte: [
    { name: "Cream Dark", hex: "#ebe7df", usage: "Backgrounds alternativos" },
    { name: "Brown 500", hex: "#8a8279", usage: "Texto secundário" },
    { name: "Brown 200", hex: "#d4cfc6", usage: "Bordas, separadores" },
    { name: "Sage Light", hex: "#9aac8e", usage: "Highlights suaves" },
    { name: "WhatsApp Green", hex: "#25D366", usage: "Apenas para botões WhatsApp" },
  ],
};

const tipografia = [
  {
    name: "Playfair Display",
    className: "font-serif",
    role: "Títulos, citações, frases de impacto",
    exemplos: ["Os Sete Véus", "Para quem está pronta para se escolher"],
    nota: "Usar em reels como texto principal. Sempre com tracking normal ou tight.",
  },
  {
    name: "Inter",
    className: "font-sans",
    role: "Legendas, CTAs, labels, corpo de texto pequeno",
    exemplos: ["COMEÇA GRÁTIS", "Recursos gratuitos na bio"],
    nota: "Usar em CAPS com tracking wide para labels. Em regular para corpo.",
  },
  {
    name: "Georgia",
    className: "font-body",
    role: "Corpo de texto longo — emails, artigos",
    exemplos: ["Passei anos a construir uma vida que fazia sentido para toda a gente..."],
    nota: "Fallback quando Playfair não está disponível (emails, WhatsApp).",
  },
];

const tomDeVoz = {
  pilares: [
    { titulo: "Honesta, não agressiva", exemplo: "Dizer \"sentes que falta algo\" — não \"a tua vida está errada\"" },
    { titulo: "Convite, não instrução", exemplo: "\"Se te reconheces...\" — não \"Tens de fazer isto\"" },
    { titulo: "Profunda, não complicada", exemplo: "Ideias grandes, palavras simples. Sem jargão psicológico." },
    { titulo: "Calorosa, não casual", exemplo: "Tratamento por \"tu\" mas com respeito. Nunca informal demais." },
    { titulo: "Paciente, não urgente", exemplo: "\"Sem pressa\" é literalmente parte da marca. Zero urgência artificial." },
  ],
  evitar: [
    "Linguagem de coach genérica (\"empowerment\", \"mindset\", \"quantum\")",
    "Urgência falsa (\"só hoje\", \"últimas vagas\", \"não percas\")",
    "Promessas de transformação rápida",
    "Exclamações excessivas ou emojis demais",
    "Tom de autoridade — a Vivianne é companheira, não guru",
  ],
  palavrasChave: [
    "reconhecimento", "verdade", "autenticidade", "ao teu ritmo",
    "sem pressa", "escolher-te", "soltar", "véu", "espelho",
    "reflexão", "presença", "liberdade interior", "viver (não funcionar)",
  ],
};

const formatosVisuais = [
  {
    tipo: "Reel / Story Vertical",
    dimensao: "1080 × 1920 px",
    regras: [
      "Fundo: cream (#f7f5f0) ou brown-900 (#3d3630)",
      "Texto: Playfair Display para frase principal",
      "CTA: Inter uppercase, 12px, tracking wide",
      "Logo espiral no canto superior — transparente, 40px",
      "Margem mínima: 80px em todos os lados (safe zone)",
    ],
  },
  {
    tipo: "Carrossel Instagram",
    dimensao: "1080 × 1080 px",
    regras: [
      "1º slide: gancho forte em Playfair, fundo brown-900",
      "Slides intermédios: fundo cream, texto brown-700",
      "Último slide: CTA em sage (#7a8c6e), fundo cream-dark",
      "Manter paleta — máximo 3 cores por carrossel",
      "Consistência: mesma margem e tamanho de fonte em todos os slides",
    ],
  },
  {
    tipo: "WhatsApp Status",
    dimensao: "Texto simples ou 1080 × 1920 px",
    regras: [
      "Preferir texto simples — mais íntimo no WhatsApp",
      "Se imagem: usar os mesmos templates dos Stories",
      "Tom mais pessoal que Instagram — como se fosse mensagem directa",
      "Máximo 3 linhas — WhatsApp é rápido",
    ],
  },
  {
    tipo: "Email",
    dimensao: "Plain text (sem HTML rico)",
    regras: [
      "Sem imagens pesadas — emails pessoais convertem mais",
      "Fonte: Georgia (fallback do sistema)",
      "Links com texto descritivo, não \"clica aqui\"",
      "Assunto: máximo 50 caracteres, com gancho emocional",
      "Remetente: Vivianne (nome pessoal, não marca)",
    ],
  },
];

export default function MarcaPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  async function copyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch { /* fallback */ }
  }

  return (
    <section className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-sage">
              Identidade Visual
            </p>
            <h1 className="mt-1 font-serif text-3xl text-brown-900">
              Brand Kit — Sete Ecos
            </h1>
            <p className="mt-2 text-sm text-brown-500">
              Guia para manter a identidade visual consistente em todo o material de marketing.
            </p>
          </div>
          <Link
            href="/painel"
            className="font-sans text-sm text-brown-400 hover:text-sage"
          >
            &larr; Painel
          </Link>
        </div>

        {/* ====== PALETA DE CORES ====== */}
        <div className="mt-12">
          <h2 className="font-serif text-2xl text-brown-900">Paleta de Cores</h2>

          {/* Cores primárias */}
          <p className="mt-6 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brown-400">
            Primárias
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-4">
            {palette.primarias.map((c) => (
              <button
                key={c.hex}
                onClick={() => copyHex(c.hex)}
                className="group overflow-hidden rounded-xl border border-brown-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="h-20" style={{ backgroundColor: c.hex }} />
                <div className="p-3 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm font-medium text-brown-800">{c.name}</p>
                    <p className="font-mono text-xs text-brown-400">
                      {copiedColor === c.hex ? "Copiado!" : c.hex}
                    </p>
                  </div>
                  <p className="mt-1 font-sans text-[0.65rem] text-brown-400">{c.usage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Cores por véu */}
          <p className="mt-8 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brown-400">
            Cores por Véu (usar para temas semanais)
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {palette.veus.map((v) => (
              <button
                key={v.hex}
                onClick={() => copyHex(v.hex)}
                className="flex items-center gap-2 rounded-full border border-brown-100 bg-white px-4 py-2 transition hover:shadow-sm"
              >
                <span className="h-6 w-6 rounded-full" style={{ backgroundColor: v.hex }} />
                <span className="font-sans text-xs text-brown-600">{v.name}</span>
                <span className="font-mono text-[0.6rem] text-brown-300">
                  {copiedColor === v.hex ? "!" : v.hex}
                </span>
              </button>
            ))}
          </div>

          {/* Cores de suporte */}
          <p className="mt-8 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brown-400">
            Suporte
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-5">
            {palette.suporte.map((c) => (
              <button
                key={c.hex}
                onClick={() => copyHex(c.hex)}
                className="flex items-center gap-2 rounded-lg border border-brown-100 bg-white p-3 transition hover:shadow-sm"
              >
                <span className="h-8 w-8 shrink-0 rounded" style={{ backgroundColor: c.hex }} />
                <div className="text-left">
                  <p className="font-sans text-xs font-medium text-brown-700">{c.name}</p>
                  <p className="font-mono text-[0.55rem] text-brown-300">{c.hex}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ====== TIPOGRAFIA ====== */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-brown-900">Tipografia</h2>
          <div className="mt-6 space-y-6">
            {tipografia.map((font) => (
              <div key={font.name} className="rounded-xl border border-brown-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-sage">
                      {font.role}
                    </p>
                    <p className={`mt-2 text-2xl text-brown-900 ${font.className}`}>
                      {font.name}
                    </p>
                  </div>
                  <code className="rounded bg-cream px-3 py-1 font-mono text-xs text-brown-400">
                    {font.className}
                  </code>
                </div>
                <div className="mt-4 space-y-2">
                  {font.exemplos.map((ex) => (
                    <p key={ex} className={`text-lg text-brown-700 ${font.className}`}>
                      &ldquo;{ex}&rdquo;
                    </p>
                  ))}
                </div>
                <p className="mt-3 rounded-lg bg-cream px-4 py-2 font-sans text-xs text-brown-500">
                  {font.nota}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ====== TOM DE VOZ ====== */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-brown-900">Tom de Voz</h2>
          <p className="mt-2 text-sm text-brown-500">
            A voz da Sete Ecos é a voz da Vivianne — pessoal, honesta, sem máscara.
          </p>

          {/* Pilares */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tomDeVoz.pilares.map((p, i) => (
              <div key={i} className="rounded-xl border border-brown-100 bg-white p-5 shadow-sm">
                <p className="font-serif text-base text-brown-900">{p.titulo}</p>
                <p className="mt-2 font-sans text-sm italic text-brown-500">{p.exemplo}</p>
              </div>
            ))}
          </div>

          {/* Palavras-chave */}
          <p className="mt-8 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brown-400">
            Vocabulário da marca
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tomDeVoz.palavrasChave.map((p) => (
              <span key={p} className="rounded-full bg-sage/10 px-4 py-1.5 font-sans text-sm text-sage">
                {p}
              </span>
            ))}
          </div>

          {/* Evitar */}
          <p className="mt-8 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brown-400">
            Evitar sempre
          </p>
          <ul className="mt-3 space-y-2">
            {tomDeVoz.evitar.map((e) => (
              <li key={e} className="flex items-start gap-2 font-sans text-sm text-brown-600">
                <span className="mt-0.5 text-brown-300">&#10005;</span>
                {e}
              </li>
            ))}
          </ul>
        </div>

        {/* ====== FORMATOS VISUAIS ====== */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-brown-900">Formatos e Directrizes</h2>
          <p className="mt-2 text-sm text-brown-500">
            Regras visuais para cada formato de conteúdo.
          </p>
          <div className="mt-6 space-y-6">
            {formatosVisuais.map((f) => (
              <div key={f.tipo} className="rounded-xl border border-brown-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-brown-900">{f.tipo}</h3>
                  <span className="rounded bg-cream px-3 py-1 font-mono text-xs text-brown-400">
                    {f.dimensao}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {f.regras.map((r) => (
                    <li key={r} className="flex items-start gap-2 font-sans text-sm text-brown-600">
                      <span className="mt-0.5 text-sage">&#10003;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ====== ASSETS ====== */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-brown-900">Assets Disponíveis</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Logo Espiral", path: "/images/logo-espiral.png.jpeg", desc: "Logo principal — usar no canto de stories/reels" },
              { label: "Mandala 7 Véus", path: "/images/mandala-7veus.png", desc: "Mandala completa — usar em carrosseis e capas" },
              { label: "Capa Espelho 1", path: "/images/espelho-ilusao.png", desc: "Capa do livro — usar em posts de produto" },
            ].map((asset) => (
              <div key={asset.label} className="rounded-xl border border-brown-100 bg-white p-4 shadow-sm">
                <div className="flex h-24 items-center justify-center rounded-lg bg-cream">
                  <img
                    src={asset.path}
                    alt={asset.label}
                    className="max-h-20 max-w-20 object-contain"
                  />
                </div>
                <p className="mt-3 font-sans text-sm font-medium text-brown-800">{asset.label}</p>
                <p className="mt-1 font-sans text-xs text-brown-400">{asset.desc}</p>
                <p className="mt-2 font-mono text-[0.6rem] text-brown-300">{asset.path}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ====== TEMPLATES RÁPIDOS ====== */}
        <div className="mt-16 mb-12">
          <h2 className="font-serif text-2xl text-brown-900">Templates Visuais Rápidos</h2>
          <p className="mt-2 text-sm text-brown-500">
            Pré-visualização de como o conteúdo deve parecer em cada formato.
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {/* Template Reel/Story — Dark */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div className="relative flex aspect-[9/16] max-h-[500px] flex-col items-center justify-center bg-gradient-to-b from-[#3d3630] to-[#2d2620] p-10 text-center">
                <img
                  src="/images/logo-espiral.png.jpeg"
                  alt=""
                  className="absolute left-4 top-4 h-8 w-8 rounded-full opacity-60"
                />
                <p className="font-serif text-2xl leading-tight text-cream">
                  E se a vida que construíste não fosse a que escolheste?
                </p>
                <div className="mt-6 h-px w-12 bg-gold" />
                <p className="mt-6 font-sans text-xs leading-relaxed text-brown-300">
                  Há uma diferença entre viver e funcionar.<br />
                  O primeiro passo é reconhecer.
                </p>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-sage">
                    Teste gratuito na bio
                  </p>
                </div>
              </div>
              <div className="bg-white px-4 py-3">
                <p className="font-sans text-xs font-medium text-brown-700">Reel / Story — Fundo escuro</p>
                <p className="font-sans text-[0.6rem] text-brown-400">Playfair Display + Inter uppercase</p>
              </div>
            </div>

            {/* Template Reel/Story — Light */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div className="relative flex aspect-[9/16] max-h-[500px] flex-col items-center justify-center bg-cream p-10 text-center">
                <img
                  src="/images/logo-espiral.png.jpeg"
                  alt=""
                  className="absolute left-4 top-4 h-8 w-8 rounded-full opacity-40"
                />
                <div className="h-1 w-8 rounded-full bg-sage" />
                <p className="mt-6 font-serif text-2xl leading-tight text-brown-900">
                  Podes querer mais.
                </p>
                <p className="mt-2 font-serif text-2xl leading-tight text-brown-900">
                  Não é ingratidão — é honestidade.
                </p>
                <p className="mt-6 font-sans text-xs leading-relaxed text-brown-500">
                  Dar-te permissão é o primeiro ato de coragem.
                </p>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <span className="rounded-full bg-sage px-6 py-2 font-sans text-[0.6rem] uppercase tracking-[0.15em] text-white">
                    Descobre mais — link na bio
                  </span>
                </div>
              </div>
              <div className="bg-white px-4 py-3">
                <p className="font-sans text-xs font-medium text-brown-700">Reel / Story — Fundo claro</p>
                <p className="font-sans text-[0.6rem] text-brown-400">Cream + Sage CTA</p>
              </div>
            </div>

            {/* Template Carrossel — Slide 1 */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div className="flex aspect-square max-h-[400px] flex-col items-center justify-center bg-gradient-to-br from-[#3d3630] to-[#2d2620] p-10 text-center">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-sage">
                  Carrossel educativo
                </p>
                <p className="mt-6 font-serif text-3xl leading-tight text-cream">
                  5 sinais de que estás a viver no automático
                </p>
                <div className="mt-6 h-px w-12 bg-gold" />
                <p className="mt-4 font-sans text-xs text-brown-300">
                  Swipe para ler &rarr;
                </p>
              </div>
              <div className="bg-white px-4 py-3">
                <p className="font-sans text-xs font-medium text-brown-700">Carrossel — 1º Slide (gancho)</p>
                <p className="font-sans text-[0.6rem] text-brown-400">1080 × 1080 px</p>
              </div>
            </div>

            {/* Template Carrossel — Slide intermédio */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div className="flex aspect-square max-h-[400px] flex-col justify-center bg-cream p-10">
                <span className="font-serif text-4xl text-gold">3</span>
                <p className="mt-3 font-serif text-xl text-brown-900">
                  Fazes tudo bem — mas nada te preenche
                </p>
                <div className="mt-4 h-px w-full bg-brown-100" />
                <p className="mt-4 font-sans text-sm leading-relaxed text-brown-600">
                  Quando a competência se torna armadura, a excelência deixa de ser escolha
                  e passa a ser sobrevivência.
                </p>
              </div>
              <div className="bg-white px-4 py-3">
                <p className="font-sans text-xs font-medium text-brown-700">Carrossel — Slide intermédio</p>
                <p className="font-sans text-[0.6rem] text-brown-400">Numerado + fundo claro</p>
              </div>
            </div>
          </div>

          {/* Directriz de uso */}
          <div className="mt-10 rounded-xl border-l-[3px] border-sage bg-white px-6 py-5 shadow-sm">
            <p className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-sage">
              Regra de ouro
            </p>
            <p className="mt-2 font-serif text-base italic text-brown-700">
              &ldquo;Quando tiveres dúvida sobre qualquer material de marketing, pergunta:
              isto parece uma conversa honesta ou um anúncio? Se parece anúncio, refaz.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
