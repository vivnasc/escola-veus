# Roadmap de Producao de Videos — Escola dos Veus

**Criado:** 2026-04-06
**Actualizado:** 2026-04-07 (nova estrategia de conteudo + pipeline completo)
**Para:** Vivianne

---

## Visao geral

**Pipeline 100% web, 100% automatizado.**
Aprovas scripts, clicas num botao, recebes MP4 pronto para YouTube.
Sem CLI, sem edicao manual, sem software local.

```
  TU APROVAS ──→ MAQUINA FAZ TUDO ──→ VIDEO PRONTO
  O SCRIPT        (~30 min)            PARA YOUTUBE
```

**Frequencia:** 2 videos por semana

---

## Estrategia de conteudo YouTube

### Posicionamento

**"A School of Life portuguesa, mas mais quente e encorpada."**

- Tom: professor/a acolhedor/a que fala com clareza (nao terapeuta em sessao)
- Camada terapeutica presente mas ao servico do ensino
- Publico maioritariamente feminino, mas linguagem inclusiva (genero neutro)
- PT-PT (mercado subservido vs PT-BR — vantagem competitiva)
- Visual: silhuetas sem genero, territorios dos veus, navy + terracota + dourado

### Principios dos scripts

| Principio | O que significa |
|-----------|-----------------|
| **Ensinar, nao so acolher** | Cada video ensina algo concreto que o espectador leva consigo |
| **Frameworks com nome** | Dar nome aos padroes: "O Veu da Heranca Financeira", "O Ciclo do Abandono" |
| **60/25/15** | 60% ensino acessivel + 25% storytelling + 15% exercicio pratico |
| **Inclusivo sem ser forcado** | Usar "voce/tu", "pessoas", "quem sente..." — sem "todxs" nem genero forcado |
| **Respeitar a inteligencia** | Nao simplificar demais — o publico ja busca autoconhecimento |
| **Metafora > jargao** | "E como se houvesse um veu entre ti e o que realmente sentes" |

### Nova estrutura de cada video (12-15 min)

| Seccao | Duracao | O que faz |
|--------|---------|-----------|
| **Gancho** | 15-20 seg | Pergunta ou cenario que prende |
| **Reconhecimento** | 40-60 seg | Cenario do dia-a-dia — curto, certeiro |
| **Framework** | 3-4 min | Ensina o conceito com nome ("O Veu de X funciona assim...") |
| **Exemplo** | 2-3 min | Historia concreta que ilustra o framework |
| **Exercicio** | 1-2 min | Pratica simples para fazer hoje |
| **Reframe** | 30-40 seg | Frase de fecho que muda a perspectiva |
| **CTA** | 20-30 seg | Curso especifico + modulo + subscricao |

### Estrutura anterior (a substituir)

A estrutura antiga (abertura → pergunta → situacao → revelacao → gesto → frase_final → cta → fecho) tinha problemas:
- Seccao "situacao" demasiado longa (70-150 seg) — causa drop-off
- Faltava ensino concreto (so validacao emocional)
- CTAs genericos ("se isto te tocou, subscreve")
- Linguagem demasiado feminina em vez de inclusiva

**Todos os hooks existentes precisam de ser reescritos** com a nova estrutura.

### Titulos e thumbnails

- **Titulos que identificam o problema:** "Porque dizes sim quando queres dizer nao"
- **Sem clickbait exagerado** — este publico rejeita manipulacao
- **Thumbnails:** silhueta + 3-5 palavras max + paleta quente
- **Formato:** pergunta directa ou espelho de identidade ("Se sentes demais, ve isto")

### Shorts (vertical)

- 2-3 Shorts por cada video longo
- Cortados dos momentos mais fortes do video
- Formato: reframe rapido, citacao com peso, "uma coisa que aprendi"
- Servem para descoberta — nao convertem sozinhos

### Funil de conversao

```
YouTube (ensino gratuito, valor real)
  → Quiz: "Qual veu esta mais presente na tua vida?"
  → Email (3-5 emails com valor adicional)
  → Curso pago (profundidade + estrutura + acompanhamento)
```

**Principio:** YouTube da valor REAL. O curso vende o contentor (estrutura, comunidade, guia) — nao a informacao.

---

## Prioridade de producao (primeiros 20 videos)

### Fase 1: Fundacao (semanas 1-2)

| # | Video | Curso | Porque |
|---|-------|-------|--------|
| 1 | Trailer do canal (90 seg) | Geral | Apresentar os veus e o canal |
| 2 | "Porque dizes sim quando queres dizer nao" | Limite Sagrado | Tema trending, altamente pesquisavel |
| 3 | "Porque sentes culpa quando gastas contigo" | Ouro Proprio | Hook 1 reescrito com nova estrutura |
| 4 | "O que herdaste sem saber" | Sangue e Seda | Heranca emocional — topico forte |

### Fase 2: Crescimento (semanas 3-5)

| # | Video | Curso | Porque |
|---|-------|-------|--------|
| 5 | "A fome que nao e de comida" | A Fome | Gancho fortissimo |
| 6 | "Recomecar quando a vida obriga" | Depois do Fogo | Publico amplo |
| 7 | "Porque engoles o que precisas de dizer" | Voz de Dentro | Universal |
| 8 | "O preco de pertencer" | A Teia | Relacional |
| 9 | "Porque essa pessoa te irrita tanto" | O Espelho do Outro | Curiosidade natural |
| 10 | "O corpo sabe antes de ti" | Pele Nua | Somático — diferenciador |

### Fase 3: Profundidade (semanas 6-10)

| # | Video | Curso | Porque |
|---|-------|-------|--------|
| 11 | "O segredo que a familia toda sabe" | O Silencio que Grita | Familia |
| 12 | "Porque choras sem razao aparente" | O Fio Invisivel | Emocional |
| 13 | "Porque o cansaco nao passa com ferias" | O Oficio de Ser | Burnout |
| 14 | "Porque sentes que ja e tarde demais" | O Relogio Partido | Medo do tempo |
| 15-20 | Hooks 2 e 3 dos cursos com melhor desempenho | Variavel | Baseado em dados |

**Ritmo:** 2 videos/semana = 10 semanas para os primeiros 20 videos.

---

## Pipeline tecnico (ESTADO ACTUAL)

### Infraestrutura — TUDO FEITO

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1. SCRIPT (tu aprovas no wizard de 6 passos)                │
│     ↓ parse automatico em cenas com timing                   │
│                                                              │
│  2. VOZ ──→ ElevenLabs API (por cena)            ~2 min     │
│     ↓ gera MP3 com timestamps por palavra                    │
│     ↓ upload individual: courses/{slug}/audio/               │
│                                                              │
│  3. IMAGENS ──→ Flux Schnell via fal.ai          ~3 min     │
│     ↓ gera 1 imagem por cena                                 │
│     ↓ upload: courses/{slug}/images/                         │
│                                                              │
│  4. ANIMACAO ──→ Runway Gen-4 API                ~15 min    │
│     ↓ cada imagem vira clip animado de 5-10s                 │
│     ↓ upload: courses/{slug}/videos/                         │
│                                                              │
│  5. LEGENDAS ──→ Automaticas SRT + VTT           ~instant   │
│     ↓ geradas a partir dos timestamps da narracao            │
│                                                              │
│  6. MUSICA ──→ Suno API (instrumental)           ~2 min     │
│     ↓ make_instrumental: true                                │
│     ↓ upload: courses/{slug}/music/                          │
│                                                              │
│  7. MONTAGEM ──→ Shotstack API (cloud)           ~5 min     │
│     ↓ junta clips + audio + texto + musica + transicoes      │
│     ↓ renderiza MP4 1080p na cloud (sem AWS)                 │
│     ↓ upload: courses/{slug}/final/                          │
│                                                              │
│  8. PRONTO ──→ Supabase Storage                              │
│     ↓ ver, aprovar ou pedir ajustes                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### APIs e contas configuradas

| Servico | Chave | Estado |
|---------|-------|--------|
| ElevenLabs | `ELEVENLABS_API_KEY` | Configurado no Vercel |
| fal.ai (Flux Schnell) | `FAL_KEY` | Configurado no Vercel |
| Runway Gen-4 | `RUNWAY_API_KEY` | Configurado no Vercel |
| Suno (musica instrumental) | `SUNO_API_KEY` + `SUNO_API_URL` | Configurado no Vercel |
| Shotstack (montagem cloud) | `SHOTSTACK_API_KEY` | Configurado no Vercel |
| Shotstack ambiente | `SHOTSTACK_ENV` | **FALTA: adicionar `v1` no Vercel** |
| Supabase | Ja configurado | Pronto |

### Endpoints API (todos prontos)

| Endpoint | Funcao |
|----------|--------|
| `/api/admin/courses/preview-script` | Parse do script em cenas |
| `/api/admin/courses/generate-scene-audio` | Audio por cena (ElevenLabs) |
| `/api/admin/courses/generate-image` | Imagem por cena (Flux/fal.ai) |
| `/api/admin/courses/submit-animation` | Clip animado por cena (Runway) |
| `/api/admin/courses/generate-subtitles` | Legendas SRT + VTT |
| `/api/admin/courses/generate-music` | Musica instrumental (Suno) |
| `/api/admin/courses/save-manifest` | Guardar manifesto no Supabase |
| `/api/admin/courses/render-video` | Montagem final (Shotstack) |
| `/api/admin/courses/produce-video` | Orquestrador (botao unico) |

### Pagina de producao (wizard 6 passos)

Acessivel em `/admin/producao`. Permite controlo granular de cada asset:

1. **Script** — editar narracoes, aprovar
2. **Audio** — gerar por cena, re-gerar individualmente
3. **Imagens** — gerar por cena, rever grelha, re-gerar individualmente
4. **Animacoes** — submeter por cena, verificar estado, re-submeter
5. **Legendas** — auto SRT/VTT, editar, download
6. **Resultado** — gerar musica com Suno, render MP4, download manifesto

---

## Custo por video (actualizado)

| Componente | Ferramenta | Custo estimado |
|-----------|-----------|----------------|
| Voz narrada | ElevenLabs API | ~0.30€ |
| Imagens (8 cenas) | Flux Schnell via fal.ai | ~0.10€ |
| Animacao (8 clips) | Runway Gen-4 API | ~2.00€ |
| Musica instrumental | Suno API | ~0.10€ |
| Montagem final | Shotstack API | ~0.50€ |
| **TOTAL por video** | | **~3€** |

**2 videos/semana = ~6€/semana = ~26€/mes**

---

## Scripts: estado actual e trabalho pendente

### O que existe (13 hooks escritos, estrutura ANTIGA — a reescrever)

| Curso | Hooks | Estado |
|-------|-------|--------|
| Ouro Proprio | 3 | Draft — reescrever com nova estrutura |
| O Fio Invisivel | 1 | Draft — reescrever |
| O Espelho do Outro | 1 | Draft — reescrever |
| O Silencio que Grita | 1 | Draft — reescrever |
| A Teia | 1 | Draft — reescrever |
| A Chama | 1 | Draft — reescrever |
| A Mulher Antes de Mae | 1 | Draft — reescrever |
| O Oficio de Ser | 1 | Draft — reescrever |
| O Relogio Partido | 1 | Draft — reescrever |
| A Coroa Escondida | 1 | Draft — reescrever |
| A Fome | 1 | Draft — reescrever |

### O que falta (cursos sem nenhum hook YouTube)

| Curso | Tema | Prioridade |
|-------|------|------------|
| **Limite Sagrado** | Limites, o preco de agradar, culpa de recusar | ALTA |
| **Sangue e Seda** | Heranca invisivel mae/filha | ALTA |
| **Depois do Fogo** | Recomecar quando a vida obriga | ALTA |
| **Voz de Dentro** | Dizer o que precisas de dizer | ALTA |
| **Pele Nua** | Ouvir o corpo antes da mente | MEDIA |
| **A Arte da Inteireza** | Amar sem te perderes | MEDIA |
| **Olhos Abertos** | Decidir com clareza, nao com medo | MEDIA |
| **Flores no Escuro** | Perdas que nao sao morte mas doem como tal | MEDIA |
| **O Peso e o Chao** | Quando o descanso nao resolve | MEDIA |

### Trabalho total de scripts

- **13 hooks existentes** a reescrever (nova estrutura)
- **9 cursos** sem hooks (escrever 1-3 hooks cada)
- **1 trailer** do canal (90 seg)
- **Estimativa:** ~35-40 scripts no total para cobrir todos os cursos com 2 hooks cada

---

## Decisoes tomadas

| Decisao | Escolha | Razao |
|---------|---------|-------|
| Montagem cloud | Shotstack API | Sem AWS, sem CLI, 100% web |
| Animacao principal | Runway Gen-4 API | Melhor qualidade |
| Imagens | Flux Schnell via fal.ai | Rapido, barato, boa qualidade |
| Musica de fundo | Suno API (instrumental) | Gera musica original, sem direitos |
| Voz | ElevenLabs v3 (PT) | Clone da Vivianne |
| Frequencia | 2 videos/semana | Ritmo de crescimento |
| Linguagem | Genero neutro / inclusivo | Publico feminino mas acessivel a todos |
| Estrutura video | Nova (gancho→reconhecimento→framework→exemplo→exercicio→reframe→CTA) | Didactica + terapeutica |
| Tom | Professor/a acolhedor/a | Nao terapeuta em sessao |

## Decisoes por tomar

| Decisao | Opcoes | Nota |
|---------|--------|------|
| Preco dos cursos | ? | Ainda por definir |
| Quiz dos veus | Typeform / custom | Para funil de conversao |
| Canal secundario EN | Sim/Nao | Depois de PT estabilizar |

---

## Proximas accoes

### Imediato (esta semana)

1. **Vivianne:** Adicionar `SHOTSTACK_ENV=v1` no Vercel
2. **Tecnico:** Reescrever Hook 1 do Ouro Proprio com nova estrutura (modelo para todos)
3. **Vivianne:** Rever e aprovar o novo Hook 1

### Curto prazo (proximas 2 semanas)

4. Escrever trailer do canal (90 seg)
5. Escrever hooks para Limite Sagrado, Sangue e Seda, Depois do Fogo, Voz de Dentro
6. Produzir primeiro video end-to-end (teste completo do pipeline)
7. Vivianne: aprovar ou pedir ajustes

### Medio prazo (semanas 3-10)

8. Reescrever todos os hooks existentes com nova estrutura
9. Produzir 2 videos/semana seguindo a ordem de prioridade
10. Criar Shorts a partir dos videos produzidos
11. Montar funil: quiz dos veus → email → curso

---

## Mapa de ficheiros

```
CURSOS/
  ROADMAP-PRODUCAO-VIDEOS.md        ← ESTE FICHEIRO
  PRODUCAO-STATUS.md                ← estado da producao
  imagens/                          ← imagens para LoRA

escola-veus-app/src/
  data/
    courses.ts                      ← 20 cursos (estrutura)
    course-scripts/ouro-proprio.ts  ← 24 scripts aulas (DRAFT)
    course-youtube/ouro-proprio.ts  ← 3 scripts YouTube (DRAFT — a reescrever)
    youtube-scripts.ts              ← hooks detalhados (DRAFT — a reescrever)
    youtube-calendar.ts             ← calendario publicacao
    youtube-scripts.ts              ← scripts com cenas e timing
    territory-themes.ts             ← cores por curso
    course-guidelines.ts            ← tom, estrutura, regras visuais

  app/admin/producao/page.tsx       ← wizard 6 passos

  app/api/admin/courses/
    preview-script/route.ts         ← parse de scripts
    generate-scene-audio/route.ts   ← ElevenLabs por cena
    generate-image/route.ts         ← Flux/fal.ai
    submit-animation/route.ts       ← Runway Gen-4
    generate-subtitles/route.ts     ← SRT + VTT
    generate-music/route.ts         ← Suno instrumental
    save-manifest/route.ts          ← manifesto Supabase
    render-video/route.ts           ← Shotstack montagem
    produce-video/route.ts          ← orquestrador

  remotion/
    VideoComposition.tsx            ← composicao Remotion (fallback)
    Root.tsx                        ← registo Remotion
```
