# Especificação de Design dos Slides — Carrossel "Os Sete Véus"

Documento de referência exaustivo para replicar pixel-a-pixel o aspecto dos
slides. Cobre TRÊS implementações que coexistem na codebase:

- **A — React preview** (`escola-veus-app/src/app/admin/producao/carrossel-veus/Slide.tsx`)
  Componente que renderiza o slide no editor admin. É a fonte canónica do
  visual quando há `theme` (paleta) seleccionada. Tem auto-fit JS.
- **B — Puppeteer template** (`carrossel-veus/template.html` + `styles.css`)
  Renderer headless que gera os PNGs finais. Usa CSS vars com `--hue` por
  dia e tem decoração "luz" (pirilampos, sparkles, arco-íris, papel)
  ausente do React. É o que está em produção para PNG export.
- **C — Modo "fundo MJ"** (imagem MidJourney). Activado em ambos quando
  o slide ou o dia têm `fundo`. Aplica scrim + esconde decoração default.

O objectivo desta migração para o repo `viviannepag`: replicar o **aspecto
visual** das duas variantes — React (com `theme`) e template (com
decoração luz) — sem alterar nada. Apenas se expande conteúdo.

> NOTA EDITORIAL: o utilizador (Vivianne) banniu travessões em código.
> Este documento usa travessões apenas como bullets/separadores em prosa
> portuguesa, nunca dentro de blocos de código.

---

## 0. Constantes globais (universais aos três tipos)

### Dimensões do canvas
- `W = 1080` px (largura)
- `H = 1920` px (altura)
- Ratio 9:16 — Instagram story / reel.
- `PAD = 110` px — padding base usado nos `content` wrappers (excepto
  capa e cta que ajustam vertical para 150/200 ou 180/180).
- `overflow: hidden` em todos os contentores raiz.
- `box-sizing: border-box` global no template (`* { box-sizing }`).

### Tipografia carregada
Em ambos os renderers as três famílias são:

| Família | Pesos | Itálico | Uso |
|---|---|---|---|
| `Cormorant Garamond` | 300, 400, 500, 600 | 300, 400, 500 | Títulos, body poético, ornamentos |
| `Inter` | 300, 400, 500, 600 | — | Marca, kicker, footers UPPERCASE |
| `JetBrains Mono` | 400, 500 | — | URL no CTA |

Template usa Google Fonts com `display=block`:
```html
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=block
```

### Renderização do texto
```css
font-feature-settings: "liga", "kern", "dlig";
-webkit-font-smoothing: antialiased;
text-rendering: geometricPrecision;
```
Aplicado em `html, body` no template e em `slideBase` no React.

### `slideBase` (React, partilhado pelos três tipos)
```ts
{
  position: "relative",
  width: 1080,
  height: 1920,
  overflow: "hidden",
  fontFamily: '"Inter", system-ui, sans-serif',
  fontFeatureSettings: '"liga", "kern", "dlig"',
  WebkitFontSmoothing: "antialiased",
  textRendering: "geometricPrecision",
  boxSizing: "border-box",
}
```

### Prop `scale`
React `Slide` aceita `scale` (default 1). Envolve o slide num wrapper
com `width: W*scale, height: H*scale, overflow: hidden, flexShrink: 0`
e aplica `transform: scale(scale); transformOrigin: top left` ao filho
1080×1920 real. Usado para preview multi-slide no admin. O template
Puppeteer renderiza sempre a 1:1 e o screenshot é a 1080×1920.

---

## 1. Sistema de tema (`CarouselTheme`)

O React `Slide.tsx` é parametrizado por `theme: CarouselTheme`. Campos:

```ts
type CarouselTheme = {
  id: string;
  label: string;
  ink: string;            // tinta principal (texto escuro)
  ivory: string;          // fundo claro principal
  parchmentDark: string;  // bordo do gradiente claro
  deep: string;           // fundo escuro principal
  deepWarm: string;       // centro do gradiente escuro (mais quente)
  terracotta: string;     // acento quente
  gold: string;           // acento dourado (cantoneiras, ◇◇◇, footers)
  mist: string;           // rgba(...) — para subtítulos/descrições
  mode?: "luz" | "sombra";
};
```

### Paletas existentes
A escolha default (`THEMES[0]`) é `editorial`:
```ts
{ id: "editorial", ink:"#26221c", ivory:"#f3ece0", parchmentDark:"#d8d0c1",
  deep:"#1a1714", deepWarm:"#2a2520", terracotta:"#8a8378", gold:"#b69a6e",
  mist:"rgba(243, 236, 224, 0.65)" }  // sem `mode` → misto
```
Outras: `luz` (mode "luz"), `sombra` (mode "sombra"), `veus` (clássico
creme+ouro com `gold: #c9a961, terracotta: #b85c38`), `maternidade`
(rosa quente), `lua` (azul-noite), `dourado` (ouro intenso), `selva`
(verde-selva).

### Significado de `mode`
- **`mode === "luz"`** — TODOS os slides (capa, conteúdo, cta) ficam em
  fundo claro/ivory, texto `ink`. Modifica capa+cta para usar
  gradiente ivory+parchmentDark em vez de deep+deepWarm.
- **`mode === "sombra"`** — TODOS os slides ficam em fundo escuro,
  texto `ivory`. Aplica-se principalmente ao conteúdo (capa+cta já
  são escuros por default no comportamento legacy). Inverte o
  `fundoClaro` default.
- **omitido (undefined)** — comportamento legacy "misto": capa+cta
  são escuros (gradiente `deepWarm → deep`), conteúdo é claro
  (gradiente `ivory → parchmentDark`).

### Mapping CSS vars do template (`styles.css`) ↔ campos do `CarouselTheme`

| CSS var | Campo `CarouselTheme` (analogia) |
|---|---|
| `--ink`            | `ink` |
| `--ink-soft`       | (não tem analogia directa, é `ink` + alpha) |
| `--ivory`          | `ivory` |
| `--parchment-dark` | `parchmentDark` |
| `--deep`           | `deep` (no template é invertido para fundo claro) |
| `--deep-warm`      | `deepWarm` |
| `--terracotta`     | `terracotta` |
| `--gold`           | `gold` |
| `--gold-glow`      | (variação clara do gold, sem analogia directa) |
| `--mist`           | `mist` |

Valores no `styles.css` (versão "LUZ" do template):
```css
--ink: #3a2e26;
--ink-soft: #6b5849;
--ivory: #fdf8ed;
--parchment-dark: #f1e3c8;
--deep: #fbf4e3;        /* "deep" invertido — luz */
--deep-warm: #fff9e8;   /* centro do glow */
--terracotta: #d68b6c;
--terracotta-soft: #f0c4b0;
--gold: #c9a14a;
--gold-glow: #f6dc92;
--mist: rgba(58, 46, 38, 0.5);
```

### Hue por dia (template apenas)
O template tem hue dinâmico por dia, controlado via classe `.dia-N` no
slide raiz. Define `--hue` e `--hue-deep`:
```css
.dia-1 { --hue: var(--rose);     --hue-deep: var(--rose-deep); }   /* I — Permanência */
.dia-2 { --hue: var(--lavender); --hue-deep: var(--lavender-deep); } /* II — Memória */
.dia-3 { --hue: var(--mint);     --hue-deep: var(--mint-deep); }   /* III — Turbilhão */
.dia-4 { --hue: var(--sage);     --hue-deep: var(--sage-deep); }   /* IV — Esforço */
.dia-5 { --hue: var(--amber);    --hue-deep: var(--amber-deep); }  /* V — Desolação */
.dia-6 { --hue: var(--sky);      --hue-deep: var(--sky-deep); }    /* VI — Horizonte */
.dia-7 { --hue: var(--aurora);   --hue-deep: var(--aurora-deep); } /* VII — Dualidade */
```
Hues definidos:
```css
--rose: #f5b8a8;     --rose-deep: #e89684;
--lavender: #d8c4e8; --lavender-deep: #b29bce;
--mint: #b8dcc8;     --mint-deep: #82bea4;
--sage: #cde0b6;     --sage-deep: #9fbc7c;
--amber: #f0c890;    --amber-deep: #d8a868;
--sky: #bedaee;      --sky-deep: #8cb4d0;
--aurora: #e6cde8;   --aurora-deep: #c098c8;
```

> IMPORTANTE: o **React** NÃO tem este sistema de `hue` por dia. Usa
> o `gold` e o `terracotta` do tema seleccionado. O **template** usa
> color-mix entre `--hue-deep` e `--gold`/`--terracotta` para muitos
> acentos. Esta é uma das diferenças visuais entre as duas variantes.

---

## 2. Camadas decorativas universais

A ordem de empilhamento (do mais atrás para o mais à frente) é
**rigorosamente esta** em todos os slides:

### React (Slide.tsx)
1. (z 0) **FundoLayer img** — `<img>` com `objectFit: "cover"`, se houver
   `fundoUrl`.
2. (z 1) **FundoLayer scrim** — gradiente radial para legibilidade.
3. (z auto) **grain** — `grainStyle` (`mix-blend-mode: overlay, opacity 0.45`)
   ou `grainDarkStyle` (`mix-blend-mode: screen, opacity 0.18`).
4. (z auto) **vignette** — `vignetteLight` ou `vignetteDark` (radial gradient
   transparent centre → escurecimento warm nas bordas).
5. (z auto) **glow** — `glowGold` (capa) ou `glowTerra` (cta) ou nenhum
   (conteúdo).
6. (z 1) **big number watermark** — só na capa, `dia.numero` em
   Cormorant Garamond italic 720px com `opacity ~0.05` em gold (atrás de
   tudo do conteúdo).
7. (z 3) **Cantoneiras** — 4 cantos, 1px gold.
8. (z 2) **content wrapper** — todo o texto e elementos UI.

### Template Puppeteer (template.html / styles.css)
Decoração construída pela função `decor({ rainbowArc, rainbowStrip, density })`
que injecta na ordem:
1. `.bg` (img MJ, se `has-bg`, z 0) → `.scrim` (z 3)
2. `.rainbow-arc` (se pedido, z 1)
3. `.rainbow-strip.top` e `.rainbow-strip.bot` (se pedido, z 3)
4. `.glow-hue` (z 1) — gradiente radial colorido pelo hue do dia
5. `.paper` (z 1) — textura SVG turbulence "papel"
6. `.vignette-light` (z 1) — moldura suave dourada
7. `.fireflies` (z 2) — pirilampos
8. `.stars` (z 2) — sparkles em forma de estrela 8-pontas
9. `.content` (z 5) — texto e UI

> A diferença crítica entre o React e o template: o template tem
> **pirilampos animados** (na verdade estáticos no PNG, posicionados por
> `nth-child`), **sparkles**, **arco-íris**, **papel** e **glow colorido
> por dia**. O React tem apenas grain, vignette, glow (gold/terra) e
> cantoneiras. **Se o objectivo é replicar o aspecto React/admin**, NÃO
> incluir pirilampos. **Se é replicar o template/PNG**, incluir todos.

### `grainStyle` — SVG noise turbulence (React)
```ts
const GRAIN_SVG = "url(\"data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(%23n)'/>
</svg>\")";

const grainStyle = {
  position: "absolute", inset: 0, pointerEvents: "none",
  backgroundImage: GRAIN_SVG, backgroundSize: "400px 400px",
  mixBlendMode: "overlay", opacity: 0.45,
};
const grainDarkStyle = { ...grainStyle, mixBlendMode: "screen", opacity: 0.18 };
```
Variação no template (`.paper`):
```css
.paper {
  background-image: url("data:image/svg+xml;utf8,<svg ...>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='5' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 1  0 0 0 0 0.96  0 0 0 0 0.86  0 0 0 0.35 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 400px 400px;
  mix-blend-mode: multiply;
  opacity: 0.22;
}
```
Diferenças: template usa `baseFrequency 0.85` (ligeiramente menos
denso), `seed 5`, color-matrix com warm tint (RGB 1, 0.96, 0.86) e
`alpha 0.35`. Blend mode `multiply` em vez de `overlay` e `opacity 0.22`.

### Vignettes (React)
```ts
const vignetteDark = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(ellipse 80% 60% at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
};
const vignetteLight = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(ellipse 90% 70% at center, transparent 50%, rgba(60, 35, 15, 0.18) 100%)",
};
```
- `vignetteDark`: bordas escurecem para preto 55% (slides escuros).
- `vignetteLight`: bordas levam um warm-brown muito subtil (18%).

Template equivalente (`.vignette-light`):
```css
.vignette-light {
  background: radial-gradient(ellipse 92% 76% at center, transparent 58%,
    color-mix(in srgb, var(--hue-deep) 12%, transparent) 100%);
}
```

### Glows radiais (React, só usados em capa e cta)
```ts
const glowGold = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(201, 169, 97, 0.10) 0%, transparent 70%)",
};
const glowTerra = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(184, 92, 56, 0.10) 0%, transparent 70%)",
};
```
- `glowGold` — usado na **capa**, centro alto (35%), gold a 10%.
- `glowTerra` — usado no **cta**, centro baixo (60%), terracotta a 10%.

Template `.glow-hue` (colorido por dia):
```css
.glow-hue {
  background:
    radial-gradient(ellipse 78% 55% at 50% 28%, color-mix(in srgb, var(--hue) 70%, transparent) 0%, transparent 65%),
    radial-gradient(ellipse 90% 70% at 50% 92%, color-mix(in srgb, var(--hue-deep) 35%, transparent) 0%, transparent 70%);
}
.glow-hue.soft {
  background:
    radial-gradient(ellipse 85% 60% at 50% 50%, color-mix(in srgb, var(--hue) 38%, transparent) 0%, transparent 70%);
}
```

---

## 3. Componente `Cantoneiras` (React)

Quatro cantos do slide, cada um com dois traços perpendiculares (L invertido).

```tsx
function Cantoneiras({ color }: { color: string }) {
  const ARM = 56;        // comprimento de cada braço, px
  const INSET = 60;      // afastamento do bordo do slide, px
  const stroke = 1;      // espessura do traço, px
  const common: React.CSSProperties = {
    position: "absolute",
    background: color,
    opacity: 0.55,
    pointerEvents: "none",
    zIndex: 3,
  };
  // top-left
  <span style={{ ...common, top: INSET, left: INSET,  width: ARM,    height: stroke }} />
  <span style={{ ...common, top: INSET, left: INSET,  width: stroke, height: ARM    }} />
  // top-right
  <span style={{ ...common, top: INSET, right: INSET, width: ARM,    height: stroke }} />
  <span style={{ ...common, top: INSET, right: INSET, width: stroke, height: ARM    }} />
  // bottom-left
  <span style={{ ...common, bottom: INSET, left: INSET,  width: ARM,    height: stroke }} />
  <span style={{ ...common, bottom: INSET, left: INSET,  width: stroke, height: ARM    }} />
  // bottom-right
  <span style={{ ...common, bottom: INSET, right: INSET, width: ARM,    height: stroke }} />
  <span style={{ ...common, bottom: INSET, right: INSET, width: stroke, height: ARM    }} />
}
```

Valores resumidos:
- `ARM = 56` px
- `INSET = 60` px (do bordo do canvas 1080×1920)
- `stroke = 1` px
- `opacity: 0.55`
- `z-index: 3`
- Cor: `C.gold` em capa e cta. Em **conteúdo**: `sombra ? C.gold : C.terracotta`
  (no modo claro, cantoneiras são terracotta; no modo escuro, gold).

**Template não tem cantoneiras**. Esta é exclusiva da variante React.

---

## 4. Componente `VeusAsLevantar` (React)

Metáfora dos véus a soltar-se. Três linhas horizontais empilhadas, com
larguras e opacidades decrescentes (ou crescentes, com `dir="up"`).

```tsx
function VeusAsLevantar({ color, dir = "down" }: { color: string; dir?: "up" | "down" }) {
  const lines = dir === "down"
    ? [{ w: 320, o: 0.65 }, { w: 200, o: 0.45 }, { w: 100, o: 0.28 }]
    : [{ w: 100, o: 0.28 }, { w: 200, o: 0.45 }, { w: 320, o: 0.65 }];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {lines.map((l, i) => (
        <span key={i} style={{ width: l.w, height: 1, background: color, opacity: l.o }} />
      ))}
    </div>
  );
}
```

Resumo:
- 3 spans (linhas).
- Larguras: `320 / 200 / 100` px (top→bottom em `dir="down"`).
- Opacidades: `0.65 / 0.45 / 0.28`.
- `height: 1` px cada.
- `gap: 8` px entre linhas.
- `alignItems: center` no flex column.
- Cor: passada via prop (`C.gold` no único uso, na capa).
- Usado apenas na **capa**, com `dir="down"`, por cima do título do véu.

**Template não tem este componente**. Em vez disso usa `romano-rule` (uma
linha + algarismos romanos + outra linha — ver capa).

---

## 5. Componente `FundoLayer` (imagem MJ de fundo)

Ambos os renderers suportam `fundo: string | null` no slide (ou no dia).
Quando presente, a imagem ocupa todo o canvas via `object-fit: cover`
e por cima vai um **scrim** (camada de tinta para legibilidade do texto).

### React (`FundoLayer`)
```tsx
function FundoLayer({ url, claro }: { url: string; claro?: boolean }) {
  const scrim = claro
    ? { background: "radial-gradient(ellipse 78% 62% at center, rgba(245,234,213,0.94) 0%, rgba(245,234,213,0.62) 100%)" }
    : { background: "radial-gradient(ellipse 72% 58% at center, rgba(15,12,10,0.68) 0%, rgba(15,12,10,0.92) 100%)" };
  return (
    <>
      <img src={url} alt="" aria-hidden style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", zIndex: 0, userSelect: "none", pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, ...scrim }} />
    </>
  );
}
```

Scrim:
- **`claro: true`** (imagem clara, texto escuro): radial ivory denso no
  centro (94% → 62% opacidade), garante legibilidade do texto escuro.
- **`claro: false`** (imagem escura, texto claro): radial dark warm
  (15,12,10) de 68% no centro a 92% nas bordas — escurece tudo.

Quando há `fundoUrl` na **capa**, o título do véu ganha `textShadow`:
```ts
textShadow: fundoUrl
  ? (luz
      ? "0 1px 6px rgba(245,234,213,0.85), 0 0 14px rgba(245,234,213,0.55)"
      : "0 1px 6px rgba(15,12,10,0.85), 0 0 14px rgba(15,12,10,0.55)")
  : "none",
```

### Template (`.scrim`)
Scrim em forma de gradiente linear top→bottom (diferente do React que
é radial):
```css
.slide.has-bg .scrim {
  z-index: 3;
  background: linear-gradient(to bottom,
    rgba(10, 7, 5, 0.55) 0%,
    rgba(10, 7, 5, 0.18) 22%,
    rgba(10, 7, 5, 0.10) 50%,
    rgba(10, 7, 5, 0.22) 78%,
    rgba(10, 7, 5, 0.62) 100%);
}
.slide.has-bg.luz .scrim {
  background: linear-gradient(to bottom,
    rgba(253, 248, 237, 0.62) 0%,
    rgba(253, 248, 237, 0.20) 24%,
    rgba(253, 248, 237, 0.10) 50%,
    rgba(253, 248, 237, 0.22) 78%,
    rgba(253, 248, 237, 0.68) 100%);
}
```

### Comportamento em modo `mode === "luz"` (React)
```ts
{fundoUrl && <FundoLayer url={fundoUrl} claro={luz || slide.fundoClaro} />}
```
Em modo luz, força `claro: true` mesmo que `fundoClaro` esteja false —
o scrim ivory garante texto `ink` legível em qualquer imagem.

### Fundo no conteúdo (React)
```ts
const fundoClaro = sombra ? !!slide.fundoClaro : slide.fundoClaro ?? true;
```
- Em modo sombra: `fundoClaro` defaulta a `false` (texto claro).
- Caso contrário (default/luz): `fundoClaro` defaulta a `true` (texto escuro).

### Quando o template tem `has-bg`
- Texto fica claro (`#fbf3e2`) por defeito, com `text-shadow:
  0 2px 18px rgba(0, 0, 0, 0.45)`.
- Variante `.has-bg.luz`: texto volta a `var(--ink)` com
  `text-shadow: 0 2px 16px rgba(253, 248, 237, 0.7)` (sombra clara, halo).
- `.ghost-num` é **escondido** com `display: none` quando há `has-bg`.
- `.espiral-bg` baixa opacidade para 0.06.
- Decoração default é **escondida** salvo se `.decor` estiver presente:
  ```css
  .slide.has-bg:not(.decor) .glow-hue,
  .slide.has-bg:not(.decor) .paper,
  .slide.has-bg:not(.decor) .vignette-light,
  .slide.has-bg:not(.decor) .fireflies,
  .slide.has-bg:not(.decor) .stars,
  .slide.has-bg:not(.decor) .rainbow-arc,
  .slide.has-bg:not(.decor) .rainbow-strip { display: none; }
  ```

---

## 6. Slide tipo CAPA — especificação exaustiva

### 6.1 Contentor raiz (React)
```ts
const luz = C.mode === "luz";
const bg = luz
  ? `radial-gradient(ellipse 70% 50% at 50% 35%, ${C.ivory} 0%, ${C.parchmentDark} 70%)`
  : `radial-gradient(ellipse 70% 50% at 50% 35%, ${C.deepWarm} 0%, ${C.deep} 70%)`;
const txt = luz ? C.ink : C.ivory;
<div style={{ ...slideBase, background: bg, color: txt }}>
```
- Default (mode=undefined): fundo **escuro**, gradiente do `deepWarm`
  (centro alto a 35%) para `deep` (bordas a 70%). Texto `ivory`.
- Mode "luz": fundo **claro**, gradiente do `ivory` para
  `parchmentDark`. Texto `ink`.
- Mode "sombra": comportamento idêntico ao default (já é escuro).

### 6.2 Ordem das camadas (React)
1. `FundoLayer` (se `fundoUrl = slide.fundo ?? dia.fundo`). Scrim
   `claro: luz || slide.fundoClaro`.
2. `<div style={luz ? grainStyle : grainDarkStyle} />`
3. `<div style={luz ? vignetteLight : vignetteDark} />`
4. `<div style={glowGold} />`
5. `<Cantoneiras color={C.gold} />`
6. **Big number watermark** (`dia.numero`):
   ```ts
   {
     position: "absolute",
     top: 280,
     left: "50%",
     transform: "translateX(-50%)",
     fontFamily: '"Cormorant Garamond", serif',
     fontStyle: "italic",
     fontWeight: 300,
     fontSize: 720,
     lineHeight: 1,
     color: "rgba(201, 169, 97, 0.05)",  // gold a 5% opacidade
     letterSpacing: "-0.05em",
     userSelect: "none",
     zIndex: 1,
   }
   ```
7. `content` wrapper (z-index: 2, ver §6.3).

### 6.3 Content wrapper (React)
```ts
{
  position: "relative",
  zIndex: 2,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: `150px ${PAD}px 200px`,  // top: 150, bottom: 200, x: 110
  alignItems: "center",
  justifyContent: "space-between",   // título topo, linhas meio, marca rodapé
}
```

### 6.4 Bloco superior — "top"
```ts
{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }
```
Filhos (por ordem vertical):
1. `<VeusAsLevantar color={C.gold} dir="down" />` (3 linhas 320/200/100 px,
   gap 8, gold 0.65/0.45/0.28 opacidade).
2. **Título do véu** (`dia.veu`):
   ```ts
   {
     fontFamily: '"Cormorant Garamond", serif',
     fontWeight: 300,
     fontSize: 180,                  // ajustado por auto-fit
     lineHeight: 0.95,
     textAlign: "center",
     letterSpacing: "-0.025em",
     whiteSpace: "nowrap",
     textShadow: <ver §5 se fundoUrl>,
   }
   ```
3. **Ornamento ◇ ◇ ◇**:
   ```ts
   {
     fontFamily: '"Cormorant Garamond", serif',
     fontStyle: "italic",
     fontSize: 28,
     color: C.gold,
     letterSpacing: "1.2em",  // muito espaçado
     opacity: 0.8,
   }
   // conteúdo: "◇ ◇ ◇" (três losangos brancos U+25C7, separados por espaço)
   ```
4. **Subtítulo** (`dia.subtitulo`):
   ```ts
   {
     fontFamily: '"Cormorant Garamond", serif',
     fontStyle: "italic",
     fontSize: 38,
     lineHeight: 1.35,
     textAlign: "center",
     color: C.mist,           // ex: "rgba(243, 236, 224, 0.65)"
     maxWidth: 720,
   }
   ```

### 6.5 Bloco do meio — "abertura" (linha1/linha2)
```ts
{
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: "italic",
  fontSize: 56,
  lineHeight: 1.4,
  textAlign: "center",
  maxWidth: 820,
}
// renderiza: {slide.linha1}<br/>{slide.linha2}
```
Sem cor explícita (herda `txt` do contentor).

### 6.6 Rodapé — marca "os sete véus"
```ts
{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }
```
Filhos:
1. **Linha horizontal**: `<span style={{ width: 80, height: 1,
   background: C.gold, opacity: 0.55 }} />`.
2. **Marca**:
   ```ts
   {
     fontWeight: 300,
     fontSize: 18,
     letterSpacing: "0.6em",
     textTransform: "uppercase",
     color: C.gold,
     opacity: 0.7,
   }
   // texto: "os sete véus"
   ```

### 6.7 Auto-fit do título do véu (React)
No componente `Capa`, há um `useEffect` que dimensiona o título para
caber em 860 px:
```ts
useEffect(() => {
  const el = veuRef.current;
  if (!el) return;
  const apply = () => {
    const max = 860;
    let size = 180;
    el.style.fontSize = `${size}px`;
    let g = 80;                       // guard de iterações
    while (el.scrollWidth > max && size > 110 && g-- > 0) {
      size -= 4;
      el.style.fontSize = `${size}px`;
    }
  };
  if (document.fonts?.ready) document.fonts.ready.then(apply);
  else apply();
}, [dia.veu]);
```
Regras: começa em **180 px**, reduz **4 px de cada vez**, mínimo
**110 px**, máximo **80 iterações** (defensive guard), aplica após
`document.fonts.ready`.

### 6.8 Capa — variante TEMPLATE (`renderCapa`)
HTML emitido:
```html
<div class="slide capa dia-${numero} ${has-bg classes}">
  ${bgLayer(fundo)}                                  <!-- img + scrim se has-bg -->
  ${decor({ rainbowArc: isDia7, density: "alta" })}  <!-- 15 fireflies + 10 sparkles -->
  <div class="ghost-num">${numero}</div>
  <div class="content">
    <div class="top">
      <div class="romano-rule">
        <span class="rule"></span>
        <span class="romano">${dia.romano}</span>
        <span class="rule"></span>
      </div>
      <div class="veu">${dia.veu}</div>
      <div class="ornament">✦ &nbsp; ✧ &nbsp; ✦</div>     <!-- DIFERENTE do React ◇ -->
      <div class="subtitulo">${dia.subtitulo}</div>
    </div>
    <div class="abertura">
      ${slide.linha1}<br/>${slide.linha2}
    </div>
    <div class="footer">
      <span class="rule"></span>
      <span class="marca">os sete véus</span>
    </div>
  </div>
</div>
```

CSS-key da capa template:
```css
.slide.capa {
  background:
    radial-gradient(ellipse 70% 50% at 50% 32%, color-mix(in srgb, var(--hue) 65%, var(--ivory)) 0%, var(--ivory) 65%),
    radial-gradient(ellipse 90% 60% at 50% 95%, color-mix(in srgb, var(--hue-deep) 22%, var(--ivory)) 0%, var(--ivory) 70%),
    var(--ivory);
  color: var(--ink);
}
.slide.capa .content { justify-content: space-between; align-items: center; padding-top: 160px; padding-bottom: 200px; }
.slide.capa .ghost-num {
  position: absolute; top: 280px; left: 50%;
  transform: translateX(-50%);
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: 720px; line-height: 1;
  color: color-mix(in srgb, var(--hue-deep) 14%, transparent);
  letter-spacing: -0.05em; z-index: 2;
}
.slide.capa .top { display: flex; flex-direction: column; align-items: center; gap: 36px; width: 100%; }
.slide.capa .romano-rule { display: flex; align-items: center; justify-content: center; gap: 28px; width: 100%; }
.slide.capa .romano-rule .rule { height: 1px; flex: 1; max-width: 220px; }
.slide.capa .romano {
  font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px;
  letter-spacing: 0.55em;
  color: color-mix(in srgb, var(--hue-deep) 80%, var(--ink));
  text-transform: uppercase; white-space: nowrap;
}
.slide.capa .veu {
  font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 180px;
  line-height: 0.95; text-align: center; letter-spacing: -0.025em;
  color: var(--ink); white-space: nowrap;
}
.slide.capa .subtitulo {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400;
  font-size: 38px; line-height: 1.35; text-align: center;
  color: color-mix(in srgb, var(--ink) 75%, transparent); max-width: 720px;
}
.slide.capa .ornament {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 30px;
  color: color-mix(in srgb, var(--hue-deep) 90%, var(--gold));
  letter-spacing: 1.2em; opacity: 0.9; margin-top: 8px;
}
.slide.capa .abertura {
  font-family: 'Cormorant Garamond', serif; font-weight: 400; font-style: italic;
  font-size: 56px; line-height: 1.4; text-align: center;
  color: var(--ink); max-width: 820px;
}
.slide.capa .footer { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.slide.capa .footer .marca {
  font-family: 'Inter', sans-serif; font-weight: 400; font-size: 18px;
  letter-spacing: 0.6em; text-transform: uppercase;
  color: color-mix(in srgb, var(--hue-deep) 70%, var(--ink)); opacity: 0.85;
}
.slide.capa .footer .rule { width: 80px; height: 1px; }
```

### Diferenças capa: React vs template
| Aspecto | React | Template |
|---|---|---|
| Fundo default | Escuro (`deep`) | Claro (`ivory + hue`) |
| Cantoneiras | Sim | Não |
| VeusAsLevantar | Sim (3 linhas gold) | Não — usa `romano-rule` (linha + romano + linha) |
| Top padding | 150 | 160 |
| Bottom padding | 200 | 200 |
| Ornament | `◇ ◇ ◇` (U+25C7) | `✦ &nbsp; ✧ &nbsp; ✦` (U+2726 / U+2727) |
| Ornament fontSize | 28 | 30 |
| Marca "os sete véus" fontSize | 18 | 18 |
| Marca fontWeight | 300 | 400 |
| Marca opacity | 0.7 | 0.85 |
| Footer rule | 80×1 px gold @0.55 | 80×1 px (rule global) |
| Decoração | grain + vignette + glowGold | pirilampos + sparkles + papel + glow-hue + (rainbow-arc se dia 7) |

### 6.9 Auto-fit no template (capa)
```js
document.fonts.ready.then(() => {
  fitToWidth(document.querySelector(".slide.capa .veu"), 860, 110);
});

function fitToWidth(el, maxWidth, minPx) {
  if (!el) return;
  const min = minPx || 90;
  let size = parseFloat(getComputedStyle(el).fontSize);
  let g = 80;
  while (el.scrollWidth > maxWidth && size > min && g-- > 0) {
    size -= 4;
    el.style.fontSize = size + "px";
  }
}
```
Equivalente exacto ao React: max 860, min 110, step 4 px, 80 iterações.

---

## 7. Slide tipo CONTEÚDO — especificação exaustiva

### 7.1 Variáveis derivadas (React)
```ts
const num = String(indice + 1).padStart(2, "0");   // "01", "02", ..., "06"
const ePoetico = slide.estilo === "poetico";
const longo = slide.texto.length > 200;
const fundoUrl = slide.fundo ?? dia.fundo;
const sombra = C.mode === "sombra";
const luz = C.mode === "luz";
// fundoClaro: em modo sombra usa o flag explícito (default false);
//             caso contrário (default/luz) defaulta a true (texto escuro).
const fundoClaro = sombra ? !!slide.fundoClaro : slide.fundoClaro ?? true;
```

### 7.2 Contentor raiz (React)
```ts
const bg = sombra
  ? `radial-gradient(ellipse 80% 70% at 50% 50%, ${C.deepWarm} 0%, ${C.deep} 100%)`
  : `radial-gradient(ellipse 80% 70% at 50% 50%, ${C.ivory} 0%, ${C.parchmentDark} 100%)`;
const txt = sombra ? C.ivory : C.ink;
<div style={{ ...slideBase, background: bg, color: txt }}>
```
- Default e modo "luz": fundo claro (ivory → parchmentDark), texto ink.
- Modo "sombra": fundo escuro (deepWarm → deep), texto ivory.

### 7.3 Ordem das camadas (React)
1. `FundoLayer` (se `fundoUrl`). Scrim `claro: fundoClaro`.
2. `<div style={sombra ? grainDarkStyle : grainStyle} />`.
3. `<div style={sombra ? vignetteDark : vignetteLight} />`.
4. `<Cantoneiras color={sombra ? C.gold : C.terracotta} />`.
   **Nota: nas capas/cta é sempre gold; aqui inverte com terracotta no modo claro.**
5. `content` wrapper (z 2).

Não há `glow` no conteúdo. Não há big number watermark.

### 7.4 Content wrapper (React)
```ts
{
  position: "relative",
  zIndex: 2,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: `${PAD}px ${PAD}px`,  // 110 px em todos os lados
  justifyContent: "space-between",
}
```

### 7.5 Cabeçalho — "meta-top"
Linha horizontal com "os sete véus" à esquerda e "NN / 06" à direita.
```ts
{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  fontWeight: 400,
  fontSize: 18,
  letterSpacing: "0.45em",
  color: "rgba(26,22,20,0.4)",     // hardcoded — ink-ish low opacity
  textTransform: "uppercase",
}
```
- Esquerda: `<span>os sete véus</span>` (herda estilo do pai).
- Direita: `<span>` com override:
  ```ts
  {
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: "italic",
    fontSize: 32,
    letterSpacing: 0,
    color: "rgba(184, 92, 56, 0.55)",  // terracotta hardcoded
    textTransform: "none",
  }
  // conteúdo: "{num} / 06"  ex: "03 / 06"
  ```

> Nota: o React faz HARDCODE da cor da meta-top (`rgba(26,22,20,0.4)`)
> e do número (`rgba(184, 92, 56, 0.55)`) em vez de usar `C.ink` e
> `C.terracotta`. Isto significa que em modo "sombra" estes valores
> ficam quase ilegíveis — é um bug conhecido OU uma escolha deliberada
> para sempre apresentar a marca no mesmo registo subtil. **Reproduzir
> como está**.

### 7.6 Corpo — "corpo" (texto principal)
Wrapper:
```ts
{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  textAlign: "center",
  gap: 44,
  padding: "0 20px",
}
```

#### 7.6.1 Estilo "poético" (`slide.estilo === "poetico"`)
- **Ornamento `~` topo**:
  ```ts
  {
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: "italic",
    fontSize: 56,
    color: C.terracotta,
    opacity: 0.7,
    lineHeight: 1,
  }
  ```
- **Texto** (`slide.texto`):
  ```ts
  {
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: 72,
    lineHeight: 1.3,
    color: C.ink,                    // hardcoded a ink — mesmo em modo sombra
    whiteSpace: "pre-line",          // respeita \n no texto
    maxWidth: 820,
    letterSpacing: "-0.005em",
  }
  ```
- **Ornamento `~` baixo**: igual ao topo.

#### 7.6.2 Estilo "prosa" (default)
- **Título pequeno** (se `slide.titulo` definido):
  ```ts
  {
    fontWeight: 500,
    fontSize: 22,
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    color: C.terracotta,
    display: "flex",
    alignItems: "center",
    gap: 24,
  }
  // conteúdo:
  //   <span style={{ height: 1, width: 64, background: C.terracotta, opacity: 0.5 }} />
  //   {slide.titulo}
  //   <span style={{ height: 1, width: 64, background: C.terracotta, opacity: 0.5 }} />
  ```
- **Texto**:
  ```ts
  {
    fontFamily: '"Cormorant Garamond", serif',
    fontWeight: 400,
    fontSize: longo ? 44 : 50,       // texto > 200 chars → 44, senão 50
    lineHeight: 1.42,
    color: C.ink,                    // hardcoded ink
    whiteSpace: "pre-line",
    maxWidth: 800,
    letterSpacing: "-0.005em",
  }
  ```

> ATENÇÃO: `color: C.ink` no texto significa que em modo sombra
> (`C.ink === "#e8dcc0"` no tema "sombra") o texto continua legível
> porque `C.ink` é redefinido no tema sombra como creme. **NÃO mudar
> para hex hardcoded**.

### 7.7 Rodapé — "meta-bot"
```ts
{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }
```
Filhos:
1. **Ornamento ◇ ◇ ◇**:
   ```ts
   {
     fontFamily: '"Cormorant Garamond", serif',
     fontStyle: "italic",
     fontSize: 24,
     color: C.terracotta,
     letterSpacing: "0.8em",
     opacity: 0.6,
   }
   // conteúdo: "◇ ◇ ◇"
   ```
2. **Marca (nome do véu)**:
   ```ts
   {
     fontWeight: 300,
     fontSize: 16,
     letterSpacing: "0.6em",
     textTransform: "uppercase",
     color: "rgba(26,22,20,0.35)",    // hardcoded como na meta-top
   }
   // conteúdo: {dia.veu.toLowerCase()}  ex: "permanência"
   ```

### 7.8 Conteúdo — variante TEMPLATE
HTML emitido (`renderConteudo`):
```html
<div class="slide conteudo ${tipo} dia-${numero} ${has-bg classes}">
  ${bgLayer(fundo)}
  ${decor({ density: "media" })}                      <!-- 9 fireflies + 6 sparkles -->
  <div class="content">
    <div class="meta-top">
      <span>os sete véus</span>
      <span class="num">${num} / 06</span>
      <span>${dia.romano}</span>                       <!-- TERCEIRO span - DIFERENTE -->
    </div>
    <div class="corpo">
      ${ornamentTop}                                    <!-- só se poético -->
      ${titulo}                                         <!-- só se prosa + titulo -->
      <div class="texto ${longo}">${nl2br(slide.texto)}</div>
      ${ornamentBot}
    </div>
    <div class="meta-bot">
      <span class="ornament">✦ &nbsp; ✧ &nbsp; ✦</span>  <!-- DIFERENTE do React ◇ -->
      <span class="marca">${dia.veu.toLowerCase()}</span>
    </div>
  </div>
</div>
```

CSS-key:
```css
.slide.conteudo {
  background:
    radial-gradient(ellipse 78% 65% at 50% 50%, color-mix(in srgb, var(--hue) 22%, var(--ivory)) 0%, var(--ivory) 75%),
    var(--ivory);
  color: var(--ink);
}
.slide.conteudo .content { justify-content: space-between; padding-top: 110px; padding-bottom: 110px; }
.slide.conteudo .meta-top {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
  font-family: 'Inter', sans-serif; font-weight: 500; font-size: 18px;
  letter-spacing: 0.45em;
  color: color-mix(in srgb, var(--hue-deep) 70%, var(--ink));
  text-transform: uppercase; opacity: 0.85;
}
.slide.conteudo .meta-top .num {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500;
  font-size: 32px; letter-spacing: 0; color: var(--terracotta);
  text-transform: none; opacity: 0.9;
}
.slide.conteudo .corpo {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; width: 100%;
  text-align: center; gap: 44px; padding: 0 20px;
}
.slide.conteudo.poetico .corpo .ornament {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 56px;
  color: color-mix(in srgb, var(--hue-deep) 90%, var(--terracotta));
  opacity: 0.7; line-height: 1;
}
.slide.conteudo.poetico .texto {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400;
  font-size: 72px; line-height: 1.3; color: var(--ink);
  white-space: pre-line; max-width: 820px; letter-spacing: -0.005em;
}
.slide.conteudo.prosa .titulo-pequeno {
  font-family: 'Inter', sans-serif; font-weight: 600; font-size: 22px;
  letter-spacing: 0.4em; text-transform: uppercase;
  color: color-mix(in srgb, var(--hue-deep) 80%, var(--terracotta));
  display: flex; align-items: center; gap: 24px;
}
.slide.conteudo.prosa .titulo-pequeno::before,
.slide.conteudo.prosa .titulo-pequeno::after {
  content: ""; height: 1px; width: 64px;
  background: color-mix(in srgb, var(--hue-deep) 70%, var(--terracotta));
  opacity: 0.55;
}
.slide.conteudo.prosa .texto {
  font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 50px;
  line-height: 1.42; color: var(--ink);
  white-space: pre-line; max-width: 800px; letter-spacing: -0.005em;
}
.slide.conteudo.prosa .texto.longo { font-size: 44px; }
.slide.conteudo .meta-bot { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.slide.conteudo .meta-bot .ornament {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 24px;
  color: color-mix(in srgb, var(--hue-deep) 80%, var(--terracotta));
  letter-spacing: 0.8em; opacity: 0.7;
}
.slide.conteudo .meta-bot .marca {
  font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px;
  letter-spacing: 0.6em; text-transform: uppercase;
  color: color-mix(in srgb, var(--hue-deep) 60%, var(--ink));
  opacity: 0.8;
}
```

### Diferenças conteúdo: React vs template
| Aspecto | React | Template |
|---|---|---|
| Cantoneiras | Sim (terracotta no claro / gold no sombra) | Não |
| Meta-top tem | "os sete véus" + "NN / 06" | "os sete véus" + "NN / 06" + romano |
| Meta-top fontWeight | 400 | 500 |
| Meta-top color | `rgba(26,22,20,0.4)` (hardcoded) | `color-mix(--hue-deep 70%, --ink)` |
| Título prosa fontWeight | 500 | 600 |
| Título prosa, linhas laterais | inline spans 64×1 px | `::before`/`::after` 64×1 px |
| Ornament rodapé | ◇ ◇ ◇ | ✦ &nbsp; ✧ &nbsp; ✦ |
| Pirilampos/sparkles | Não | Sim (density "media": 9 + 6) |
| Texto longo threshold | 200 chars (44 vs 50 px) | `slide.texto.length > 200` igual |

---

## 8. Slide tipo CTA — especificação exaustiva

### 8.1 Contentor raiz (React)
```ts
const luz = C.mode === "luz";
const bg = luz
  ? `radial-gradient(ellipse 70% 60% at 50% 50%, ${C.ivory} 0%, ${C.parchmentDark} 80%)`
  : `radial-gradient(ellipse 70% 60% at 50% 50%, ${C.deepWarm} 0%, ${C.deep} 80%)`;
const txt = luz ? C.ink : C.ivory;
```
Default/sombra: escuro. Luz: claro.

### 8.2 Ordem das camadas (React)
1. `FundoLayer` (se `fundoUrl = slide.fundo`). Scrim `claro: luz || slide.fundoClaro`.
2. `<div style={luz ? grainStyle : grainDarkStyle} />`.
3. `<div style={luz ? vignetteLight : vignetteDark} />`.
4. `<div style={glowTerra} />` (centro baixo, terracotta 10%).
5. `<Cantoneiras color={C.gold} />`.
6. **Espiral watermark** (emoji 🌀, U+1F300):
   ```ts
   {
     position: "absolute",
     bottom: -120,
     right: -120,
     fontSize: 600,
     lineHeight: 1,
     color: C.gold,
     opacity: 0.04,
     zIndex: 1,
     userSelect: "none",
   }
   ```
   Sai parcialmente fora do canvas (bottom/right negativos −120 px).
7. `content` wrapper (z 2).

### 8.3 Content wrapper (React)
```ts
{
  position: "relative",
  zIndex: 2,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: `180px ${PAD}px 180px`,   // 180/110/180/110
  alignItems: "center",
  justifyContent: "space-between",
}
```

### 8.4 Bloco superior — anel do ícone
```ts
{
  position: "relative",
  width: 220,
  height: 220,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}
```
Filhos:
1. **Anel externo**:
   ```ts
   {
     position: "absolute",
     inset: 0,
     borderRadius: "50%",
     border: `1px solid ${C.gold}`,
     opacity: 0.35,
   }
   ```
2. **Anel interno** (16 px dentro do externo):
   ```ts
   {
     position: "absolute",
     inset: 16,
     borderRadius: "50%",
     border: `1px solid ${C.gold}`,
     opacity: 0.18,
   }
   ```
3. **Ícone**: `<span style={{ fontSize: 96, lineHeight: 1 }}>{slide.icone}</span>`.

### 8.5 Bloco do meio — recurso + descrição
Wrapper:
```ts
{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center", maxWidth: 800 }
```
Filhos:
1. **Nome do recurso** (`slide.recurso`):
   ```ts
   {
     fontFamily: '"Cormorant Garamond", serif',
     fontStyle: "italic",
     fontWeight: 400,
     fontSize: 78,            // ajustado por auto-fit
     lineHeight: 1.1,
     letterSpacing: "-0.01em",
     whiteSpace: "nowrap",
   }
   ```
2. **Descrição** (`slide.descricao`):
   ```ts
   {
     fontFamily: '"Cormorant Garamond", serif',
     fontWeight: 400,
     fontSize: 38,
     lineHeight: 1.45,
     color: C.mist,
     maxWidth: 720,
   }
   ```

### 8.6 Bloco inferior — URL com linhas
Wrapper:
```ts
{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", maxWidth: 720 }
```
Filhos (por ordem vertical):
1. **Linha gold superior**: `<span style={{ width: "100%", height: 1, background: C.gold, opacity: 0.55 }} />`.
2. **URL** (`slide.url`):
   ```ts
   {
     fontFamily: '"JetBrains Mono", "Inter", monospace',
     fontWeight: 400,
     fontSize: 30,
     color: C.terracotta,
     letterSpacing: "0.04em",
   }
   ```
3. **Linha gold inferior**: igual à superior.

### 8.7 Auto-fit do recurso (React)
```ts
useEffect(() => {
  const el = recursoRef.current;
  if (!el) return;
  const apply = () => {
    const max = 820;
    let size = 78;
    el.style.fontSize = `${size}px`;
    let g = 60;
    while (el.scrollWidth > max && size > 50 && g-- > 0) {
      size -= 2;
      el.style.fontSize = `${size}px`;
    }
  };
  if (document.fonts?.ready) document.fonts.ready.then(apply);
  else apply();
}, [slide.recurso]);
```
Regras: começa em **78 px**, reduz **2 px de cada vez**, mínimo
**50 px**, máximo **60 iterações**, máximo de largura **820 px**.

### 8.8 CTA — variante TEMPLATE
HTML (`renderCta`):
```html
<div class="slide cta dia-${numero} ${has-bg classes}">
  ${bgLayer(fundo)}
  ${decor({ rainbowArc: isDia7, rainbowStrip: !isDia7, density: "alta" })}
  <div class="espiral-bg">🌀</div>
  <div class="content">
    <div class="icon-ring"><span class="icone">${slide.icone}</span></div>
    <div class="corpo">
      <div class="recurso">${slide.recurso}</div>
      <div class="descricao">${slide.descricao}</div>
    </div>
    <div class="url-block">
      <span class="rule"></span>
      <span class="url">${slide.url}</span>
      <span class="rule"></span>
    </div>
  </div>
</div>
```

CSS-key:
```css
.slide.cta {
  background:
    radial-gradient(ellipse 70% 55% at 50% 45%, color-mix(in srgb, var(--hue) 55%, var(--ivory)) 0%, var(--ivory) 75%),
    radial-gradient(ellipse 90% 60% at 50% 100%, color-mix(in srgb, var(--hue-deep) 28%, var(--ivory)) 0%, var(--ivory) 70%),
    var(--ivory);
  color: var(--ink);
}
.slide.cta .content { justify-content: space-between; align-items: center; padding-top: 200px; padding-bottom: 180px; }

.slide.cta .icon-ring {
  position: relative; width: 220px; height: 220px;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, color-mix(in srgb, var(--gold-glow) 60%, transparent) 0%, transparent 70%);
}
.slide.cta .icon-ring::before,
.slide.cta .icon-ring::after {
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--hue-deep) 60%, var(--gold));
  opacity: 0.6;
}
.slide.cta .icon-ring::after { inset: 16px; border-style: dashed; opacity: 0.35; }
.slide.cta .icone {
  font-size: 96px; line-height: 1;
  filter: drop-shadow(0 0 12px color-mix(in srgb, var(--gold-glow) 50%, transparent));
}
.slide.cta .corpo { display: flex; flex-direction: column; align-items: center; gap: 28px; text-align: center; max-width: 800px; }
.slide.cta .recurso {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400;
  font-size: 78px; line-height: 1.1; color: var(--ink); letter-spacing: -0.01em;
}
.slide.cta .descricao {
  font-family: 'Cormorant Garamond', serif; font-weight: 400;
  font-size: 38px; line-height: 1.45;
  color: color-mix(in srgb, var(--ink) 78%, transparent);
  max-width: 720px;
}
.slide.cta .url-block { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; max-width: 720px; }
.slide.cta .url-block .rule { width: 100%; height: 1px; }
.slide.cta .url {
  font-family: 'JetBrains Mono', 'Inter', monospace;
  font-weight: 500; font-size: 30px; color: var(--terracotta); letter-spacing: 0.04em;
}
.slide.cta .espiral-bg {
  position: absolute; bottom: -120px; right: -120px;
  font-size: 600px; line-height: 1; color: var(--hue-deep);
  opacity: 0.08; z-index: 1; user-select: none;
}
```

### Diferenças CTA: React vs template
| Aspecto | React | Template |
|---|---|---|
| Fundo default | Escuro | Claro (ivory + hue) |
| Cantoneiras | Sim, gold | Não |
| Anel externo | 1 px solid gold @0.35 | 1.5 px solid color-mix(hue-deep, gold) @0.6 |
| Anel interno | 1 px solid gold @0.18 | 1.5 px **dashed** color-mix(hue-deep, gold) @0.35 |
| Glow do icon-ring | Não | `radial-gradient(circle, color-mix(gold-glow 60%), transparent)` |
| Ícone | fontSize 96, sem filtro | fontSize 96, com `filter: drop-shadow(0 0 12px gold-glow@50%)` |
| Espiral 🌀 cor | C.gold | `var(--hue-deep)` |
| Espiral opacity | 0.04 | 0.08 |
| Espiral fontSize | 600 px | 600 px |
| Recurso fontWeight | 400 | 400 |
| Descrição color | C.mist | `color-mix(--ink 78%, transparent)` |
| URL fontWeight | 400 | 500 |
| URL color | C.terracotta | `var(--terracotta)` |
| Pirilampos/sparkles | Não | Sim (density "alta": 15 + 10) |
| Arco-íris | Não | Sim — dia 7 → `rainbow-arc`, outros → `rainbow-strip` top+bot |
| Padding | 180/110/180/110 | 200 top / 180 bottom |

---

## 9. Decoração "luz" do template (pirilampos, sparkles, arco-íris)

### 9.1 Função `decor`
```js
function decor({ rainbowArc = false, rainbowStrip = false, density = "alta" } = {}) {
  const firefliesQtd = density === "alta" ? 15 : density === "media" ? 9 : 5;
  const sparklesQtd  = density === "alta" ? 10 : density === "media" ? 6 : 3;
  const sizes        = ["", "small", "tiny", "small", "", "tiny", "small", "", "tiny", "small", "", "tiny", "small", "", "tiny"];
  const sparkleSizes = ["", "small", "tiny", "", "small", "", "tiny", "small", "", "tiny"];
  // injecta na ordem: rainbow-arc → rainbow-strip top/bot → glow-hue → paper → vignette-light → fireflies → stars
}
```

Densidades usadas:
- **capa**: `density: "alta"` (15 fireflies + 10 sparkles) + `rainbowArc` se dia 7.
- **conteudo**: `density: "media"` (9 + 6).
- **cta**: `density: "alta"` (15 + 10) + arco-íris (arc se dia 7, strip senão).

### 9.2 Pirilampos
```css
.fireflies { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.firefly {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #fffaeb;
  box-shadow:
    0 0 10px 3px rgba(247, 222, 148, 0.95),
    0 0 28px 8px rgba(247, 222, 148, 0.55),
    0 0 64px 18px rgba(247, 222, 148, 0.22);
}
.firefly.small {
  width: 4px; height: 4px;
  background: #fff5d6;
  box-shadow:
    0 0 7px 2px rgba(247, 222, 148, 0.85),
    0 0 20px 5px rgba(247, 222, 148, 0.42),
    0 0 44px 12px rgba(247, 222, 148, 0.16);
}
.firefly.tiny {
  width: 3px; height: 3px;
  background: #fff0c8;
  box-shadow:
    0 0 5px 1px rgba(247, 222, 148, 0.75),
    0 0 14px 3px rgba(247, 222, 148, 0.32);
}
```
Posicionamento absoluto por `nth-child` (1 a 15):
```css
.fireflies .firefly:nth-child(1)  { top: 11%; left: 14%; }
.fireflies .firefly:nth-child(2)  { top: 7%;  right: 18%; }
.fireflies .firefly:nth-child(3)  { top: 22%; left: 7%; }
.fireflies .firefly:nth-child(4)  { top: 28%; right: 11%; }
.fireflies .firefly:nth-child(5)  { top: 40%; left: 11%; }
.fireflies .firefly:nth-child(6)  { top: 44%; right: 7%; }
.fireflies .firefly:nth-child(7)  { top: 56%; left: 17%; }
.fireflies .firefly:nth-child(8)  { top: 61%; right: 21%; }
.fireflies .firefly:nth-child(9)  { top: 72%; left: 8%; }
.fireflies .firefly:nth-child(10) { top: 76%; right: 14%; }
.fireflies .firefly:nth-child(11) { top: 86%; left: 22%; }
.fireflies .firefly:nth-child(12) { top: 91%; right: 24%; }
.fireflies .firefly:nth-child(13) { top: 33%; left: 48%; }
.fireflies .firefly:nth-child(14) { top: 67%; left: 52%; }
.fireflies .firefly:nth-child(15) { top: 82%; left: 44%; }
```
Ordem dos tamanhos por índice (array `sizes`):
`["", "small", "tiny", "small", "", "tiny", "small", "", "tiny", "small", "", "tiny", "small", "", "tiny"]`
ou seja indices 1,5,8,11,14 são grandes (sem class), 2,4,7,10,13 são "small",
3,6,9,12,15 são "tiny".

### 9.3 Sparkles (estrelas 8-pontas)
```css
.stars { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.sparkle {
  position: absolute;
  width: 16px; height: 16px;
  opacity: 0.85;
}
.sparkle::before {
  content: "";
  position: absolute; inset: 0;
  background: var(--gold-glow);
  clip-path: polygon(50% 0%, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0% 50%, 44% 44%);
}
.sparkle::after {
  content: "";
  position: absolute; inset: -10px;
  background: radial-gradient(circle, color-mix(in srgb, var(--gold-glow) 80%, transparent) 0%, transparent 65%);
  opacity: 0.55;
  filter: blur(5px);
}
.sparkle.hue::before { background: color-mix(in srgb, var(--hue-deep) 70%, var(--gold-glow)); }
.sparkle.small  { width: 11px; height: 11px; opacity: 0.7; }
.sparkle.small::after { inset: -7px; }
.sparkle.tiny   { width: 7px;  height: 7px;  opacity: 0.6; }
.sparkle.tiny::after  { inset: -4px; }
```
Posições por `nth-child`:
```css
.stars .sparkle:nth-child(1)  { top: 16%; right: 12%; }
.stars .sparkle:nth-child(2)  { top: 24%; left: 18%; }
.stars .sparkle:nth-child(3)  { top: 35%; right: 26%; }
.stars .sparkle:nth-child(4)  { top: 48%; left: 24%; }
.stars .sparkle:nth-child(5)  { top: 58%; right: 18%; }
.stars .sparkle:nth-child(6)  { top: 70%; left: 28%; }
.stars .sparkle:nth-child(7)  { top: 80%; right: 28%; }
.stars .sparkle:nth-child(8)  { top: 88%; left: 16%; }
.stars .sparkle:nth-child(9)  { top: 12%; left: 38%; }
.stars .sparkle:nth-child(10) { top: 92%; right: 42%; }
```
Array `sparkleSizes`:
`["", "small", "tiny", "", "small", "", "tiny", "small", "", "tiny"]`.

### 9.4 Arco-íris (dia 7 ou CTA)
```css
.rainbow-arc {
  position: absolute;
  top: -80px; left: 50%;
  width: 1080px; height: 540px;
  transform: translateX(-50%);
  border-radius: 50% / 100% 100% 0 0;
  background:
    radial-gradient(ellipse 100% 100% at 50% 100%,
      transparent 0%, transparent 62%,
      rgba(216, 196, 232, 0.42) 62%, rgba(216, 196, 232, 0.42) 65%,
      rgba(190, 218, 238, 0.42) 65%, rgba(190, 218, 238, 0.42) 68%,
      rgba(184, 220, 200, 0.42) 68%, rgba(184, 220, 200, 0.42) 71%,
      rgba(205, 224, 182, 0.42) 71%, rgba(205, 224, 182, 0.42) 74%,
      rgba(240, 200, 144, 0.42) 74%, rgba(240, 200, 144, 0.42) 77%,
      rgba(245, 184, 168, 0.42) 77%, rgba(245, 184, 168, 0.42) 80%,
      transparent 80%);
  pointer-events: none;
  z-index: 1;
  opacity: 0.85;
  filter: blur(0.6px);
}
.rainbow-strip {
  position: absolute;
  left: 0; right: 0; height: 6px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(245, 184, 168, 0.7) 12%,
    rgba(240, 200, 144, 0.7) 28%,
    rgba(205, 224, 182, 0.7) 44%,
    rgba(184, 220, 200, 0.7) 60%,
    rgba(190, 218, 238, 0.7) 76%,
    rgba(216, 196, 232, 0.7) 92%,
    transparent 100%);
  z-index: 3;
  pointer-events: none;
}
.rainbow-strip.top { top: 0; }
.rainbow-strip.bot { bottom: 0; }
.slide.dia-7.capa .rainbow-arc,
.slide.dia-7.cta  .rainbow-arc { opacity: 0.95; }
```
Ordem das cores (lavender → sky → mint → sage → amber → rose), 7 faixas
de 3% cada entre 62% e 80% do raio.

---

## 10. Mapeamento entre tipos de dados e renderers

### 10.1 Slide types (resumo)
- **capa**: campos esperados → `tipo: "capa"`, `linha1`, `linha2`,
  opcional `fundo`, `fundoClaro`.
- **conteudo**: `tipo: "conteudo"`, `texto`, opcional `titulo` (só prosa),
  `estilo: "poetico" | "prosa"`, opcional `fundo`, `fundoClaro`.
- **cta**: `tipo: "cta"`, `recurso`, `descricao`, `url`, `icone` (emoji),
  opcional `fundo`, `fundoClaro`.

### 10.2 Dia (resumo)
- `numero` (1 a 7) — usado para watermark da capa e classe `.dia-N` no template.
- `romano` (string romana) — usado pelo template em `romano-rule` e meta-top.
  **NÃO usado pelo React** (a capa React não mostra romano).
- `veu` (nome do véu, ex: "Permanência") — título da capa e marca do rodapé do conteúdo.
- `subtitulo` — subtítulo da capa.
- `fundo`, `fundoClaro`, `decoracao` — propriedades de fundo MJ herdadas pelos slides.

### 10.3 Tabela de presenças por elemento (React)
| Elemento | Capa | Conteúdo | CTA |
|---|---|---|---|
| FundoLayer (img + scrim) | sim (se fundo) | sim (se fundo) | sim (se fundo) |
| Grain | sim | sim | sim |
| Vignette | sim | sim | sim |
| Glow (gold/terra) | gold | não | terra |
| Big number watermark | sim (720 px) | não | não |
| Espiral watermark | não | não | sim (600 px, bottom-right) |
| Cantoneiras | sim (gold) | sim (terra/gold) | sim (gold) |
| VeusAsLevantar | sim (top, dir "down") | não | não |
| Ornamento ◇ ◇ ◇ | sim (entre título e subtítulo) | sim (rodapé) | não |
| Ornamento ~ | não | sim (poético, top+bot) | não |
| Linha horizontal gold | sim (rodapé, 80 px) | não | sim (URL block, 100%) |
| "os sete véus" marca | sim (rodapé) | sim (header) | não |
| Nome do véu lowercase | não | sim (rodapé) | não |
| "NN / 06" | não | sim (header dir.) | não |
| Romano | não | não (apenas template) | não |
| URL JetBrains Mono | não | não | sim |
| Anel duplo | não | não | sim (220 px) |

---

## 11. Conteúdo do `#SLIDE_DATA` no template

O template lê de `window.SLIDE_DATA` (injectado pelo Puppeteer antes do
screenshot):
```ts
window.SLIDE_DATA = {
  dia: { numero, romano, veu, subtitulo, fundo?, fundoClaro?, decoracao? },
  slide: { tipo, ...campos específicos },
  indiceSlide: number,   // 0-based índice do slide dentro do dia
};
```
A função `render(data)` selecciona `renderCapa | renderConteudo | renderCta`,
escreve em `#root.innerHTML`, e (para capa e cta) corre `fitToWidth`
após `document.fonts.ready`.

---

## 12. Checklist de fidelidade visual (para a migração `viviannepag`)

Para garantir que o slide migrado é pixel-idêntico, validar:

### 12.1 Geral
- [ ] Canvas 1080×1920, overflow hidden, box-sizing border-box global.
- [ ] Fontes carregadas com `display=block` antes do screenshot.
- [ ] `font-feature-settings: "liga","kern","dlig"`.
- [ ] `-webkit-font-smoothing: antialiased`.
- [ ] `text-rendering: geometricPrecision`.

### 12.2 Capa
- [ ] Padding `150px 110px 200px` (React) ou `160px 110px 200px` (template).
- [ ] Big number watermark `dia.numero` em Cormorant italic 720 px,
  top 280, color gold@0.05 (ou hue-deep@14% no template).
- [ ] VeusAsLevantar 3 linhas 320/200/100 px gold @0.65/0.45/0.28
  (React apenas).
- [ ] Título do véu Cormorant 180 px, lineHeight 0.95, letterSpacing
  −0.025em, fontWeight 300 (React) ou 400 (template).
- [ ] Auto-fit: 180 → 110 px, step 4, max width 860.
- [ ] Ornament `◇ ◇ ◇` (React) ou `✦ &nbsp; ✧ &nbsp; ✦` (template)
  Cormorant italic 28/30 px, letterSpacing 1.2em, opacity 0.8/0.9.
- [ ] Subtítulo Cormorant italic 38 px, lineHeight 1.35, color C.mist,
  maxWidth 720.
- [ ] Abertura (linha1 + linha2) Cormorant italic 56 px, lineHeight 1.4,
  maxWidth 820, separados por `<br/>`.
- [ ] Rodapé: linha 80×1 gold@0.55 + "os sete véus" Inter 18 px
  letterSpacing 0.6em UPPERCASE, color gold (React) / hue-deep mix (template).
- [ ] Cantoneiras gold 4 cantos, ARM 56 INSET 60 stroke 1 opacity 0.55
  (apenas React).

### 12.3 Conteúdo
- [ ] Padding 110 px em todos os lados.
- [ ] Meta-top: "os sete véus" Inter 18 letterSpacing 0.45em UPPERCASE,
  + "NN / 06" Cormorant italic 32 (terracotta@0.55). Template adiciona
  romano à direita.
- [ ] Poético: ornament `~` topo e baixo Cormorant italic 56 px
  terracotta@0.7.
- [ ] Poético: texto Cormorant italic 72 px lineHeight 1.3 maxWidth 820
  whiteSpace pre-line.
- [ ] Prosa: título pequeno Inter 22 letterSpacing 0.4em UPPERCASE,
  fontWeight 500 (React) / 600 (template), linhas laterais 64×1 px@0.5.
- [ ] Prosa: texto Cormorant 50 px (44 se >200 chars) lineHeight 1.42
  maxWidth 800.
- [ ] Rodapé: ornament `◇ ◇ ◇` (React) / `✦ ✧ ✦` (template)
  Cormorant italic 24 px terracotta letterSpacing 0.8em opacity 0.6/0.7.
- [ ] Rodapé marca: `dia.veu.toLowerCase()` Inter 16 letterSpacing 0.6em
  UPPERCASE opacity 0.35 (React) / hue-deep mix (template).
- [ ] Cantoneiras terracotta (modo claro) ou gold (modo sombra) (React).

### 12.4 CTA
- [ ] Padding 180 px top+bottom, 110 px lados (React); 200/180 (template).
- [ ] Espiral 🌀 fontSize 600, bottom −120 right −120, color gold@0.04
  (React) / hue-deep@0.08 (template).
- [ ] Anel: container 220×220 px, anel externo border 1 gold@0.35,
  anel interno inset 16 border 1 gold@0.18 (React) ou dashed 1.5 com
  drop-shadow no ícone (template).
- [ ] Ícone fontSize 96, lineHeight 1.
- [ ] Recurso Cormorant italic 78 px lineHeight 1.1 letterSpacing −0.01em
  whiteSpace nowrap. Auto-fit 78 → 50, step 2, max 820.
- [ ] Descrição Cormorant 38 px lineHeight 1.45 color C.mist maxWidth 720.
- [ ] URL block: linha 100%×1 gold@0.55 + URL JetBrains Mono 30 px
  color terracotta letterSpacing 0.04em + linha 100%×1 gold@0.55.
  gap 14 px. fontWeight 400 (React) / 500 (template).
- [ ] Cantoneiras gold (React).
- [ ] Glow terracotta centro 60% (React).

### 12.5 Fundo MJ (se aplicável)
- [ ] React: scrim radial — claro → ivory(245,234,213) 94→62%;
  escuro → dark(15,12,10) 68→92%.
- [ ] Template: scrim linear top→bottom 5 stops; variante `.luz`
  com ivory(253,248,237).
- [ ] React: textShadow no título da capa quando há fundoUrl.
- [ ] Template: textShadow em todos os textos quando `.has-bg`.
- [ ] Template: `ghost-num` escondido, decoração escondida (excepto `.decor`).

---

## 13. Notas finais — o que diferencia o "aspecto correcto"

1. **A capa NÃO é só texto**: tem `VeusAsLevantar` (3 hair-lines gold no
   topo), `◇ ◇ ◇` debaixo do título, big number 720 px atrás de tudo,
   cantoneiras nos 4 cantos, linha gold 80 px no rodapé. Sem estes
   elementos parece "limpa demais" e não é a capa do projecto.
2. **As cantoneiras são exclusivas do React**: se a migração for para
   replicar o template, NÃO as adicionar; se for para replicar o
   admin/preview, são obrigatórias.
3. **A meta-top do conteúdo** tem dois (React) ou três (template) spans
   numa linha justify-between. O React tem hardcode da cor
   (`rgba(26,22,20,0.4)` para a marca, `rgba(184,92,56,0.55)` para o
   número). É essencial preservar este tom subtil.
4. **CTA**: o anel duplo (anel externo + anel inset 16) com 220×220 px
   é a peça de identidade do CTA. A espiral 🌀 atrás (bottom −120, right
   −120, 600 px) cria a sensação de fluxo. Sem estas duas peças a CTA
   parece um cartão genérico.
5. **`whiteSpace: nowrap` no título da capa e no recurso da CTA** é a
   razão de existir auto-fit. Texto longo NÃO quebra, encolhe.
6. **`whiteSpace: pre-line` no texto do conteúdo** respeita `\n` no
   conteúdo Markdown. Manter.
7. **Os hardcodes de cor no React** (rgba 26,22,20 / 184,92,56 /
   201,169,97 / 15,12,10 / 245,234,213) NÃO devem ser substituídos por
   vars do tema. São deliberados para preservar o registo visual
   independentemente do tema escolhido. (O template usa color-mix com
   `--hue-deep`, que é a abordagem oposta — mas é uma escolha diferente
   feita para a versão "luz".)
8. **fontFeatureSettings, fontSmoothing, textRendering**: omitir estes
   produz texto visivelmente menos definido em PNG. Não ignorar.
9. **Auto-fit sempre depois de `document.fonts.ready`**: medir antes
   das fontes carregarem dá `scrollWidth` errado.
10. **Z-index correcto**: img(0) → scrim(1) → glow/grain/vignette
    (sem z-index explícito, mas vêm depois) → cantoneiras(3) → big
    number(1) → content(2). Se trocar a ordem, o glow tapa as
    cantoneiras ou o content fica atrás do scrim.

---

Fim do documento. Para qualquer detalhe ausente, a fonte canónica é
`Slide.tsx` (visual do admin) ou `template.html` + `styles.css`
(visual do PNG exportado). Em caso de divergência, a Vivianne escolhe
qual replicar conforme o destino do slide (preview interno vs PNG
publicado).
