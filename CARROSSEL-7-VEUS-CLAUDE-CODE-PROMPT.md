# Carrossel "A Estação dos Véus" — Gerador de Slides

## Contexto

Vivianne dos Santos (Sete Ecos / Os Sete Véus) precisa de **42 slides verticais** (7 dias × 6 slides) para publicar como **status diário no WhatsApp** durante a estação fria em Maputo (que está a chegar, ainda não chegou).

Cada dia explora um dos sete véus do livro *Os 7 Véus do Despertar* e ancora os produtos do ecossistema Sete Ecos.

### Ecossistema (CTAs reais)

- **seteveus.space** — Livro impresso + digital, Colecção Espelhos, Colecção Nós, Music Véus, Ecos (comunidade)
- **app.seteecos.com** — VITALIS (plano alimentar moçambicano) e LUMINA (diagnóstico energético gratuito)
- **Cursos** (Ouro Próprio, Limite Sagrado, A Arte da Inteireza, etc.) — **AINDA NÃO ABERTOS**: CTA é *manifestar interesse*, não comprar

---

## Objectivo técnico

Construir uma aplicação Node/HTML que:

1. Renderize **42 slides** em HTML/CSS (formato vertical 1080×1920 px)
2. Exporte cada slide como **PNG** via Puppeteer
3. Organize os ficheiros em `output/dia-1/`, `output/dia-2/`... `output/dia-7/`
4. Nomeie cada ficheiro como `veu-{numero}-slide-{n}.png`

---

## Stack

- Node.js (>=20)
- Puppeteer (renderiza HTML → PNG)
- HTML + CSS puros
- Fontes: Cormorant Garamond (títulos) e Inter (corpo) via Google Fonts

---

## Estrutura de pastas

```
carrossel-veus/
├── package.json
├── generate.js
├── template.html
├── styles.css
├── content.json
├── README.md
└── output/
    ├── index.html
    └── dia-1/ ... dia-7/
```

---

## Identidade visual

### Paleta

- `--ink: #1a1a1a`
- `--ivory: #f5efe6`
- `--deep: #0f1419`
- `--terracotta: #b85c38`
- `--gold: #c9a961`
- `--mist: rgba(245, 239, 230, 0.7)`

### Tipografia

- **Cormorant Garamond** — títulos, palavras-véu, citações (300/400, italic em poesia)
- **Inter** — corpo, CTAs, numeração (300/500)

### Princípios

- Margem mínima lateral: 120px
- Uma ideia por slide
- Numeração romana (I/VII...) discreta no topo das capas, em `--gold`, tracking 0.4em
- Logo espiral discreto (slide 1 e 6)
- Símbolos tipográficos com moderação: ◊ ~ ♢ ∞ 🌀

### Layouts por tipo

**CAPA (slide 1)** — fundo `--deep`, romano gold no topo, palavra-véu Cormorant 180px ivory, subtítulo italic 36px mist, frases de abertura Inter 42px ivory line-height 1.5

**CONTEÚDO (slides 2-5)** — fundo `--ivory`, número minúsculo `02 · VII` ink/40% no topo, texto centrado: Cormorant italic 64px (poético) ou Inter 300 48px (prosa), max-width 720px, assinatura `os sete véus` Inter 24px ink/30% tracking alargado na base

**CTA (slide 6)** — fundo `--deep`, símbolo do produto 80px, nome do recurso Cormorant 72px ivory, descrição Inter 36px mist, URL Inter mono 32px terracotta + logo espiral

---

## Conteúdo dos 42 slides

### DIA 1 — PERMANÊNCIA *(Encobre a impermanência da vida.)*

1. **Capa**: "Maputo está a esfriar." / "Algo em ti também."
2. **Poético**: "A estação fria é curta aqui. / Por isso te ensina depressa: / nada fica como está."
3. **Prosa**: "O Véu da Permanência é o que te faz acreditar que tu és sempre a mesma. Que esta fase é definitiva. Que o que sentes hoje vai durar."
4. **Poético**: "Não vai. / E essa é a boa notícia."
5. **Hábito**: "Escreve uma frase por dia sobre o que está a mudar em ti — mesmo que pareça mínimo."
6. **CTA**: 📖 *Os 7 Véus do Despertar* — "Começa pelo primeiro véu. Edição impressa + digital." — `seteveus.space/livro-fisico`

---

### DIA 2 — MEMÓRIA *(Encobre a liberdade do presente.)*

1. **Capa**: "Tens uma história." / "Não és a tua história."
2. **Prosa**: "O frio que vem aí convida ao recolhimento. E no recolhimento, a memória sobe. Tudo o que ficou por dizer, por chorar, por encerrar."
3. **Prosa**: "O Véu da Memória mantém-te presa ao passado a fingir que é presente. Repetes padrões, escolhes igual, magoas-te igual."
4. **Hábito**: "Identifica uma história que continuas a contar sobre ti — e pergunta se ainda é verdade."
5. **Prosa**: "A Colecção Espelhos foi escrita pra isto. Sete ficções onde te reconheces. *Espelho da Ilusão* é o primeiro."
6. **CTA**: 📚 *Colecção Espelhos* — "7 ficções de transformação. Acesso vitalício." — `seteveus.space/comprar/espelhos`

---

### DIA 3 — TURBILHÃO *(Encobre o silêncio do ser.)*

1. **Capa**: "A mente não pára." / "E tu confundes-te com ela."
2. **Prosa**: "Quando o frio chegar, a tendência vai ser encher: séries, scroll, conversas, comida. Tudo pra não ficar com o turbilhão."
3. **Poético**: "Mas o silêncio não é vazio. / É o sítio onde te encontras / debaixo do ruído."
4. **Hábito**: "10 minutos. Sem telemóvel. Sem música. Só tu e o que aparece."
5. **Prosa**: "Quando o silêncio for muito, há som feito pra atravessá-lo — não pra preencher. *Paisagens Interiores*, em Music Véus."
6. **CTA**: 🎧 *Music Véus* — "Banda sonora pra escutar dentro. Primeira faixa de cada álbum gratuita." — `music.seteveus.space`

---

### DIA 4 — ESFORÇO *(Encobre o repouso interior.)*

1. **Capa**: "Achas que mereces descansar" / "quando tudo estiver feito."
2. **Poético**: "Não vai estar."
3. **Prosa**: "O Véu do Esforço faz-te entrar em modo 'produzir antes do fim do ano' — exactamente quando o corpo vai pedir o contrário."
4. **Prosa**: "A estação fria em Maputo é breve. Usa-a pra parar, não pra acelerar. E pra cuidar do corpo com calma — sem dieta, sem culpa."
5. **Hábito**: "VITALIS é reeducação alimentar com comida nossa: xima, matapa, caril. Plano personalizado, check-in de 30 segundos por dia."
6. **CTA**: 🌿 *VITALIS* — "Plano alimentar moçambicano. Sem balança, sem extremos." — `app.seteecos.com/vitalis`

---

### DIA 5 — DESOLAÇÃO *(Encobre a fertilidade do vazio.)*

1. **Capa**: "Sentes-te vazia." / "E tens medo disso."
2. **Prosa**: "O frio expõe o que o calor disfarça. Solidão, tédio, ausência de sentido. Aparecem."
3. **Poético**: "Mas o vazio que sentes / não é abandono. / É terra preparada."
4. **Hábito**: "Em vez de fugir do vazio: senta-te com ele. Cinco minutos. Sem resolver, sem explicar, sem encher."
5. **Prosa**: "Há um diagnóstico gratuito que te mostra onde estás agora — corpo, mente, emoção. Sete perguntas, dois minutos. Chama-se LUMINA."
6. **CTA**: ✨ *LUMINA — Diagnóstico Energético* — "Gratuito. 2 minutos. Mostra o que estava invisível." — `app.seteecos.com/lumina`

---

### DIA 6 — HORIZONTE *(Encobre a infinitude da consciência.)*

1. **Capa**: "Achas que vais chegar." / "Não vais."
2. **Prosa**: "O Véu do Horizonte é a ilusão do destino: quando eu emagrecer, quando o livro sair, quando os filhos crescerem, quando tiver tempo, então sim, vou viver."
3. **Poético**: "Não é assim que funciona. / A vida não está depois. / Está agora."
4. **Hábito**: "Faz uma coisa que estavas a adiar pra 'quando estivesse pronta'. Pequena. Imperfeita. Agora."
5. **Prosa**: "Estão a chegar 10 cursos de transformação interior — Ouro Próprio, Limite Sagrado, A Arte da Inteireza, e mais. Manifesta interesse pra seres das primeiras a entrar."
6. **CTA**: 🕯️ *Escola dos Véus — em breve* — "Manifesta interesse e recebe acesso prioritário." — `seteveus.space/cursos`

---

### DIA 7 — DUALIDADE *(Encobre a unidade do real.)*

1. **Capa**: "Pensas: eu" / "e o resto."
2. **Prosa**: "O último véu é o que te faz acreditar que estás separada. Da tua família. Do teu corpo. De ti mesma. Da vida."
3. **Poético**: "Não estás. / Nunca estiveste."
4. **Prosa**: "O frio que vem aí é o mesmo que vai arrefecer esta cidade inteira. O cansaço que sentes é partilhado. O desejo de recomeçar também."
5. **Prosa**: "Os Ecos são onde isto se torna visível: comunidade anónima, partilha sem máscara, reconhecimento mútuo. Incluído em qualquer experiência."
6. **CTA final**: 🌀 *Começa onde sentires* — "Livro · Espelhos · Music Véus · Vitalis · Lumina · Ecos" — `seteveus.space` + `app.seteecos.com`

---

## Mapa de CTAs por dia (resumo)

| Dia | Véu | CTA | URL |
|---|---|---|---|
| 1 | Permanência | 📖 Livro físico + digital | seteveus.space/livro-fisico |
| 2 | Memória | 📚 Colecção Espelhos | seteveus.space/comprar/espelhos |
| 3 | Turbilhão | 🎧 Music Véus | music.seteveus.space |
| 4 | Esforço | 🌿 VITALIS | app.seteecos.com/vitalis |
| 5 | Desolação | ✨ LUMINA (gratuito) | app.seteecos.com/lumina |
| 6 | Horizonte | 🕯️ Cursos — manifestar interesse | seteveus.space/cursos |
| 7 | Dualidade | 🌀 Síntese — todos os caminhos | seteveus.space + app.seteecos.com |

Sequência intencional: começa pela porta mais comprometida (livro), passa pelas ficções, pela música, pelo corpo (VITALIS), oferece a porta gratuita (LUMINA) ao meio-fim quando já há ligação, abre lista dos cursos no penúltimo dia (manifestação de interesse, não venda), e fecha com síntese do ecossistema todo.

---

## Estrutura `content.json`

```json
{
  "dias": [
    {
      "numero": 1,
      "veu": "PERMANÊNCIA",
      "subtitulo": "Encobre a impermanência da vida.",
      "romano": "I / VII",
      "slides": [
        { "tipo": "capa", "linha1": "Maputo está a esfriar.", "linha2": "Algo em ti também." },
        { "tipo": "conteudo", "estilo": "poetico", "texto": "A estação fria é curta aqui.\nPor isso te ensina depressa:\nnada fica como está." },
        { "tipo": "conteudo", "estilo": "prosa", "texto": "O Véu da Permanência é o que te faz acreditar que tu és sempre a mesma. Que esta fase é definitiva. Que o que sentes hoje vai durar." },
        { "tipo": "conteudo", "estilo": "poetico", "texto": "Não vai.\n\nE essa é a boa notícia." },
        { "tipo": "conteudo", "estilo": "prosa", "titulo": "Hábito da estação", "texto": "Escreve uma frase por dia sobre o que está a mudar em ti — mesmo que pareça mínimo." },
        { "tipo": "cta", "icone": "📖", "recurso": "Os 7 Véus do Despertar", "descricao": "Começa pelo primeiro véu. Edição impressa + digital.", "url": "seteveus.space/livro-fisico" }
      ]
    }
  ]
}
```

Replicar a mesma estrutura para os 7 dias usando o conteúdo acima.

---

## `package.json`

```json
{
  "name": "carrossel-veus",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "generate": "node generate.js" },
  "dependencies": { "puppeteer": "^23.0.0" }
}
```

---

## `generate.js` — comportamento

1. Lê `content.json`
2. Para cada dia, cria pasta `output/dia-{n}/`
3. Para cada slide, injecta dados no `template.html` (via `window.SLIDE_DATA` ou query string)
4. Abre no Puppeteer com viewport 1080×1920, `deviceScaleFactor: 2`
5. `await page.evaluateHandle('document.fonts.ready')` antes do screenshot
6. Screenshot full-page como PNG
7. Salva em `output/dia-{n}/veu-{n}-slide-{i}.png`
8. Loga progresso na consola
9. No final gera `output/index.html` com grelha 6×7 de previews para revisão rápida

### Detalhes finos

- Google Fonts com `&display=block` para evitar FOUT
- `font-feature-settings: "liga", "kern"` em todo o body
- `text-rendering: geometricPrecision` em Cormorant
- Pequena vinheta radial (~10% opacity) nos fundos `--deep`
- `clamp()` no `font-size` se a frase for longa, em vez de cortar
- Logo espiral: emoji `🌀` em opacity 0.15 ou SVG simples em gold

---

## Critérios de qualidade

1. ✅ 42 PNGs gerados sem erros
2. ✅ Texto não cortado nas bordas
3. ✅ Cormorant e Inter renderizadas (não fallback)
4. ✅ Numeração romana visível mas discreta
5. ✅ URLs em terracotta legíveis
6. ✅ `output/index.html` em grelha 6×7
7. ✅ Cada PNG: 2160×3840 (com deviceScaleFactor 2)
8. ✅ README.md com instruções de regenerar e editar `content.json`

---

## Notas finais

- **Não inventes** véus, produtos ou URLs. Tudo está aqui.
- **Cursos = manifestação de interesse**, não venda directa. CTA do Dia 6 deve usar verbos como "manifesta interesse", "sê das primeiras a entrar", "acesso prioritário". Nunca "compra" ou "inscreve-te".
- **VITALIS e LUMINA** vivem em `app.seteecos.com`, não em `seteveus.space`. Não baralhar.
- **Voz**: autoridade calma, "vejo-te, e há mais para ti". Sem performance, sem exclamações, sem urgência fabricada.
- **Tipografia primeiro, decoração depois.** Se um slide está carregado, retira em vez de adicionar.

Quando terminares, abre `output/index.html` no browser para revisão final.
