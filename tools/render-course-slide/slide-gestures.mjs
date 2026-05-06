/** Espelho de src/lib/slide-gestures.ts. */

const GESTO_KEYWORDS = {
  respira: /\brespir/i,
  "mao-peito": /\bm[ãa]o\s+(no\s+)?peito\b|\bcora[çc][ãa]o\b/i,
  escreve: /\bescrev|\bcaderno\b|\bdi[áa]rio\b|\bregist/i,
  olha: /\bolha|\bv[êe]\b|\bobserv/i,
  "abre-maos": /\babr[ie]r?\s+(as\s+)?m[ãa]os|\bsoltar\b|\blarg/i,
};

export function detectGesto(text) {
  if (!text) return null;
  for (const [g, re] of Object.entries(GESTO_KEYWORDS)) {
    if (re.test(text)) return g;
  }
  return null;
}

const HEAD = `<circle cx="100" cy="60" r="22"/>`;
const NECK = `<path d="M 100 82 L 100 100 M 70 110 Q 100 100 130 110"/>`;

export function renderGesto(gesto, accent, size = 200) {
  const gestos = {
    respira: `
      <path d="M 70 110 Q 60 160 75 200"><animate attributeName="d" values="M 70 110 Q 60 160 75 200;M 65 110 Q 50 160 70 200;M 70 110 Q 60 160 75 200" dur="3.5s" repeatCount="indefinite"/></path>
      <path d="M 130 110 Q 140 160 125 200"><animate attributeName="d" values="M 130 110 Q 140 160 125 200;M 135 110 Q 150 160 130 200;M 130 110 Q 140 160 125 200" dur="3.5s" repeatCount="indefinite"/></path>
      <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>
      <path d="M 80 130 Q 95 165 100 175 Q 105 165 120 130"/>`,
    "mao-peito": `
      <path d="M 70 110 Q 60 160 75 200"/>
      <path d="M 130 110 Q 140 160 125 200"/>
      <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>
      <path d="M 80 120 Q 92 130 100 140"><animate attributeName="d" values="M 80 120 Q 92 130 100 140;M 80 120 Q 92 128 100 138;M 80 120 Q 92 130 100 140" dur="4s" repeatCount="indefinite"/></path>
      <path d="M 100 140 Q 95 150 100 160"/>
      <ellipse cx="100" cy="155" rx="14" ry="10" fill="${accent}" opacity="0.25"/>`,
    escreve: `
      <path d="M 70 110 Q 60 160 75 200"/>
      <path d="M 130 110 Q 140 160 125 200"/>
      <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>
      <path d="M 120 130 Q 130 160 145 175"/>
      <line x1="145" y1="175" x2="160" y2="190" stroke-width="2"/>
      <line x1="145" y1="195" x2="170" y2="195" stroke-width="0.8" opacity="0.6"/>
      <line x1="148" y1="205" x2="173" y2="205" stroke-width="0.8" opacity="0.5"/>
      <line x1="146" y1="215" x2="165" y2="215" stroke-width="0.8" opacity="0.4"/>`,
    olha: `
      <path d="M 70 110 Q 60 160 75 200"/>
      <path d="M 130 110 Q 140 160 125 200"/>
      <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>
      <path d="M 80 130 Q 95 165 100 175 Q 105 165 120 130"/>
      <line x1="100" y1="56" x2="100" y2="40" stroke-width="0.6" opacity="0.4"><animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite"/></line>
      <line x1="115" y1="55" x2="125" y2="42" stroke-width="0.6" opacity="0.3"/>
      <line x1="85" y1="55" x2="75" y2="42" stroke-width="0.6" opacity="0.3"/>`,
    "abre-maos": `
      <path d="M 70 115 Q 40 130 25 145"/>
      <path d="M 130 115 Q 160 130 175 145"/>
      <path d="M 25 145 Q 20 150 25 155 M 175 145 Q 180 150 175 155"/>
      <path d="M 70 110 Q 60 160 75 200"/>
      <path d="M 130 110 Q 140 160 125 200"/>
      <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="${size}" height="${(size * 280) / 200}" style="display:block">
    <g fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      ${HEAD}
      ${NECK}
      ${gestos[gesto]}
    </g>
  </svg>`;
}
