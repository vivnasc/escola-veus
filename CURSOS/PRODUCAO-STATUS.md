# Escola dos Veus — Estado da Producao

**Ultima actualizacao:** 2026-04-16 (sessao 2)
**Actualizado por:** Claude Code

> Este ficheiro e a referencia unica de continuidade entre sessoes.
> Qualquer sessao nova DEVE ler este ficheiro antes de trabalhar na producao dos cursos.
> Actualizar SEMPRE este ficheiro no final de cada sessao de trabalho.

---

## Resumo do Estado

| Componente | Estado | Detalhe |
|-----------|--------|---------|
| Estrutura dos 20 cursos | COMPLETO | `src/data/courses.ts` — 20 cursos, 160 modulos, 480 sub-aulas |
| Scripts YouTube | COMPLETO | 122 scripts Nomear (24 series) — `src/data/nomear-scripts.ts` |
| **Scripts das aulas** | **7/20 COMPLETOS + REVISTOS** | **168/480 scripts — 7 cursos revistos com fixes** |
| **Bulk audio page** | **COMPLETO** | `/admin/audio-bulk` — ElevenLabs em massa, Supabase, sync |
| **Audios ElevenLabs** | **EM CURSO** | **~112/290 gerados. Creditos a esgotar (quota_exceeded em alguns)** |
| **Pipeline video (doc)** | **DEFINIDO** | **`ESCOLA-VEUS-VIDEO-PIPELINE REVISTO.md` — 2 pipelines (cursos slides + YouTube Runway)** |
| **CLI escola-veus** | **MVP PRONTO** | **`tools/escola-veus-cli/` — curso parse + preview funcionais. Render TODO** |
| **Suno API** | **CORRIGIDO** | **Model V5_5→V4_5ALL (API.box). Testar no Vercel** |
| **Imagens ThinkDiffusion** | **SCRIPT PRONTO** | **`tools/thinkdiffusion-batch/` — batch A1111 API, 22 prompts, mood selector** |
| Admin de producao (UI) | COMPLETO | `/admin/producao/` — wizard 6 passos (video pipeline antigo) |
| APIs de producao | COMPLETO | Todos os endpoints prontos (audio, imagem, animacao, legendas, musica, render) |
| Manuais (PDF) | EM CURSO | 1/20 manuais escritos (Ouro Proprio — DRAFT) |
| Cadernos exercicios | EM CURSO | 8/160 cadernos escritos (Ouro Proprio — DRAFT) |

### ABOLIDO (nao usar, desactualizado)

| Componente | Razao |
|-----------|-------|
| LoRA `veus_figure` | Abolido — nao se geram silhuetas/figuras |
| Territorios visuais (`TERRITORY_GUIDES`) | Abolido — visual agora e natureza realista |
| `IDENTIDADE-VISUAL-VIDEOS.md` (Conceito A) | Abolido — silhuetas/veus visuais descontinuados |
| `VISUAL_GUIDELINES` em `course-guidelines.ts` | Abolido — paleta agora e `#0d0d0d`/creme/coral/roxo (ver pipeline revisto) |
| Shotstack / Remotion | Substituido por FFmpeg + Puppeteer (CLI local) |
| Trailer do canal (pipeline antigo) | Parado — reavaliar com novo pipeline |

---

## Scripts das Aulas (Abril 2026) — 7 cursos completos

Ficheiro unico: `escola-veus-app/src/data/nomear-scripts.ts`

Estrutura: `NOMEAR_PRESETS` com 168 aulas de cursos (7 cursos × 24 aulas = 168) + 122 scripts Nomear YouTube.

**Cursos escritos, revistos por subagente, com fixes aplicados:**

| # | Curso | ID prefix | Status | Pasta Supabase |
|---|-------|-----------|--------|----------------|
| 1 | Ouro Proprio | `curso-ouro-proprio-m1..m8` | ✅ revisto + fixes | `curso-ouro-proprio` |
| 2 | Limite Sagrado | `curso-limite-sagrado-m1..m8` | ✅ revisto + fixes | `curso-limite-sagrado` |
| 3 | Sangue e Seda | `curso-sangue-e-seda-m1..m8` | ✅ revisto + 9 typos + 3 reescritas (M3.C, M5.B, M8.A) | `curso-sangue-e-seda` |
| 4 | O Silencio que Grita | `curso-o-silencio-que-grita-m1..m8` | ✅ revisto + 4 typos + 5 reescritas | `curso-o-silencio-que-grita` |
| 5 | Pele Nua | `curso-pele-nua-m1..m8` | ✅ revisto + 6 typos + 4 reescritas criticas (M5.C, M6.C, M7.B, M8.C) | `curso-pele-nua` |
| 6 | A Fome | `curso-a-fome-m1..m8` | ✅ revisto + 9 correccoes | `curso-a-fome` |
| 7 | A Chama | `curso-a-chama-m1..m8` | ✅ revisto + 5 typos + 4 reescritas (M3.B, M3.A, M4.B, M4.A) | `curso-a-chama` |

**Cursos pendentes (13/20) — para sessoes futuras:**

A Voz de Dentro, A Mulher Antes de Mae, O Peso e o Chao, Depois do Fogo, A Teia, A Coroa Escondida, O Fio Invisivel, A Arte da Inteireza, O Espelho do Outro, Olhos Abertos, Flores no Escuro, O Relogio Partido, O Oficio de Ser.

**Registo "nomeador" — regras invioláveis:**
- Voz contemplativa, acolhedora, reconhecedora. NAO didactica.
- NAO usar mindfulness guiado ("fecha os olhos", "respira fundo", "percorre o corpo com a atencao", "visualiza").
- NAO usar jargao espiritual ("energia sexual", "sagrado", "divino", "honra", "sintonia", "manifestar", "abundancia", "deusa interior", "chakra").
- NAO usar coach speak ("abraca", "intencao").
- Gesto da aula DEVE ser EXTERNO: escrever em folha/caderno, mandar mensagem, ter conversa com alguem, registar apos facto — nao meditacao interna.
- PT-PT (NAO pt-BR): "objecto" (nao "objeto"), "correccao", "efectivamente", "tu" em vez de "voce", conjuntivo apos "talvez", "as hormonas" (feminino).

**Formato de cada aula:**
```typescript
{
  id: "<curso-slug>-m<N><letra>",    // ex: "a-chama-m3b"
  titulo: "M3.B — Titulo da aula",
  curso: "<curso-slug>",             // ex: "a-chama"
  texto: `texto com [pause], [short pause], [long pause] tags`,
}
```

**Caracteristicas de scripts bons:**
- Abertura diagnostica (nomear o fenomeno, nao anunciar tema)
- Estrutura: pergunta/situacao → revelacao → gesto concreto → frase de fecho
- 3000-5000 chars em media (cada sub-aula)
- Gesto em folha escrita, carta a alguem, conversa real
- Fecho circular (ecoa o inicio) mas sem sentimentalismo

**Processo de revisao:**
1. Escrever curso completo (24 aulas × 8 modulos)
2. Commit por modulo
3. Lancar subagente `general-purpose` com brief estruturado (ver secao "Revisao de cursos" abaixo)
4. Aplicar correcoes identificadas
5. Commit final com descricao detalhada

---

## Pipeline Tecnico — Estado Actual (Abril 2026)

### Conceito Visual: "O Veu e o Corpo" (Conceito A)

A figura NAO e solida. E feita de veus translucidos sobrepostos com luz dourada a brilhar por dentro.
Quando os veus caem, a luz revela-se. Escolhido por traduzir o nome da escola em imagem.

**STYLE prompt (exacto do codigo):**
```
minimalist flat illustration, faceless human figure made entirely of translucent layered veils, the veils ARE the body, no solid skin visible, figure composed of flowing semi-transparent fabric layers in dark navy-purple (#1A1A2E to #2D2045), warm golden light (#D4A853) glowing softly from within between veil layers, no race no facial features no clothing details, smooth organic flowing shapes, clean edges, no outlines, terracotta (#C4745A) accent details, dark navy background (#0D0D1A), calm symbolic abstract modern, large central figure filling the frame, 16:9 widescreen composition, no photorealism, no cartoon, no text, no words, no letters
```

### Voz (ElevenLabs v3)

| Parametro | Valor | Nota |
|-----------|-------|------|
| Voice ID | `JGnWZj684pcXmK2SxYIv` | NAO e clone da Vivianne — voz pre-existente escolhida |
| Model | `eleven_v3` | Modelo mais recente |
| language_code | `"pt"` | Obrigatorio com v3. "pt-pt" nao funciona com v3 |
| voice_settings | NENHUM | NAO enviar — usar defaults naturais da voz |
| Audio tags | `[pause]`, `[short pause]`, `[long pause]`, `[calm]`, `[thoughtful]` | Directamente no texto |

**REGRA:** O voiceId NUNCA e guardado/restaurado de localStorage. Vem sempre do DEFAULT_VOICE_ID no codigo.
O campo de voice ID esta escondido na UI.

### Animacoes

| Parametro | Valor |
|-----------|-------|
| Provider | Runway Gen-4 Turbo |
| API URL | `https://api.dev.runwayml.com/v1/image_to_video` |
| Status URL | `https://api.dev.runwayml.com/v1/tasks/${taskId}` |
| Modelo | `gen4_turbo` |
| Duracao | 10 segundos |
| Custo | 50 credits/clip ($0.50/clip) |

**IMPORTANTE:** A billing da API Runway e SEPARADA do plano Web App.
- Web App (dev.runwayml.com → plano Standard $15/mês) = credits para usar na interface web
- API credits = comprados separadamente em dev.runwayml.com → Manage → Billing
- Minimo: $10 = 1000 credits = 20 clips de 10s
- Vivianne JA comprou API credits (2026-04-10)

### Imagens

| Parametro | Valor |
|-----------|-------|
| Motor | Flux via fal.ai |
| LoRA trigger | `veus_figure` |
| Endpoint | `/api/admin/courses/generate-image-flux` |
| Resolucao | 1024x1024 (dataset LoRA) / widescreen (cenas video) |

### Montagem Final

| Parametro | Valor |
|-----------|-------|
| Motor | Shotstack API |
| **FALTA** | `SHOTSTACK_ENV=v1` no Vercel |

---

## Trailer do Canal — Estado Detalhado

**Curso:** geral, Hook: 0
**Titulo:** "Escola dos Veus — O que escondes de ti?"

| Passo | Estado | Notas |
|-------|--------|-------|
| Script | COMPLETO | 8 cenas com audio tags v3, todos os `[pause]` convertidos |
| Audio | COMPLETO | 8 cenas com audio gerado (voz JGnWZj684pcXmK2SxYIv, sem voice_settings) |
| Imagens | COMPLETO | 8 cenas com imagens Flux + LoRA |
| Animacoes | **EM CURSO** | 5/8 clips gerados (250 credits gastos). 3 faltam re-submeter (~150 credits) |
| Legendas | NAO INICIADO | Depende de audio + animacoes |
| Render final | NAO INICIADO | Shotstack — depende de tudo acima + SHOTSTACK_ENV |

**Nota (2026-04-10):** Havia um bug no polling de animacoes — ao recarregar a pagina, o polling nao
recomeçava e as animacoes ficavam presas em "A processar..." para sempre. Corrigido com:
- `scenesRef` para evitar stale closure no setInterval
- `useEffect` que auto-resume polling ao detectar animacoes em "processing"
- Ficheiro: `escola-veus-app/src/app/admin/producao/page.tsx`

---

## Bulk Audio — Geracao em Massa de Aulas (Abril 2026)

Pagina: `/admin/audio-bulk`

**O que faz:** carrega scripts em massa (YouTube Nomear ou cursos), gera audios via ElevenLabs, faz upload para Supabase Storage.

**Fluxo:**
1. Configurar voz + modelo na seccao "1. Voz"
2. Clicar botao "Carregar TODOS os 122 scripts YouTube" OU botao individual de curso ("So Ouro Proprio", "So Pele Nua", "So A Chama", etc.)
3. Clicar "Sincronizar com Supabase" — marca os que ja estao gerados (evita desperdicio de creditos)
4. Clicar "Gerar todos (pendentes)" — processa em fila
5. Cada aula e uma chamada a ElevenLabs → upload Supabase → URL guardado

**Endpoints:**
- `/api/admin/audio-bulk/test-voice` — sample curto, `maxDuration: 120`
- `/api/admin/audio-bulk/generate-one` — audio completo + upload Supabase, `maxDuration: 300`
- `/api/admin/audio-bulk/check-existing` — lista ficheiros ja existentes numa pasta

**Persistencia:** localStorage guarda progresso de scripts, modelo, language code, folder, voiceId. Sobrevive a reloads.

**Voz actual:** `UnchUh06d8TYP17TuqgU` (voz criada pela Vivianne, mistura PT-PT com africano).

**IMPORTANTE — ElevenLabs peculiaridades:**
- `eleven_v3` NAO aceita `language_code` — auto-deteca idioma. Enviar `language_code: "pt"` da erro 400.
- `eleven_multilingual_v2` aceita `language_code: "pt"` mas interpreta como pt-BR.
- Por isso o backend tem guard: `if (languageCode && modelId !== "eleven_v3") body.language_code = languageCode`
- v3 suporta tags `[pause]`, `[short pause]`, `[long pause]` nativamente.
- v2/turbo leem tags literalmente — backend converte para quebras de linha via `processTextForModel()`.

**Separacao de pastas Supabase (bucket `course-assets`):**
- `youtube/` — 122 scripts Nomear
- `curso-ouro-proprio/`, `curso-limite-sagrado/`, `curso-sangue-e-seda/`, `curso-o-silencio-que-grita/`, `curso-pele-nua/`, `curso-a-fome/`, `curso-a-chama/` — 24 aulas cada

**Derivacao automatica da pasta:** `folderFromPresetId()` em `page.tsx` linha ~93.

**Botoes rapidos:**
- "Carregar TODOS os cursos" (168 aulas de uma vez)
- Botoes individuais por curso
- "Carregar TODOS os 122 scripts YouTube"

---

## Revisao de Cursos (processo padrao)

Quando escreves um curso, depois de completo, LANCA um subagente para revisao antes de gerar audios.

**Brief do subagente (copiar/adaptar):**

```
Review the "<NOME_CURSO>" course scripts in /home/user/escola-veus/escola-veus-app/src/data/nomear-scripts.ts.

All script ids for this course start with "<slug>-m" — 8 modules x 3 sub-aulas = 24 scripts.

This is a Portuguese (PT-PT, NOT pt-BR) course on <TEMA>. Voice register = "nomeador" — contemplative, naming, NEVER didactic, NEVER mindfulness-guided, NEVER spiritual jargon, NEVER coach speak, NEVER visualizations.

CRITICAL CHECKS:
1. Mindfulness drift: "fecha os olhos", "respira fundo", "sente o teu corpo", "percorre o corpo com a atencao", "imagina-te", "visualiza".
2. Spiritual/coach jargon: "energia", "sagrado", "honra o teu X", "sintonia", "intencao", "manifestar", "abundancia", "deusa interior".
3. PT-BR contamination: "voce", brazilian spellings.
4. PT-PT verb errors 2nd person: "tu teve" -> "tiveste", enclise apos negacao ("nao X-se" -> "nao se X"), conjuntivo apos "talvez".
5. Typos: missing accents, palavras inexistentes, "abracar" metaforico (anglicismo).
6. Repetitive openings: count "Ha um/uma..." — flag if > 1/3.

For each module (m1-m8), list sub-aulas (A, B, C) with STRONG / MEDIUM / WEAK + line numbers.
Identify TOP 5 PRIORITY REWRITES.
End with typos list + line numbers.
Report in Portuguese. Under 1500 words.
```

**Depois da revisao:**
1. Ler output do subagente
2. Aplicar typos rapidos com `Edit` tool (cada um = 1 edit)
3. Aplicar reescritas prioritarias (criticas primeiro — mindfulness/body-scan)
4. Commit: `"<Curso>: correccoes pos-revisao\n\nTypos (N):\n- ...\n\nReescritas:\n- M?.?: ..."`
5. Push

---

## APIs e Contas Configuradas

| Servico | Chave | Estado |
|---------|-------|--------|
| ElevenLabs | `ELEVENLABS_API_KEY` | Configurado no Vercel |
| fal.ai (Flux + LoRA) | `FAL_KEY` | Configurado no Vercel |
| Runway Gen-4 | `RUNWAY_API_KEY` | Configurado — FALTA comprar API credits |
| Suno (musica instrumental) | `SUNO_API_KEY` + `SUNO_API_URL` | Configurado no Vercel |
| Shotstack (montagem cloud) | `SHOTSTACK_API_KEY` | Configurado no Vercel |
| Shotstack ambiente | `SHOTSTACK_ENV` | **FALTA: adicionar `v1` no Vercel** |
| Supabase | Ja configurado | Pronto |

---

## Endpoints API (todos prontos)

| Endpoint | Funcao |
|----------|--------|
| `/api/admin/courses/preview-script` | Parse do script em cenas |
| `/api/admin/courses/generate-scene-audio` | Audio por cena (ElevenLabs v3) |
| `/api/admin/courses/generate-image-flux` | Imagem por cena (Flux/fal.ai + LoRA) |
| `/api/admin/courses/submit-animation` | Clip animado (Runway Gen-4 / Hailuo) |
| `/api/admin/courses/animation-status` | Poll status animacao |
| `/api/admin/courses/generate-subtitles` | Legendas SRT + VTT |
| `/api/admin/courses/generate-music` | Musica instrumental (Suno) |
| `/api/admin/courses/save-manifest` | Guardar manifesto no Supabase |
| `/api/admin/courses/render-video` | Montagem final (Shotstack) |
| `/api/admin/courses/produce-video` | Orquestrador (botao unico) |
| `/api/admin/courses/create-dataset-zip` | ZIP de imagens para LoRA |
| `/api/admin/courses/train-lora` | Treinar LoRA via fal.ai |
| `/api/admin/courses/train-lora/status` | Poll status treino LoRA |

---

## Ecossistema de Dominios

| Dominio | O que e |
|---------|---------|
| `escola.seteveus.space` | Escola — 20 cursos, modulos, cadernos |
| `seteveus.space` | Site principal — livro interactivo "Os 7 Veus do Despertar" |
| `music.seteveus.space` | Musica original da Loranne — 1200+ faixas, 54 albuns |

---

## Decisoes Tomadas (actualizado Abril 2026)

| Decisao | Escolha | Razao |
|---------|---------|-------|
| Videos YouTube | Natureza realista (Africa/Mocambique) | ThinkDiffusion → Runway image-to-video → CLI → MP4 |
| Videos aulas (cursos) | Slides editorial escuro (#0d0d0d) | HTML+Puppeteer+FFmpeg, SEM voz no video |
| Imagens YouTube | ThinkDiffusion (SDXL RealVisXL) | $34 saldo, ~60-80 videos de imagens |
| Montagem | CLI local (Node+Puppeteer+FFmpeg) | Sem Shotstack, sem Remotion, sem cloud |
| Musica | Suno Pro API | Codigo avariado — fix urgente |
| Voz aulas (audio) | ElevenLabs, `UnchUh06d8TYP17TuqgU` | Voz criada pela Vivianne (pt-pt + africano) |
| Texto overlay YouTube | DM Serif Display + Nunito | Fade/rise/typewriter sobre clips Runway |
| Slides cursos | DM Serif Display + Nunito | Negro, creme, coral #E94560, roxo #533483 |
| Linguagem | pt-PT, registo nomeador | Publico feminino, contemplativo |
| ~~Conceito visual~~ | ~~Abolido~~ | ~~Silhuetas/territorios/LoRA descontinuados~~ |

---

## Proximas Accoes (por ordem de prioridade)

### FEITO nesta sessao (2026-04-16 sessao 2)

1. ✅ **Script batch ThinkDiffusion** — `tools/thinkdiffusion-batch/generate.js`
   - 22 prompts natureza realista Mocambique/Africa em `prompts.json`
   - Batch via API Automatic1111 (txt2img), 1920x1080, resume, dry-run
   - Mood selector (`select-by-mood.js`) para ligar prompts a temas de scripts
   - Uso: `node generate.js --url <ThinkDiffusion-URL> --dry-run`
2. ✅ **Fix Suno API** — model `V5_5` → `V4_5ALL` em `generate-music/route.ts`
   - V5_5 causava 404 na API.box. V4_5ALL e o mais capaz (8 min, 5000 chars)
   - Adicionado error logging HTTP para debug futuro
   - **TESTAR NO VERCEL** — confirmar que funciona com o deploy
3. ✅ **CLI escola-veus MVP** — `tools/escola-veus-cli/`
   - `escola-veus curso parse aula.md` → slides.json (frontmatter + split + duracao)
   - `escola-veus curso preview slides.json` → HTML preview com navegacao + play
   - Design editorial escuro (#0d0d0d, creme, coral, roxo) conforme pipeline

### PROXIMA SESSAO

1. **Vivianne: testar ThinkDiffusion batch** — lancar A1111 no ThinkDiffusion, correr `generate.js`
2. **Vivianne: testar Suno no Vercel** — confirmar que generate-music funciona apos deploy
3. **CLI render** — adicionar `escola-veus curso render` (Puppeteer + FFmpeg)
4. **Terminar audios ElevenLabs** pendentes (~178 por gerar, se creditos permitirem)

### Curto prazo — Primeiro video YouTube completo

1. Gerar imagens no ThinkDiffusion com `generate.js` (22 prompts prontos)
2. Alimentar Runway image-to-video com as imagens → clips 10s
3. Adicionar render ao CLI (Puppeteer + FFmpeg)
4. Montar 1 video piloto completo: clips + texto overlay + musica Suno → MP4
5. Publicar no YouTube + versao Shorts

### Medio prazo

1. Batch gerar imagens para todos os 122 hooks YouTube (~$15-20 ThinkDiffusion)
2. Batch gerar musicas Suno para cursos + YouTube
3. Construir Pipeline 1 cursos (slides editorial escuro + Suno → MP4)
4. Escrever mais cursos (13 restantes) quando necessario
5. Manuais PDF + cadernos exercicios

---

## Instrucoes para Sessoes Futuras

1. Ler este ficheiro (`CURSOS/PRODUCAO-STATUS.md`)
2. Ler `CURSOS/IDENTIDADE-VISUAL-VIDEOS.md` para identidade visual
3. Ler `CURSOS/ROADMAP-PRODUCAO-VIDEOS.md` para estrategia de conteudo
4. Verificar a "Proximas Accoes" acima
5. **Actualizar este ficheiro** no final da sessao com o progresso feito
6. Commit e push das alteracoes

**REGRAS CRITICAS — AUDIOS DAS AULAS (bulk audio):**
- Voice ID actual: `UnchUh06d8TYP17TuqgU` (voz criada pela Vivianne — pt-pt com africano)
- Voice ID antigo: `JGnWZj684pcXmK2SxYIv` (videos/trailer — NAO mudar para trailer)
- eleven_v3 NAO aceita `language_code` — guard no backend
- eleven_v2/turbo leem `[pause]` literalmente — backend converte para quebras de linha
- maxDuration: 300s para `generate-one`, 120s para `test-voice`
- Pasta Supabase derivada automaticamente do id do preset

**REGRAS CRITICAS — SCRIPTS DAS AULAS:**
- Registo "nomeador" (ver seccao Scripts das Aulas acima)
- PT-PT invioloavel (nao pt-BR, nao AO90 confuso)
- Cada aula: gesto EXTERNO em folha/caderno, NAO mindfulness interior
- Depois de escrever curso completo: LANCAR subagente de revisao com brief padrao
- Aplicar correcoes ANTES de gerar audios (creditos sao caros)

**REGRAS CRITICAS — PRODUCAO DE VIDEOS:**
- Voice ID `JGnWZj684pcXmK2SxYIv` — NUNCA mudar sem ordem explicita
- Sem voice_settings — NUNCA adicionar stability/similarity_boost
- Runway API URL: `api.dev.runwayml.com` — NAO mudar para api.runwayml.com
- LoRA trigger: `veus_figure` — usado automaticamente em `buildPrompt()`
- localStorage guarda progresso de producao MAS nunca guarda voiceId
- Polling de animacoes usa scenesRef (NAO scenes da closure) para evitar stale data
- Motion prompts gerados a partir da visualNote de cada cena (buildMotionPrompt), MOTION fixo e fallback
- Botao "Nova imagem" disponivel no passo 4 (animacoes) para re-gerar imagem de cena individual
- Musica: 3 faixas (abertura + instrumental + fecho). So "Comecar no seg:" — duracao calculada da cena
- Suno API: model corrigido de V5_5 para V4_5ALL. Testar no Vercel
- Prompts de imagem e animacao sao editaveis na UI (sem precisar deploy)

---

## Mapa de Ficheiros (referencia rapida)

```
CURSOS/
  PRODUCAO-STATUS.md                ← ESTE FICHEIRO
  IDENTIDADE-VISUAL-VIDEOS.md      ← identidade visual completa
  ROADMAP-PRODUCAO-VIDEOS.md       ← estrategia de conteudo + pipeline

escola-veus-app/src/
  data/
    courses.ts                      ← 20 cursos (estrutura)
    youtube-scripts.ts              ← hooks com cenas, timing, audio tags v3 (videos)
    nomear-scripts.ts               ← 122 scripts YouTube Nomear + 168 aulas de 7 cursos
    territory-themes.ts             ← cores por curso
    course-guidelines.ts            ← tom, estrutura, regras visuais

  app/admin/
    producao/page.tsx               ← wizard 6 passos (producao de videos)
    lora/page.tsx                   ← treinar LoRA (gerar + treinar)
    audio-bulk/page.tsx             ← gerar audios em massa das aulas

  app/api/admin/courses/
    generate-scene-audio/route.ts   ← ElevenLabs v3 por cena (videos)
    generate-image-flux/route.ts    ← Flux/fal.ai + LoRA
    submit-animation/route.ts       ← Runway Gen-4 / Hailuo
    animation-status/route.ts       ← Poll status animacao
    generate-subtitles/route.ts     ← SRT + VTT
    generate-music/route.ts         ← Suno instrumental
    render-video/route.ts           ← Shotstack montagem
    create-dataset-zip/route.ts     ← ZIP imagens para LoRA
    train-lora/route.ts             ← Treinar LoRA via fal.ai

  app/api/admin/audio-bulk/
    test-voice/route.ts             ← sample curto ElevenLabs (sem upload)
    generate-one/route.ts           ← audio completo + upload Supabase
    check-existing/route.ts         ← lista ficheiros ja existentes numa pasta

tools/
  thinkdiffusion-batch/
    generate.js                     ← batch A1111 API (ThinkDiffusion) → imagens 1920x1080
    prompts.json                    ← 22 prompts natureza Mocambique + config SDXL
    select-by-mood.js               ← seleccionar imagens por mood/tema
    output/                         ← imagens geradas (por categoria)

  escola-veus-cli/
    cli.js                          ← CLI principal: escola-veus curso parse/preview/render
    lib/curso-parse.js              ← parser Markdown → slides.json
    lib/curso-preview.js            ← gerador HTML preview
    lib/args.js                     ← utils CLI
```
