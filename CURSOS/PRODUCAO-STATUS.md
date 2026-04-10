# Escola dos Veus — Estado da Producao

**Ultima actualizacao:** 2026-04-10
**Actualizado por:** Claude Code

> Este ficheiro e a referencia unica de continuidade entre sessoes.
> Qualquer sessao nova DEVE ler este ficheiro antes de trabalhar na producao dos cursos.
> Actualizar SEMPRE este ficheiro no final de cada sessao de trabalho.

---

## Resumo do Estado

| Componente | Estado | Detalhe |
|-----------|--------|---------|
| Estrutura dos 20 cursos | COMPLETO | `src/data/courses.ts` — 20 cursos, 160 modulos, 480 sub-aulas |
| Guidelines de producao | COMPLETO | `src/data/course-guidelines.ts` — 706 linhas |
| Territorios visuais | COMPLETO | `src/data/territorios.ts` — 10 territorios mapeados |
| Identidade visual videos | COMPLETO | `CURSOS/IDENTIDADE-VISUAL-VIDEOS.md` — Conceito A: O Veu e o Corpo |
| Admin de producao (UI) | COMPLETO | `/admin/producao/` — wizard 6 passos |
| Admin LoRA (UI) | COMPLETO | `/admin/lora/` — gerar + treinar automaticamente |
| APIs de producao | COMPLETO | Todos os endpoints prontos (audio, imagem, animacao, legendas, musica, render) |
| Scripts YouTube | EM CURSO | V1 (13 hooks) + V2 (1 hook) + Trailer — todos com audio tags v3 |
| LoRA treinado | COMPLETO | Treinado com 11 imagens via fal.ai, trigger: `veus_figure` |
| **Trailer do canal** | **EM CURSO** | **8 cenas com audio + imagens geradas. Animacoes pendentes (Runway credits)** |
| Scripts das aulas | EM CURSO | 24/480 scripts escritos (Ouro Proprio completo — DRAFT) |
| Manuais (PDF) | EM CURSO | 1/20 manuais escritos (Ouro Proprio — DRAFT) + pipeline PDF |
| Cadernos exercicios | EM CURSO | 8/160 cadernos escritos (Ouro Proprio — DRAFT) |

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
- A Vivianne JA tem plano Standard mas PRECISA comprar API credits separadamente

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
| Animacoes | **BLOQUEADO** | Precisa de API credits Runway (min $10 em dev.runwayml.com → Billing) |
| Legendas | NAO INICIADO | Depende de audio + animacoes |
| Render final | NAO INICIADO | Shotstack — depende de tudo acima + SHOTSTACK_ENV |

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
| Conceito visual | Conceito A: O Veu e o Corpo | Unico que traduz o nome da escola em imagem |
| Montagem cloud | Shotstack API | Sem AWS, sem CLI, 100% web |
| Animacao principal | Runway Gen-4 Turbo API | Melhor qualidade (Hailuo/fal.ai como fallback) |
| Imagens | Flux via fal.ai + LoRA treinado | Rapido, barato, estilo consistente |
| Musica de fundo | Suno (instrumental) + Loranne (cenas sem narracao) | Original, sem direitos |
| Voz | ElevenLabs v3, ID `JGnWZj684pcXmK2SxYIv` | NAO e clone — voz pre-existente, rapida e conversacional |
| voice_settings | NENHUM | Usar defaults naturais da voz |
| language_code | `"pt"` | "pt-pt" nao funciona com v3 |
| Frequencia | 2 videos/semana | Ritmo de crescimento |
| Linguagem | Genero neutro / inclusivo | Publico feminino mas acessivel a todos |
| LoRA trigger | `veus_figure` | Treinado com 11 imagens, Conceito A |

---

## Proximas Accoes (por ordem de prioridade)

### Imediato (bloqueadores)

1. **Vivianne:** Comprar API credits Runway em dev.runwayml.com → Manage → Billing (min $10)
2. **Vivianne:** Adicionar `SHOTSTACK_ENV=v1` no Vercel

### Apos desbloquear Runway

3. Submeter 8 animacoes do trailer
4. Gerar legendas do trailer
5. Gerar musica instrumental do trailer (Suno)
6. Render final do trailer (Shotstack)
7. Aprovar e publicar trailer no YouTube

### Curto prazo

8. Produzir primeiro video completo (Limite Sagrado hook 1)
9. Produzir Ouro Proprio hook 1 (v2 reescrito)
10. Criar Shorts a partir dos videos produzidos

---

## Instrucoes para Sessoes Futuras

1. Ler este ficheiro (`CURSOS/PRODUCAO-STATUS.md`)
2. Ler `CURSOS/IDENTIDADE-VISUAL-VIDEOS.md` para identidade visual
3. Ler `CURSOS/ROADMAP-PRODUCAO-VIDEOS.md` para estrategia de conteudo
4. Verificar a "Proximas Accoes" acima
5. **Actualizar este ficheiro** no final da sessao com o progresso feito
6. Commit e push das alteracoes

**REGRAS CRITICAS:**
- Voice ID `JGnWZj684pcXmK2SxYIv` — NUNCA mudar sem ordem explicita
- Sem voice_settings — NUNCA adicionar stability/similarity_boost
- Runway API URL: `api.dev.runwayml.com` — NAO mudar para api.runwayml.com
- LoRA trigger: `veus_figure` — usado automaticamente em `buildPrompt()`
- localStorage guarda progresso de producao MAS nunca guarda voiceId

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
    youtube-scripts.ts              ← hooks com cenas, timing, audio tags v3
    territory-themes.ts             ← cores por curso
    course-guidelines.ts            ← tom, estrutura, regras visuais

  app/admin/
    producao/page.tsx               ← wizard 6 passos (producao de videos)
    lora/page.tsx                   ← treinar LoRA (gerar + treinar)

  app/api/admin/courses/
    generate-scene-audio/route.ts   ← ElevenLabs v3 por cena
    generate-image-flux/route.ts    ← Flux/fal.ai + LoRA
    submit-animation/route.ts       ← Runway Gen-4 / Hailuo
    animation-status/route.ts       ← Poll status animacao
    generate-subtitles/route.ts     ← SRT + VTT
    generate-music/route.ts         ← Suno instrumental
    render-video/route.ts           ← Shotstack montagem
    create-dataset-zip/route.ts     ← ZIP imagens para LoRA
    train-lora/route.ts             ← Treinar LoRA via fal.ai
```
