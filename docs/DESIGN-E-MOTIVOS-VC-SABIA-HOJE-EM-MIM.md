# Design & Motivos Diários — Apêndice ao PIPELINE

Detalhes finais que faltavam ao mapa: paletas, fontes, tamanhos, sinais, e os 7 motivos rotativos do Hoje, em Mim.

---

## 1. Hoje, em Mim — Rotação por dia da semana

Cada dia tem um **kicker + glifo + label + moods de áudio** próprios. Forma a "voz semanal" do diário.

| Dia | Kicker | Glifo | Label editorial | Moods áudio (em ordem de preferência) |
|---|---|---|---|---|
| **Segunda** | `olha hoje` | `✶` | Convite a olhar para dentro | grilos-tropicais · brisa-bambu · lareira-respira |
| **Terça** | `hoje agradeço` | `☉` | Gratidão | lareira-respira · sussurro-coro-feminino · grilos-tropicais |
| **Quarta** | `solto hoje` | `◌` | Soltar | chuva-fina-no-telhado · mare-noturna · brisa-bambu |
| **Quinta** | `hoje aprendi` | `〜` | O que aprendi | tigela-grave · sussurro-coro-feminino · coruja-distante |
| **Sexta** | `celebro hoje` | `♢` | Celebrar o caminho | tambor-lento-distante · lareira-respira · grilos-tropicais |
| **Sábado** | `hoje, no corpo` | `◯` | Ritual do corpo | coruja-distante · brisa-bambu · tigela-grave |
| **Domingo** | `amanhã, escolho` | `→` | Intenção para amanhã | lua-sobre-agua · sussurro-coro-feminino · mare-noturna |

### Dias especiais (sobrepõem o weekday)

Detecção em `detectDiaEspecial(iso)` com prioridade: `fim_ano > inicio_ano > fim_mes > inicio_mes`.

| Especial | Kicker | Glifo | Label | Moods |
|---|---|---|---|---|
| `fim_ano` (31 Dez) | `fecho deste ano` | `❋` | Fecho do ano | tigela-grave · sussurro-coro-feminino · tambor-lento-distante |
| `inicio_ano` (1 Jan) | `abro este ano` | `✧` | Início de ano | sussurro-coro-feminino · lua-sobre-agua · tambor-lento-distante |
| `fim_mes` (último dia) | `fecho deste mês` | `✦` | Fecho de ciclo do mês | tigela-grave · sussurro-coro-feminino · mare-noturna |
| `inicio_mes` (dia 1) | `começo deste mês` | `◐` | Início de novo ciclo | lua-sobre-agua · brisa-bambu · sussurro-coro-feminino |

### 10 Moods nocturnos disponíveis
`grilos-tropicais` · `brisa-bambu` · `chuva-fina-no-telhado` · `lareira-respira` · `lua-sobre-agua` · `coruja-distante` · `tigela-grave` · `mare-noturna` · `tambor-lento-distante` · `sussurro-coro-feminino`

URLs em `course-assets/hoje-em-mim-audios/<mood>/<file>.mp3` — o mood é extraído do path automaticamente.

---

## 2. Hoje, em Mim — Paletas (6 presets do overlay)

Definidas em `lib/hoje-em-mim/themes.ts`. Cada uma harmoniza overlay (cobre/creme/indigo) + grading FFmpeg do motion.

| ID | Label | Highlight (arco/kicker/glifo) | Text (frase) | BG (vignette) | Quando usar |
|---|---|---|---|---|---|
| `carta-noturna` ★ default | Cobre + indigo (escuro e quente) | `rgb(194, 143, 96)` | `rgb(242, 233, 216)` | `rgb(14, 8, 32)` | Look original — motions noturnos azuis/roxos |
| `luar-prata` | Luar Prata | `rgb(204, 204, 220)` | `rgb(248, 244, 236)` | `rgb(20, 24, 38)` | Água, vidro, luar, neve, cenas frias |
| `dourado-luminoso` | Dourado Luminoso | `rgb(212, 168, 83)` | `rgb(250, 244, 224)` | `rgb(26, 14, 5)` | Velas, lume, lanternas, cenas amarelas-quentes |
| `rosa-incenso` | Rosa Incenso | `rgb(212, 151, 124)` | `rgb(245, 235, 216)` | `rgb(31, 15, 26)` | Jasmim, flores, peles, cenas íntimas quentes |
| `branco-puro` | Branco Puro | `rgb(232, 229, 221)` | `rgb(255, 255, 255)` | `rgb(10, 10, 20)` | Fundos muito escuros/brilhantes onde cobre desaparece |
| `verde-musgo` | Verde Musgo | `rgb(168, 175, 122)` | `rgb(245, 240, 220)` | `rgb(14, 22, 18)` | Vegetação, floresta, bambu, plantas tropicais |

Cada paleta inclui também:
- `highlightSoft` = highlight com 55% alpha (cantoneira + scrim do arco + footer)
- `ffmpegEq` = `brightness:saturation:contrast:gamma` aplicado ao motion antes de compor

---

## 3. Hoje, em Mim — Tipografia & tamanhos (overlay 1080×1920)

**Fonte única em todo o overlay:** Cormorant Garamond (Regular + Italic), embebida em base64 no SVG. Ficheiros em `assets/fonts/cormorant/CormorantGaramond-{Italic,Regular}.ttf`.

| Elemento | Fonte | Tamanho (px) | Letter-spacing | Cor |
|---|---|---|---|---|
| Dia vertical (ex. `segunda`) | Cormorant Regular | 29 | 12 | highlight (cobre) |
| Frase central (italic) | Cormorant Italic | **dinâmico (52-76)** ★ | — | text (creme) |
| Kicker (ex. `olha hoje`) | Cormorant Italic | 36 | — | highlight (cobre) |
| Glifo (ex. `✶`) | Cormorant Regular | 48 | — | highlight (cobre) |
| `SETEVEUS.SPACE` | Cormorant Regular | 24 | 8 | highlightSoft (cobre 55% alpha) |

### ★ Tamanho da frase adapta-se ao nº de linhas (wrap a 22 chars)

| Linhas | Font size |
|---|---|
| 1 | 76 |
| 2 | 70 |
| 3 | 64 |
| 4 | 60 |
| 5 | 56 |
| 6+ | 52 |

Line-height = `fraseFontSize × 1.42` em todos os casos. Texto centrado vertical em `y=1014`.

### Estrutura do frame

```
─── 1080 px wide ──────────────────────
│                                     │
│         segunda            (y=507)  │  ← dia em letras pequenas, espaçado
│                                     │
│        ╭──────────╮                 │  ← arco curvo cobre que abraça
│       /            \                │     a frase (path SVG)
│      /              \               │
│     │   frase em    │  (y=~1014)    │  ← frase central, italic, dinâmica
│     │   cormorant   │               │
│     │    italic     │               │
│      \    (52-76)  /                │
│       \           /                 │
│        ╰─────────╯                  │
│                                     │
│       ✶  olha hoje        (sigGlifoY)│  ← glifo + kicker juntos
│                                     │
│       SETEVEUS.SPACE     (seteveusY)│  ← assinatura discreta
│                                     │
─── 1920 px tall ──────────────────────
```

Arco SVG: `M 220 1098 L 220 459 A 320 320 0 0 1 860 459 L 860 1098`

---

## 4. VC Sabia — Design (overlay 1080×1920)

Definido em `lib/vc-sabia/design.ts` + `tools/render-vc-sabia/render.mjs`.

### Cores default

| Token | Valor | Onde |
|---|---|---|
| `cardBg` | `#140F1E` | Fundo do card (vidro fosco) |
| `cardBgOpacity` | `0.14` | Transparência do card |
| `cardBorder` | `#C9A96E` | Moldura dourada |
| `cornerColor` | `#D4AF37` | 4 cantoneiras L-shaped |
| `kickerColor` | `#D4AF37` | "Sabias que..." |
| `phraseColor` | `#FAF7F0` | Frase central |
| `footerColor` | `#FAF7F0` | `seteveus.space` |

### Posição & tamanhos default

| Token | Valor | Significado |
|---|---|---|
| `cardY` | `880` | Y do topo do card (editável per-render: 400-1500) |
| `kickerSize` | `56 px` | "Sabias que..." |
| `phraseSize` | `60 px` | Frase central (editável per-render: 20-120) |

### Tipografia

| Elemento | Fonte | Estilo |
|---|---|---|
| Kicker `Sabias que…` | Serif (Cormorant ideal) | regular |
| Frase central | Serif italic | italic |
| Footer `seteveus.space` | Sans-serif | regular |

### Estrutura

```
─── 1080 × 1920 ──────────────────────
│        [vídeo motion ao fundo]      │
│                                     │
│  ╔═══════════════════════════════╗  │  ← card vidro fosco (cardY=880)
│  ║                               ║  │     com cantoneiras douradas
│  ║      Sabias que...            ║  │  ← kicker dourado (56 px)
│  ║                               ║  │
│  ║   <frase em italic, 60 px>    ║  │  ← frase creme
│  ║                               ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│           seteveus.space            │  ← footer 60px abaixo do card
│                                     │
─── 1080 × 1920 ──────────────────────
```

### Line-height da frase

`Math.round(phraseSize × 1.33)` — para `phraseSize=60` → line-height 80.

### Overrides per-render (PR #470)

Em `manifest.design = { phraseSize, kickerSize, cardY }` — sobrepõe-se ao design global desse batch. Editável na UI post-render:
- Tamanho fonte: 20-120 px
- Posição vertical (cardY): 400-1500
- Texto da frase: textarea editável

---

## 5. VC Sabia — Sinais & glifos

VC Sabia **não tem glifo por dia** (ao contrário do Hoje, em Mim) — em vez disso usa **4 cantoneiras L-shaped** em cada canto do card, em `cornerColor` dourado (`#D4AF37`).

A única "assinatura" gráfica é:
- `Sabias que…` (kicker fixo no topo)
- 4 cantoneiras douradas
- `seteveus.space` (footer)

Razão: VC Sabia repete-se diariamente sem ritual semanal — a identidade vem da CONSISTÊNCIA visual, não da variação.

---

## 6. Resumo lado a lado

| Aspecto | VC Sabia (manhã) | Hoje, em Mim (noite) |
|---|---|---|
| **Variação semanal** | Nenhuma (mesmo kicker `Sabias que…` todos os dias) | 7 kickers + 7 glifos + 7 mood-prefs |
| **Card vs arco** | Card retangular vidro fosco + cantoneiras | Arco curvo cobre abraça a frase |
| **Fonte** | Serif italic (frase) + serif (kicker) | Cormorant Garamond Italic + Regular |
| **Tamanho frase** | Fixo `60 px` (editável per-render 20-120) | Dinâmico 52-76 conforme linhas |
| **Paletas alternativas** | 1 só (cream/gold/honey) | 6 presets (cobre/luar/dourado/rosa/branco/musgo) |
| **Glifo** | 4 cantoneiras douradas estáticas | 1 glifo unicode por dia (`✶☉◌〜♢◯→`) |
| **Footer** | `seteveus.space` (lowercase) | `SETEVEUS.SPACE` (uppercase) |
| **Grading motion** | Sem FFmpeg eq por paleta | `ffmpegEq` por paleta aplicado antes de compor |
| **Especiais** | Markers calendário no picker (info no plano) | Sobrepõem kicker + glifo + mood (`❋✧✦◐`) |
