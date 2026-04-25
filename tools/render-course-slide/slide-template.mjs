/**
 * Gera HTML standalone para um slide Mock B.
 * Espelho de src/components/admin/SlidePreview.tsx (tipografia, cores,
 * layout). Qualquer mudanca la deve ser reflectida aqui.
 */

export function renderSlideHtml({ slide, deck, accent }) {
  const footer =
    slide.tipo === "title" || slide.tipo === "end" || slide.tipo === "fecho"
      ? ""
      : `${deck.courseTitle.toUpperCase()} · M${deck.moduleNumber} · ${deck.subLetter} · ${deck.subTitle.toUpperCase()}`;

  const actoLabel =
    (slide.tipo === "acto-marker" || slide.tipo === "conteudo") && slide.romano
      ? `<div class="acto-label" style="color:${accent}">${slide.romano} · ${slide.label}</div>`
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
    const align = slide.acto === "frase" ? "center" : (slide.acto === "pergunta" || slide.acto === "revelacao" ? "center" : "left");
    const len = (slide.texto ?? "").length;
    const sizeClass = len > 280 ? "vlong" : len > 200 ? "long" : "";
    const html = emphasisToHtml(slide.texto, accent);
    body = `
      <div class="conteudo-wrap ${align === "center" ? "text-center" : "text-left"}">
        <p class="acto-${slide.acto} ${sizeClass}">${html}</p>
        ${slide.acto === "frase" ? `<div class="accent-line" style="background:${accent};margin-top:24px"></div>` : ""}
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
  /* Marca da Escola dos Véus, canto inferior direito. Mesma cor do acento
     do curso, opacidade reduzida — assinatura, não distração. */
  .escola-mark {
    position: absolute;
    right: 6%;
    bottom: 6%;
    font-size: 18px;
    letter-spacing: 6px;
    text-transform: uppercase;
    font-family: 'Nunito', sans-serif;
    opacity: 0.55;
  }
</style>
</head>
<body>
  <div class="stage">
    ${actoLabel}
    <div class="body-center">${body}</div>
    ${footer ? `<div class="footer">${esc(footer)}</div>` : ""}
    ${slide.tipo !== "title" && slide.tipo !== "end" && slide.tipo !== "fecho"
      ? `<div class="escola-mark" style="color:${accent}">Escola dos Véus</div>`
      : ""}
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
