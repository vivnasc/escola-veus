/** Espelho de src/lib/slide-ambient.ts para o render Puppeteer. */

function seededRandom(seed) {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

export function ambientParticles(width, height, accent, seed = 7) {
  const rand = seededRandom(seed);
  const count = 14;
  const dots = Array.from({ length: count }, (_, i) => {
    const x = Math.round(rand() * width);
    const startY = Math.round(rand() * height);
    const drift = 80 + rand() * 60;
    const dur = 8 + rand() * 6;
    const begin = -rand() * dur;
    const r = 1 + rand() * 1.5;
    const op = 0.15 + rand() * 0.2;
    return `
      <circle cx="${x}" cy="${startY}" r="${r.toFixed(1)}" fill="${accent}" opacity="0">
        <animate attributeName="cy" values="${startY};${startY - drift}" dur="${dur.toFixed(1)}s" begin="${begin.toFixed(1)}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;${op.toFixed(2)};0" dur="${dur.toFixed(1)}s" begin="${begin.toFixed(1)}s" repeatCount="indefinite"/>
      </circle>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="position:absolute;inset:0;pointer-events:none">${dots}</svg>`;
}

export function ambientPresence(accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="120" height="168" style="position:absolute;right:6%;bottom:13%;opacity:0.18;pointer-events:none">
    <g fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="60" r="22"/>
      <path d="M 100 82 L 100 100 M 70 110 Q 100 100 130 110"/>
      <path d="M 70 110 Q 60 160 75 200"><animate attributeName="d" values="M 70 110 Q 60 160 75 200;M 70 108 Q 58 158 75 200;M 70 110 Q 60 160 75 200" dur="5s" repeatCount="indefinite"/></path>
      <path d="M 130 110 Q 140 160 125 200"><animate attributeName="d" values="M 130 110 Q 140 160 125 200;M 130 108 Q 142 158 125 200;M 130 110 Q 140 160 125 200" dur="5s" repeatCount="indefinite"/></path>
      <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>
      <path d="M 80 130 Q 95 165 100 175 Q 105 165 120 130"/>
    </g>
  </svg>`;
}
