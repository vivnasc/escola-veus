# Roadmap de Producao de Videos — Escola dos Veus

**Criado:** 2026-04-06
**Actualizado:** 2026-04-06 (pipeline 100% automatizado, sem edicao manual)
**Para:** Vivianne

---

## Visao geral: pipeline 100% automatizado

**Nao vais editar video nenhum.** Nao vais abrir CapCut, DaVinci, nem nada.
Vais aprovar scripts, carregar num botao, e receber um MP4 pronto para YouTube.

```
  TU APROVAS ──→ MAQUINA FAZ TUDO ──→ VIDEO PRONTO
  O SCRIPT        (~30 min)            PARA YOUTUBE
```

### Como funciona (por dentro):

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1. SCRIPT (ja existe, tu aprovas)                           │
│     ↓ parse automatico em cenas com timing                   │
│                                                              │
│  2. VOZ ──→ ElevenLabs API                        ~2 min    │
│     ↓ gera MP3 com a tua voz clonada                        │
│     ↓ devolve timestamps por palavra (para sync do texto)    │
│                                                              │
│  3. IMAGENS ──→ ComfyUI / ThinkDiffusion         ~10 min    │
│     ↓ gera 1 imagem por cena (8 cenas)                      │
│     ↓ usa o modelo LoRA do Mundo dos Veus                    │
│                                                              │
│  4. ANIMACAO ──→ Runway Gen-4 API                ~15 min    │
│     ↓ cada imagem vira um clip animado de 5-10s              │
│     ↓ movimentos subtis: respiracao, particulas, dissolves   │
│                                                              │
│  5. MONTAGEM ──→ Remotion (React automatico)      ~2 min    │
│     ↓ junta clips + audio + texto + musica + transicoes      │
│     ↓ renderiza MP4 1080p automaticamente                    │
│                                                              │
│  6. PRONTO ──→ Supabase Storage                              │
│     ↓ recebes notificacao: "o teu video esta pronto"         │
│     ↓ ves, aprovas ou pedes ajustes                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

TEMPO TOTAL: ~30 minutos (automatico, sem tocar em nada)
```

---

## Custo por video

| Componente | Ferramenta | Custo | Nota |
|-----------|-----------|-------|------|
| Voz narrada | ElevenLabs API | ~0.30€ | 5 min de audio |
| Imagens (8 cenas) | ComfyUI/ThinkDiffusion | ~0.50€ | GPU ~$0.99/h |
| Animacao (8 clips) | Runway Gen-4 API | ~2.00€ | $0.024/seg, 10s cada |
| Montagem final | Remotion | ~0.05€ | Rendering local ou Lambda |
| **TOTAL por video** | | **~3€** | |

**Setup unico (uma vez):**

| Item | Custo | Nota |
|------|-------|------|
| Treinar LoRA | ~3-5€ | 59 imagens, ~3h GPU. Uma vez. |
| Musica ambiente (pack) | 0€ | CC0 do Pixabay/Freesound |
| Contas (ElevenLabs + ThinkDiffusion + Runway) | Variavel | Free tiers para testar |

---

## APIs de animacao IA disponíveis (Abril 2026)

| Modelo | Qualidade | Custo/10s | API | Nota |
|--------|-----------|-----------|-----|------|
| **Runway Gen-4** | 10/10 | ~$0.24 | Sim | Melhor qualidade. Recomendado. |
| **Minimax Hailuo 2.3** | 8.5/10 | ~$0.25 | Sim | Melhor custo/qualidade. Alternativa. |
| Kling 3.0 | 9/10 | ~$2.50 | Via fal.ai | Bom para consistencia, mas caro |
| Luma Ray 2 | 8/10 | ~$0.25 | Sim | Movimento natural |
| Google Veo 3.1 | 9.5/10 | ~$1.50 | Sim | 4K, mas caro |
| Wan 2.1 (ja temos) | 7.5/10 | GPU only | Self-hosted | Opcao gratis, ja configurado |

**Estrategia:** Runway Gen-4 como principal. Hailuo como fallback barato. Wan 2.1 como opcao gratis.
**Gateway unico:** fal.ai da acesso a todos estes modelos com uma so API key.

---

## Montagem automatica: Remotion

**Remotion** e um framework React/TypeScript que renderiza video programaticamente.
E exactamente o mesmo stack do nosso projecto (Next.js + React).

Em vez de abrir um editor de video, escrevemos componentes React que definem:
- Onde cada clip aparece na timeline
- Quando e onde o texto aparece (sincronizado com a voz)
- Que transicoes usar entre cenas (dissolves lentos)
- Volume e timing da musica de fundo
- Tudo renderizado automaticamente para MP4 1080p

**Porque Remotion e nao CapCut/ffmpeg:**
- Mesmo stack (React/TypeScript) — reutiliza componentes, fonts, cores
- Texto com CSS completo (Playfair Display, animacoes, sombras)
- Sincronizacao audio frame-a-frame (timestamps do ElevenLabs)
- Renderiza na cloud (Lambda) por ~$0.01-0.05 por video
- Gratis para equipas ate 3 pessoas
- Reproducivel: mesmo input = mesmo output (nao depende de "arrastar bem")

---

## O estilo visual: "School of Life, mas nosso"

Os videos da School of Life usam:
- Ilustrador humano (estilo flat/cartoon)
- Animacao After Effects manual (motion graphics)
- Locutor profissional
- 6-10 minutos

**A nossa versao:**
- Voz da Vivianne (clone ElevenLabs) — calma, proxima, contemplativa
- Silhuetas femininas em terracota/dourado (sem rosto, universais)
- Paisagens de territorio (cada curso tem o seu "mundo" visual)
- Fundo navy-blue profundo (#1A1A2E) — "o momento antes da madrugada"
- Texto creme (#F5F0E6) em Playfair Display / Cormorant Garamond
- Zero cortes bruscos — tudo dissolve, tudo respira
- Particulas flutuantes (po dourado, brasas, nevoa)
- Animacao IA (Runway Gen-4) — movimento subtil, cinematico

**A diferenca:** School of Life e intelectual/explicativa. Nos somos corporais/poeticas.
A aluna nao deve pensar "que interessante" — deve sentir "isto sou eu".

Com Runway Gen-4 a qualidade da animacao esta ao nivel ou acima da School of Life.
O estilo e diferente (nao e cartoon), mas e igualmente profissional e distinto.

---

## O que ja existe vs. o que falta

```
                        OURO PROPRIO (1o curso)
  ┌──────────────────────────────────────────────────────┐
  │  CONTEUDO ESCRITO                         TUDO FEITO │
  │  ├── 24 scripts de aulas (8 modulos x 3)     DRAFT  │
  │  ├── 1 manual (8 capitulos)                   DRAFT  │
  │  ├── 8 cadernos de exercicios                 DRAFT  │
  │  └── 3 scripts YouTube (hooks)                DRAFT  │
  ├──────────────────────────────────────────────────────┤
  │  INFRAESTRUTURA API                       TUDO FEITO │
  │  ├── API de audio (ElevenLabs)               PRONTO  │
  │  ├── API de imagem (ComfyUI/ThinkDiffusion)  PRONTO  │
  │  ├── API de video clips (Wan 2.1)            PRONTO  │
  │  ├── Sistema visual (cores, particulas)      PRONTO  │
  │  ├── Workflows ComfyUI (3 tipos)             PRONTO  │
  │  └── Admin dashboard                         PRONTO  │
  ├──────────────────────────────────────────────────────┤
  │  PIPELINE AUTOMATIZADO                    A CONSTRUIR │
  │  ├── Animacao Runway Gen-4 API              POR FAZER │
  │  ├── Montagem Remotion (React)              POR FAZER │
  │  ├── Orquestrador (botao "Produzir")        POR FAZER │
  │  └── Treinar LoRA (estilo visual)           POR FAZER │
  ├──────────────────────────────────────────────────────┤
  │  BLOQUEIO HUMANO                                      │
  │  └── Aprovacao dos scripts pela Vivianne    BLOQUEIO  │
  └──────────────────────────────────────────────────────┘
```

---

## Fases do projecto

### FASE 0: SETUP (uma vez)

| Passo | O que | Como | Estado |
|-------|-------|------|--------|
| 0.1 | Conta ElevenLabs | Criar conta, verificar clone de voz | Feito (chave necessaria) |
| 0.2 | Conta ThinkDiffusion | Hobby $0.99/h ou Pro $19.99/mes | Por fazer |
| 0.3 | Conta Runway | Criar conta, obter API key | Por fazer |
| 0.4 | Treinar LoRA | 59 imagens → modelo visual (~3h, ~5€) | Por fazer |
| 0.5 | Instalar Remotion | `npm i remotion @remotion/cli` | Por fazer |
| 0.6 | Musica ambiente | Descarregar 2-3 texturas CC0 | Por fazer |

### FASE 1: APROVAR SCRIPTS (o teu trabalho, Vivianne)

**Comeca por aqui. Nada avanca sem isto.**

| O que rever | Ficheiro | Qtd |
|-------------|----------|-----|
| Scripts YouTube (hooks) | `src/data/course-youtube/ouro-proprio.ts` | 3 |
| Scripts detalhados (cena a cena) | `src/data/youtube-scripts.ts` | 1 completo |
| Scripts das 24 aulas | `src/data/course-scripts/ouro-proprio.ts` | 24 |

**Sugestao:** comeca pelo YouTube Hook 1 — "Porque sentes culpa quando gastas dinheiro em ti mesma?"
E o primeiro video que vai existir. Se este funcionar, os outros seguem.

**Como rever:** Le o script. Pergunta "isto soa a mim?". Marca APROVADO ou deixa notas.

### FASE 2: CONSTRUIR PIPELINE (trabalho tecnico)

| Passo | O que | Detalhe |
|-------|-------|---------|
| 2.1 | API Runway Gen-4 | Nova route: `/api/admin/courses/animate-runway` |
| 2.2 | Composicao Remotion | Template React para montar video automaticamente |
| 2.3 | Orquestrador | Route `/api/admin/courses/produce-video` — botao unico |
| 2.4 | Pagina admin | UI para ver progresso e aprovar resultado |

### FASE 3: PRODUZIR PRIMEIRO VIDEO

```
□ Vivianne aprova Hook 1
□ Clicar "Produzir" no admin
□ Pipeline corre (~30 min):
    → gera audio (ElevenLabs)
    → gera 8 imagens (ComfyUI)
    → anima 8 clips (Runway Gen-4)
    → monta video final (Remotion)
□ Vivianne ve o resultado
□ Aprovar ou pedir ajustes
□ Publicar no YouTube
```

### FASE 4: ESCALAR

Uma vez que o primeiro funcione:
- Produzir Hook 2 e Hook 3 (mesmo pipeline)
- Produzir as 24 aulas do curso (mesmo pipeline, mais cenas)
- Comecar o segundo curso (Limite Sagrado)

---

## Decisoes tomadas

| Decisao | Escolha | Razao |
|---------|---------|-------|
| Montagem | Remotion (automatica) | Mesmo stack, zero edicao manual |
| Animacao principal | Runway Gen-4 API | Melhor qualidade, preco razoavel |
| Animacao fallback | Minimax Hailuo 2.3 | Mais barato, boa qualidade |
| Animacao gratis | Wan 2.1 (ja temos) | Para testes e opcao de custo zero |
| API gateway | fal.ai (opcional) | Acesso unificado a varios modelos |

## Decisoes por tomar

| Decisao | Opcoes | Nota |
|---------|--------|------|
| Musica ambiente | CC0 gratis / Epidemic Sound / Artlist | Testar CC0 primeiro |
| Pseudonimo | Nome real / pseudonimo | Deve funcionar em PT e EN |
| Preco dos cursos | ? | Ainda por definir |

---

## Mapa de ficheiros

```
CURSOS/
  PRODUCAO-STATUS.md                ← estado da producao
  ROADMAP-PRODUCAO-VIDEOS.md        ← ESTE FICHEIRO
  imagens/                          ← 59 imagens para LoRA
  lora-training/                    ← configs de treino

escola-veus-app/src/
  data/
    course-guidelines.ts            ← tom, estrutura, regras visuais
    courses.ts                      ← 20 cursos (estrutura)
    course-scripts/ouro-proprio.ts  ← 24 scripts aulas (DRAFT)
    course-youtube/ouro-proprio.ts  ← 3 scripts YouTube (DRAFT)
    youtube-scripts.ts              ← scripts detalhados (cena a cena)
    youtube-calendar.ts             ← calendario publicacao
    territory-themes.ts             ← cores por curso

  app/api/admin/courses/
    generate-audio/route.ts         ← ElevenLabs (voz)
    generate-image/route.ts         ← ComfyUI (imagens)
    generate-video/route.ts         ← Wan 2.1 (clips)
    animate-runway/route.ts         ← Runway Gen-4 (animacao) ← NOVO
    produce-video/route.ts          ← Orquestrador (botao unico) ← NOVO

  remotion/
    VideoComposition.tsx            ← Template Remotion ← NOVO
    scenes/                         ← Componentes por tipo de cena ← NOVO

  lib/
    comfyui-workflows.ts            ← workflows ComfyUI
    video-visuals.ts                ← paletas, composicoes
```

---

## Proxima accao

1. **Vivianne:** Le e aprova o script do YouTube Hook 1
2. **Tecnico:** Construir o pipeline automatizado (Runway + Remotion + orquestrador)
3. **Teste:** Produzir o primeiro video end-to-end
