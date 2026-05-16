# Carrossel "A Estação dos Véus"

Gerador de **42 slides verticais** (1080×1920) + **7 vídeos verticais com voz e música** (~60s cada, prontos para status do WhatsApp) durante a estação fria em Maputo. 7 dias × 6 slides, um véu por dia.

> Projecto **independente** dos outros sub-repos (Escola dos Véus, etc.). Vive isolado em `carrossel-veus/`.

## Estrutura

```
carrossel-veus/
├── package.json
├── generate.js          # PNGs (Puppeteer)
├── gerar-vozes.mjs      # MP3s de narração (ElevenLabs TTS)
├── montar-videos.mjs    # MP4s = PNG + voz + música (ffmpeg)
├── template.html        # HTML do slide (lê window.SLIDE_DATA)
├── styles.css           # paleta + tipografia + layouts
├── content.json         # os 42 slides (7 dias × 6)
├── musica.mp3           # OPCIONAL — música de fundo (ex.: Ancient Ground)
├── README.md
├── audios/              # gerado por gerar-vozes.mjs
│   └── dia-{1..7}/slide-{1..6}.mp3
└── output/              # gerado por generate.js + montar-videos.mjs
    ├── index.html
    ├── dia-{1..7}/veu-{n}-slide-{1..6}.png
    └── videos/dia-{1..7}.mp4
```

## Pré-requisitos

- Node.js ≥ 20
- `ELEVENLABS_API_KEY` no env (para narração)
- Acesso à internet na primeira execução (Google Fonts, Chromium do Puppeteer, binário ffmpeg estático)
- (opcional) `musica.mp3` na raiz do `carrossel-veus/` — sem ela, os vídeos saem só com voz

## Uso

```bash
cd carrossel-veus
npm install

# 1) Slides PNG
npm run slides

# 2) Narração (precisa ELEVENLABS_API_KEY)
ELEVENLABS_API_KEY=sk-... npm run vozes

# 3) Vídeos MP4 (mistura PNG + voz + música)
npm run videos

# Tudo de uma vez:
ELEVENLABS_API_KEY=sk-... npm run all
```

Cada slide dura **o tempo da narração + 1s de respiração**. Cross-dissolve de 0.5s entre slides. Música de fundo a -18 dB com fade in/out.

Para correr só alguns dias: `node montar-videos.mjs 1 3 5`.

No fim, abre `output/index.html` para a grelha 7×6 dos PNGs, e os MP4s ficam em `output/videos/`.

Para regenerar depois de editar `content.json`: corre `npm run all` outra vez (output e áudios são apagados e recriados).

## Voz

- Voz por defeito: `JGnWZj684pcXmK2SxYIv` (voz dos Véus, ElevenLabs `eleven_multilingual_v2`).
- Para usar outra voz: `ELEVENLABS_VOICE_ID=...` no env.
- Texto narrado é derivado automaticamente de cada slide (capa: nome do véu + linhas; conteúdo: texto; CTA: recurso + descrição). Para sobrepor, adiciona `"narracao": "texto a falar"` ao slide em `content.json`.

## Identidade visual — versão LUZ

Paleta base luminosa (sem fundos pretos — capa, conteúdo e CTA todos sobre `--ivory`):

| Token | Valor | Notas |
|---|---|---|
| `--ink` | `#3a2e26` | tinta quente, não preto |
| `--ivory` | `#fdf8ed` | creme luminoso, fundo de todos os slides |
| `--parchment-dark` | `#f1e3c8` | gradiente quente |
| `--terracotta` | `#d68b6c` | acento quente |
| `--gold` | `#c9a14a` | numeração romana, rules |
| `--gold-glow` | `#f6dc92` | halo dos pirilampos e ícones |

**Cor dominante por dia** — cada véu tem uma atmosfera (definida via classe `.dia-N` no slide). Os tokens `--hue` e `--hue-deep` resolvem para a cor do dia:

| Dia | Véu | Hue |
|---|---|---|
| 1 | Permanência | rosa-aurora |
| 2 | Memória | lavanda |
| 3 | Turbilhão | menta |
| 4 | Esforço | sálvia |
| 5 | Desolação | âmbar |
| 6 | Horizonte | céu |
| 7 | Dualidade | arco-íris (todas) |

**Camadas decorativas** renderizadas em todos os slides:

- `.fireflies` — 15 pirilampos (dots `#fffaeb` com 3 halos dourados).
- `.stars` — 10 sparkles ✦ (4-pontas via clip-path).
- `.rainbow-strip` — banda pastel topo+rodapé em CTAs (excepto dia 7).
- `.rainbow-arc` — arco-íris pastel grande na capa e CTA do dia 7.
- `.glow-hue` + `.paper` + `.vignette-light` — wash radial do hue do dia, textura de papel quente, vinheta clara.

Tipografia: **Cormorant Garamond** (títulos, poesia, citações) + **Inter** (corpo, CTAs, numeração). URLs em **JetBrains Mono**.

## Os 7 dias

| Dia | Véu | CTA | URL |
|---|---|---|---|
| 1 | Permanência | 📖 Livro físico + digital | seteveus.space/livro-fisico |
| 2 | Memória | 📚 Colecção Espelhos | seteveus.space/comprar/espelhos |
| 3 | Turbilhão | 🎧 Music Véus | music.seteveus.space |
| 4 | Esforço | 🌿 VITALIS | app.seteecos.com/vitalis |
| 5 | Desolação | ✨ LUMINA (gratuito) | app.seteecos.com/lumina |
| 6 | Horizonte | 🕯️ Cursos — manifestar interesse | seteveus.space/cursos |
| 7 | Dualidade | 🌀 Síntese — todos os caminhos | seteveus.space + app.seteecos.com |

## Editar conteúdo

Tudo está em `content.json`. Cada slide tem um `tipo`:

- **`capa`** — fundo deep, romano gold no topo, palavra-véu Cormorant 180px, subtítulo italic, frases de abertura (`linha1` + `linha2`).
- **`conteudo`** — fundo ivory, texto centrado. Campo `estilo` aceita `"poetico"` (Cormorant italic 64px) ou `"prosa"` (Inter 300, 48px). Opcional: `titulo` (label tipo "Hábito da estação" em terracotta).
- **`cta`** — fundo deep, ícone (emoji), nome do recurso em Cormorant italic, descrição, URL em terracotta + espiral.

Para texto poético usa `\n` para quebras de linha.

## Notas finais

- **Cursos = manifestação de interesse**, não venda. CTAs do Dia 6 usam "manifesta interesse", "acesso prioritário". Nunca "compra" ou "inscreve-te".
- **VITALIS e LUMINA** vivem em `app.seteecos.com`, não em `seteveus.space`.
- **Voz**: autoridade calma. Sem performance, sem urgência fabricada, sem exclamações.
- **Tipografia primeiro, decoração depois.** Se um slide está carregado, retira em vez de adicionar.
