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

**Camadas decorativas** renderizadas em todos os slides (só quando *não* há fundo MJ):

- `.fireflies` — 15 pirilampos (dots `#fffaeb` com 3 halos dourados).
- `.stars` — 10 sparkles ✦ (4-pontas via clip-path).
- `.rainbow-strip` — banda pastel topo+rodapé em CTAs (excepto dia 7).
- `.rainbow-arc` — arco-íris pastel grande na capa e CTA do dia 7.
- `.glow-hue` + `.paper` + `.vignette-light` — wash radial do hue do dia, textura de papel quente, vinheta clara.

Tipografia: **Cormorant Garamond** (títulos, poesia, citações) + **Inter** (corpo, CTAs, numeração). URLs em **JetBrains Mono**.

## Fundos Midjourney

O template aceita imagens de fundo por dia ou por slide. Sem fundo, o slide cai para a paleta luminosa default (gradientes do hue do dia + pirilampos + sparkles). Com fundo, a imagem ocupa o slide inteiro, a decoração CSS desliga-se, e o texto fica por cima de um *scrim* (gradiente translúcido topo+rodapé) que garante legibilidade.

**Path:** coloca os JPGs/PNGs em `carrossel-veus/fundos/`. Resolução recomendada **1080×1920** (9:16 vertical). Em Midjourney, parâmetro `--ar 9:16`.

**Como referenciar** no `content.json`:

```json
{
  "numero": 1,
  "veu": "PERMANÊNCIA",
  "fundo": "fundos/permanencia.jpg",         // aplica aos 6 slides do dia
  "slides": [
    {
      "tipo": "capa",
      "fundo": "fundos/permanencia-capa.jpg", // override só para este slide
      "linha1": "Maputo está a esfriar.",
      "linha2": "E algo em ti acorda."
    }
  ]
}
```

**Flags opcionais** (no slide ou no dia):

| Flag | Default | Efeito |
|---|---|---|
| `fundoClaro: true` | `false` | Inverte o scrim para claro e o texto para escuro. Usa quando a imagem MJ é pastel/luminosa. |
| `decoracao: true` | `false` | Mantém pirilampos + sparkles por cima da imagem. Útil se a imagem for sóbria e quiseres reforçar a magia. |

**Prompts Midjourney sugeridos por véu** (ponto de partida — afina a gosto):

- **Permanência** (rosa-aurora, água a correr): `soft dawn light over a slow river, warm peach and rose gold tones, gentle blur, ethereal mist, editorial mood, 35mm film, --ar 9:16 --style raw`
- **Memória** (lavanda, livros velhos): `dried lavender and old letters on warm linen, soft window light, dusty lilac and cream palette, painterly stillness, --ar 9:16 --style raw`
- **Turbilhão** (menta, silêncio sob ruído): `still pond surface beneath wind-stirred reeds, mint and sage tones, soft mist, calm centre, watercolour aesthetic, --ar 9:16 --style raw`
- **Esforço** (sálvia, repouso): `hammock under olive trees at golden hour, soft sage and warm cream, slow afternoon, hazy sun rays, --ar 9:16 --style raw`
- **Desolação** (âmbar, terra preparada): `bare soil ready for planting, single ray of warm amber light, fertile emptiness, tender warm palette, --ar 9:16 --style raw`
- **Horizonte** (céu, agora): `wide pastel sky meeting calm sea, soft cumulus, no horizon line, dreamy blue and peach, painterly, --ar 9:16 --style raw`
- **Dualidade** (arco-íris, unidade): `prismatic light passing through morning dew, soft rainbow refractions on pale background, all colours coexisting, ethereal, --ar 9:16 --style raw`

> Os ficheiros de `fundos/` *não* estão sob versão por defeito — adiciona ao `.gitignore` se forem demasiado pesados, ou commita-os se quiseres reprodutibilidade.

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

- **`capa`** — palavra-véu Cormorant 180px, subtítulo italic, frases de abertura (`linha1` + `linha2`), romano + footer.
- **`conteudo`** — texto centrado. Campo `estilo` aceita `"poetico"` (Cormorant italic 72px) ou `"prosa"` (Cormorant 50px). Opcional: `titulo` (label tipo "Hábito da estação").
- **`cta`** — ícone (emoji), nome do recurso em Cormorant italic, descrição, URL em terracotta + espiral.

Para texto poético usa `\n` para quebras de linha. Para sobrepor a paleta luminosa com uma imagem própria, ver secção **Fundos Midjourney**.

## Notas finais

- **Cursos = manifestação de interesse**, não venda. CTAs do Dia 6 usam "manifesta interesse", "acesso prioritário". Nunca "compra" ou "inscreve-te".
- **VITALIS e LUMINA** vivem em `app.seteecos.com`, não em `seteveus.space`.
- **Voz**: autoridade calma. Sem performance, sem urgência fabricada, sem exclamações.
- **Tipografia primeiro, decoração depois.** Se um slide está carregado, retira em vez de adicionar.
