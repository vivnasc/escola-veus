# Carrossel "A Estação dos Véus"

Gerador de **42 slides verticais** (1080×1920, exportados a 2160×3840 com `deviceScaleFactor: 2`) para publicar como **status diário do WhatsApp** durante a estação fria em Maputo. 7 dias × 6 slides, um véu por dia.

> Projecto **independente** dos outros sub-repos (Escola dos Véus, etc.). Vive isolado em `carrossel-veus/`.

## Estrutura

```
carrossel-veus/
├── package.json
├── generate.js       # script Puppeteer
├── template.html     # HTML do slide (lê window.SLIDE_DATA)
├── styles.css        # paleta + tipografia + layouts (capa / conteúdo / cta)
├── content.json      # os 42 slides (7 dias × 6)
├── README.md         # este ficheiro
└── output/           # gerado pelo script
    ├── index.html    # grelha 7×6 para revisão
    ├── dia-1/
    │   └── veu-1-slide-{1..6}.png
    └── dia-2/ ... dia-7/
```

## Pré-requisitos

- Node.js ≥ 20
- Acesso à internet na primeira execução (Google Fonts + download do Chromium do Puppeteer)

## Uso

```bash
cd carrossel-veus
npm install
npm run generate
```

No fim, abre `output/index.html` no browser para ver a grelha 7×6 e revisar.

Para regenerar depois de editar `content.json`, basta correr `npm run generate` outra vez (o output é apagado e recriado).

## Identidade visual

Paleta:

| Token | Valor |
|---|---|
| `--ink` | `#1a1a1a` |
| `--ivory` | `#f5efe6` |
| `--deep` | `#0f1419` |
| `--terracotta` | `#b85c38` |
| `--gold` | `#c9a961` |
| `--mist` | `rgba(245, 239, 230, 0.7)` |

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
