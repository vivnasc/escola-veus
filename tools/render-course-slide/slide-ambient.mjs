/** Espelho de src/lib/slide-ambient.ts. */

function seededRandom(seed) {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

export function ambientWatercolor(width, height, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="position:absolute;inset:0;pointer-events:none">
    <defs>
      <radialGradient id="agua-1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="agua-2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.07"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="${width * 0.25}" cy="${height * 0.3}" r="350" fill="url(#agua-1)">
      <animate attributeName="cx" values="${width * 0.25};${width * 0.32};${width * 0.25}" dur="22s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${height * 0.3};${height * 0.4};${height * 0.3}" dur="22s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${width * 0.75}" cy="${height * 0.7}" r="420" fill="url(#agua-2)">
      <animate attributeName="cx" values="${width * 0.75};${width * 0.7};${width * 0.75}" dur="28s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${height * 0.7};${height * 0.6};${height * 0.7}" dur="28s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${width * 0.5}" cy="${height * 0.5}" r="280" fill="url(#agua-1)">
      <animate attributeName="r" values="280;320;280" dur="14s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
}

export function ambientPetals(width, height, accent, seed = 11) {
  const rand = seededRandom(seed);
  const count = 8;
  const petals = Array.from({ length: count }, () => {
    const x = Math.round(rand() * width);
    const startY = -50 - rand() * 200;
    const fallDistance = height + 100;
    const dur = 14 + rand() * 8;
    const begin = -rand() * dur;
    const sway = 30 + rand() * 40;
    const rotStart = Math.round(rand() * 360);
    const rotEnd = rotStart + 180 + rand() * 360;
    const size = 0.7 + rand() * 0.6;
    return `
      <g opacity="0.6" transform="translate(${x} ${startY}) scale(${size.toFixed(2)})">
        <animateTransform attributeName="transform" type="translate" values="${x} ${startY};${x + sway} ${startY + fallDistance / 2};${x - sway / 2} ${startY + fallDistance}" dur="${dur.toFixed(1)}s" begin="${begin.toFixed(1)}s" repeatCount="indefinite" additive="sum"/>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="${rotStart}" to="${rotEnd}" dur="${dur.toFixed(1)}s" begin="${begin.toFixed(1)}s" repeatCount="indefinite"/>
          <path d="M 0 -10 Q 8 0 0 18 Q -8 0 0 -10 Z" fill="${accent}" opacity="0.5"/>
        </g>
      </g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="position:absolute;inset:0;pointer-events:none">${petals}</svg>`;
}

export function ambientWaves(width, height, accent) {
  const cx = width / 2, cy = height / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="position:absolute;inset:0;pointer-events:none">
    ${[0, 3, 6].map((delay) => `
      <circle cx="${cx}" cy="${cy}" r="80" fill="none" stroke="${accent}" stroke-width="0.8">
        <animate attributeName="r" values="80;500" dur="9s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.25;0" dur="9s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-width" values="1.2;0.2" dur="9s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>`).join("")}
  </svg>`;
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

export function ambientFullStack(width, height, accent) {
  return [
    ambientWatercolor(width, height, accent),
    ambientWaves(width, height, accent),
    ambientPetals(width, height, accent),
    ambientPresence(accent),
  ].join("");
}

export function ambientParticles(width, height, accent, seed = 7) {
  return ambientWatercolor(width, height, accent) + ambientPetals(width, height, accent, seed);
}
