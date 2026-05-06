/**
 * Gera HTML standalone para um slide Mock B.
 * Espelho de src/components/admin/SlidePreview.tsx (tipografia, cores,
 * layout). Qualquer mudanca la deve ser reflectida aqui.
 */

import { ambientParticles, ambientPresence } from "./slide-ambient.mjs";
import { detectGesto, renderGesto } from "./slide-gestures.mjs";

export function renderSlideHtml({ slide, deck, accent, diagramSvg = "" }) {
  const footer =
    slide.tipo === "title" || slide.tipo === "end" || slide.tipo === "fecho"
      ? ""
      : `${deck.courseTitle.toUpperCase()} · M${deck.moduleNumber} · ${deck.subLetter} · ${deck.subTitle.toUpperCase()}`;

  const actoLabel =
    (slide.tipo === "acto-marker" || slide.tipo === "conteudo") && slide.romano
      ? `<div class="acto-label" style="color:${accent}">${slide.romano} · ${slide.label}</div>`
      : "";

  // Eco: palavra-mãe do acto anterior, no canto superior direito em fade.
  const ecoLabel =
    slide.tipo === "conteudo" && slide.eco
      ? `<div class="escola-eco" style="color:${accent}">
           <div class="eco-meta">de antes</div>
           <div class="eco-word">${esc(slide.eco)}</div>
         </div>`
      : "";

  let body = "";
  if (slide.tipo === "title") {
    body = `
      <div class="center">
        <p class="sub-label" style="color:${accent}">${esc(slide.subtexto.toUpperCase())}</p>
        <h1 class="title">${esc(slide.texto)}</h1>
        <div class="accent-line" style="background:${accent}"></div>
      </div>
    `;
  } else if (slide.tipo === "acto-marker") {
    body = `
      <div class="center">
        <div class="romano">${esc(slide.romano)}</div>
        <p class="acto-sub" style="color:${accent}">${esc(slide.label)}</p>
      </div>
    `;
  } else if (slide.tipo === "conteudo") {
    const len = (slide.texto ?? "").length;
    const sizeClass = len > 280 ? "vlong" : len > 200 ? "long" : "";
    // Glifos divisores entre frases — pausa visual.
    const html = emphasisToHtml(slide.texto, accent, { dividers: true });
    const diagramHtml = diagramSvg
      ? `<div style="margin-top:48px;display:flex;justify-content:center">${diagramSvg}</div>`
      : "";
    // Gesto visualizado no acto IV se nenhum diagrama foi escolhido para
    // este slide e o texto contém uma palavra-chave de gesto.
    let gestoHtml = "";
    if (slide.acto === "gesto" && !diagramSvg) {
      const g = detectGesto(slide.texto);
      if (g) {
        gestoHtml = `<div style="margin-top:36px;display:flex;justify-content:center">${renderGesto(g, accent, 240)}</div>`;
      }
    }
    body = `
      <div class="conteudo-wrap text-center">
        <p class="acto-${slide.acto} ${sizeClass} escola-conteudo">${html}</p>
        ${slide.acto === "frase" ? `<div class="accent-line" style="background:${accent};margin-top:24px"></div>` : ""}
        ${gestoHtml}
        ${diagramHtml}
      </div>
    `;
  } else if (slide.tipo === "pull-quote") {
    body = `
      <div class="conteudo-wrap text-center">
        <p style="font-family:'DM Serif Display',Georgia,serif;font-style:italic;font-size:88px;line-height:1.25;color:${accent}">
          «&nbsp;${emphasisToHtml(slide.texto, accent)}&nbsp;»
        </p>
      </div>
    `;
  } else if (slide.tipo === "pausa") {
    body = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center">
        <svg viewBox="0 0 200 280" width="320" height="448" style="opacity:0.5">
          <g fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="100" cy="60" r="22"/>
            <path d="M 100 82 L 100 100 M 70 110 Q 100 100 130 110"/>
            <path d="M 70 110 Q 60 160 75 200"/>
            <path d="M 130 110 Q 140 160 125 200"/>
            <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>
            <path d="M 80 130 Q 95 165 100 175 Q 105 165 120 130"/>
            <animateTransform attributeName="transform" type="scale" values="1;1.04;1" dur="5s" repeatCount="indefinite" additive="sum"/>
          </g>
        </svg>
        <p style="margin-top:32px;font-family:'Nunito',sans-serif;font-size:18px;letter-spacing:10px;text-transform:uppercase;color:${accent};opacity:0.7">respira</p>
      </div>
    `;
  } else if (slide.tipo === "fecho") {
    body = "";
  } else if (slide.tipo === "end") {
    body = `
      <div class="center">
        <p class="end-title">${esc(slide.texto)}</p>
        <p class="end-sub">${esc(slide.subtexto)}</p>
      </div>
    `;
  }

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Serif+Display&family=Nunito:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; background: #141428; color: #f0ece6; font-family: 'Cormorant Garamond', Georgia, serif; }
  .stage { position: relative; width: 1920px; height: 1080px; background: #141428; overflow: hidden; }
  .acto-label {
    position: absolute;
    left: 6%;
    top: 6%;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 6px;
    text-transform: uppercase;
    font-family: 'Nunito', sans-serif;
  }
  .body-center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10%;
  }
  .center { text-align: center; }
  .text-center { text-align: center; max-width: 80%; margin: 0 auto; }
  .text-left { text-align: left; max-width: 80%; margin: 0 auto; }
  .sub-label {
    margin-bottom: 20px;
    font-size: 22px;
    letter-spacing: 6px;
    text-transform: uppercase;
    font-family: 'Nunito', sans-serif;
  }
  .title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 100px;
    line-height: 1.2;
    font-weight: 400;
  }
  .accent-line {
    width: 60px;
    height: 2px;
    margin: 32px auto 0;
  }
  .romano {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 280px;
    line-height: 1;
  }
  .acto-sub {
    margin-top: 16px;
    font-size: 20px;
    letter-spacing: 8px;
    text-transform: uppercase;
    font-family: 'Nunito', sans-serif;
  }
  .conteudo-wrap { width: 100%; }
  /* Tipografia ÚNICA em todos os actos de conteúdo. A diferenciação fica
     no label (I · PERGUNTA, II · SITUAÇÃO…) e na cor de acento.
     Pergunta usa italic. Frase final usa fonte e tamanho maiores. */
  .acto-pergunta,
  .acto-situacao,
  .acto-revelacao,
  .acto-gesto {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 56px;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
  }
  .acto-pergunta { font-style: italic; }
  .acto-pergunta.long, .acto-situacao.long, .acto-revelacao.long, .acto-gesto.long {
    font-size: 48px;
  }
  .acto-pergunta.vlong, .acto-situacao.vlong, .acto-revelacao.vlong, .acto-gesto.vlong {
    font-size: 42px;
  }
  .acto-frase {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 86px;
    font-weight: 400;
    line-height: 1.3;
    text-align: center;
  }
  .acto-frase.long { font-size: 70px; }
  .end-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 80px;
  }
  .end-sub {
    margin-top: 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #6a6460;
  }
  .footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 4%;
    text-align: center;
    font-size: 16px;
    letter-spacing: 4px;
    color: #6a6460;
    font-family: 'Nunito', sans-serif;
    opacity: 0.6;
  }
  /* Capitular (drop cap) na primeira letra do bloco de conteúdo. */
  .escola-conteudo::first-letter {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 2.4em;
    line-height: 0.9;
    float: left;
    margin: 0.05em 0.12em 0 0;
    color: var(--escola-accent);
  }
  /* Fio vertical na margem esquerda, identidade da Escola. */
  .escola-rail {
    position: absolute;
    left: 4%;
    top: 12%;
    bottom: 12%;
    width: 1px;
    opacity: 0.35;
  }
  /* Eco: palavra-mãe do acto anterior, em fade no canto superior direito. */
  .escola-eco {
    position: absolute;
    right: 6%;
    top: 6%;
    text-align: right;
    font-family: 'Cormorant Garamond', Georgia, serif;
    opacity: 0.4;
  }
  .escola-eco .eco-meta {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 5px;
    font-family: 'Nunito', sans-serif;
  }
  .escola-eco .eco-word {
    font-size: 32px;
    font-style: italic;
    margin-top: 4px;
  }
  /* Marca da Escola dos Véus, canto inferior direito. Linha fina por cima
     do nome dá peso editorial. */
  .escola-mark {
    position: absolute;
    right: 6%;
    bottom: 6%;
    font-family: 'Nunito', sans-serif;
    text-align: right;
  }
  .escola-mark .rule {
    height: 1px;
    width: 80px;
    margin: 0 0 6px auto;
    opacity: 0.4;
  }
  .escola-mark .name {
    font-size: 18px;
    letter-spacing: 7px;
    text-transform: uppercase;
    opacity: 0.6;
  }
</style>
</head>
<body style="--escola-accent: ${accent}">
  <div class="stage">
    ${slide.tipo !== "fecho" ? ambientParticles(1920, 1080, accent) : ""}
    ${slide.tipo === "conteudo" ? ambientPresence(accent) : ""}
    ${actoLabel}
    ${ecoLabel}
    <div class="body-center">${body}</div>
    ${footer ? `<div class="footer">${esc(footer)}</div>` : ""}
    ${
      slide.tipo !== "title" && slide.tipo !== "end" && slide.tipo !== "fecho"
        ? `<div class="escola-rail" style="background:${accent}"></div>
           <div class="escola-mark" style="color:${accent}">
             <div class="rule" style="background:${accent}"></div>
             <div class="name">Escola dos Véus</div>
           </div>`
        : ""
    }
  </div>
</body>
</html>`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/**
 * `**palavra**` → <em> em dourado itálico. Mesmo comportamento que
 * src/lib/emphasis.tsx no lado do preview React.
 */
function emphasisToHtml(text, accentColor) {
  return esc(text ?? "").replace(
    /\*\*([^*]+?)\*\*/g,
    `<em style="color:${accentColor};font-style:italic;font-weight:500">$1</em>`,
  );
}
