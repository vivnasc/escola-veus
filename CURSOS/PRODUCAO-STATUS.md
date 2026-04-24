# Escola dos Véus — Estado da Produção

**Última actualização:** 2026-04-24 (sessão 8 pt. 2 — autonomia editorial + render MP4 Mock B)

> Ficheiro único de continuidade entre sessões. Ler no início de cada sessão nova.
> Actualizar no fim. Histórico antigo em `_arquivo-historico/INDEX.md`.

---

## Última sessão (8 pt. 2 — 2026-04-24)

**Autonomia editorial no preview Mock B + pipeline HTML→MP4 (Puppeteer + FFmpeg em GitHub Actions) + espaço do aluno completo.**

Ver `CURSOS/CONTINUIDADE-SESSAO-8.md` para o plano original. Esta 2ª parte fechou todos os pendentes em vez de apenas aprovar o formato.

### Autonomia editorial no preview admin (`/admin/producao/aulas/preview/[slug]/[m]/[sub]`)

Tudo o que entra num vídeo edita-se na UI admin e grava em Supabase sem deploy. O render só lê o que Vivianne aprovou. Padrão inspirado em `/admin/producao/funil` tab Prompts.

- **Texto** dos 5 campos do script — textareas com autosave debounced. Override em `course-assets/admin/aulas-config/<slug>/m<N>-<letter>.json`.
- **Quebra em blocos** manual dentro de cada acto (juntar/dividir à mão; default parte em ~220 chars nos pontos finais).
- **Timing** por slide + multiplicador global (0.5x–2x).
- **Faixa Ancient Ground** por sub-aula (override) ou por curso (default). Picker lista `audios/albums/ancient-ground/*.mp3` com play inline.
- **Volume em dB** por acto (defaults: pergunta/situação −18dB → gesto −15dB → frase −14dB).
- **Preview do mix no browser**: `<audio>` da AG toca por baixo dos slides, volume muda com o slide corrente. Sample audível antes de gastar workflow.

### Render pipeline HTML→MP4

- `tools/render-course-slide/render.mjs` — Puppeteer captura cada slide como PNG 1920×1080 (template `slide-template.mjs` espelha `SlidePreview.tsx`), FFmpeg concat com durações + AG em loop + volume modulado por acto + fade-in/out.
- `.github/workflows/render-course-slide.yml` — dispatch com `jobId`; lê manifest de `course-assets/render-jobs/<jobId>.json`.
- `POST /api/admin/aulas/render-submit` + `GET /api/admin/aulas/render-status` (padrão AG).
- Output: `course-assets/curso-<slug>/videos/m<N>-<letter>.mp4`. Botão "Render MP4" com polling 4s até `done`.
- `GITHUB_DISPATCH_TOKEN` (PAT, scope `workflow`) e `SUPABASE_SERVICE_ROLE_KEY` já existentes na Vercel/GitHub.

### `/api/courses/lesson` — preferência Mock B

HEAD no MP4 Mock B; se 200, devolve URL pública. Senão fallback legacy `course-videos/courses/{slug}/m{N}/{letter}.mp4` (signed URL 2h).

### Q&A: instruções extras editáveis sem deploy

- Tab **Q&A (tom)** em `/admin/producao/aulas` — textarea com extras anexadas ao fim do system prompt base (em `src/lib/course-context.ts`).
- Override em `course-assets/admin/aulas-qa-prompt.json`, carregado a cada pergunta por `/api/courses/ask` (via `src/lib/qa-extras.ts`).
- Movido do nível de sub-aula para o nível de módulo (a conversa é por módulo).

### Espaço do aluno — polimento

- **`territoryStage`** (serif itálico) no topo da página do módulo, além do card expansível do manual.
- **Barra de progresso** em `/cursos/<slug>` mostra X/N sub-aulas (granular) em vez de só X/N módulos.
- **Botão "Gerar certificado e concluir curso"** aparece quando todas as sub-aulas estão completas.
- **Links de materiais**: "Manual (PDF)" e "Cadernos preenchidos (PDF)" na página do curso.
- **Novo endpoint** `GET /api/courses/cadernos?slug=...` gera PDF com todas as reflexões/caderno guardadas em `escola_journal`, agrupadas por módulo. Template em `src/lib/pdf/cadernos-template.tsx`.

### Regras invioláveis reforçadas

- **Vivianne decide a faixa AG**, não o Claude. Sem faixa, o botão Render fica desactivado.
- **Sem render sem preview aprovado.** Overrides gravam antes; só depois a UI permite disparar o workflow.

---

## Sessão anterior (7 — 2026-04-21)

**Migração Shotstack → FFmpeg nos 3 pipelines de vídeo. Piscar dos Ancient Ground resolvido determinisiticamente.**

Shotstack passou a fallback opcional. Default é sempre FFmpeg, custo 0.

### Ancient Ground (1h) — FFmpeg em GitHub Actions

- **3 toggles de diagnóstico no preview** (trim 0.3s, cut duro, loop 1 clip) para isolar edges-frame vs jump-cut sem gastar créditos
- **Novo motor FFmpeg grátis** via `render-ancient-ground.yml` + `tools/render-ancient-ground/render.mjs`
- **Trim 0.3s + xfade 1.5s** determinístico → piscar eliminado (validado 5min; 1h em teste)
- **Flow manifest-based**: escreve `render-jobs/<jobId>.json` em Supabase, despacha workflow via `POST /workflows/.../dispatches`, polling ao `render-jobs/<jobId>-result.json` que o workflow vai actualizando
- **Loop eficiente**: base sequence encodada 1x, depois `-stream_loop -1 -c:v copy` para chegar à duração alvo (5min/10min/30min/1h) sem re-encode
- **Endpoints novos**: `/render-ffmpeg-submit` + `/render-ffmpeg-status`
- **Bucket `course-assets`**: global file size limit 1.95GB (era 50MB default, bloqueava uploads >50MB)
- **Dropdown duração** dinâmico: mostra "grátis" com FFmpeg, "N créditos" com Shotstack

### Funil (Nomear) — FFmpeg em Vercel serverless

- Commit `a8ccef5` — `POST /api/admin/funil/render-ffmpeg`
- Usa `@ffmpeg-installer/ffmpeg` (binário empacotado dentro do bundle da Vercel function)
- Filter graph: xfade encadeado + narração + música com **sidechain compressor** (ducking automático: música baixa quando voz fala, sobe no silêncio)
- Output 1080p libx264 crf 20, upload Supabase `youtube/funil-videos/`
- Streaming SSE com parse do `stderr` FFmpeg (linhas `time=...`)
- Vídeos são curtos (~2 min), cabem dentro do 5min cap Vercel

### Shorts (30s verticais) — FFmpeg em Vercel serverless

- Commit `5c0366f` — `POST /api/admin/shorts/render-ffmpeg`
- Mesmo `@ffmpeg-installer/ffmpeg` dentro da função Vercel
- Filter graph: concat de 3 clips 9:16, overlay de 2 PNGs com versos (renderizados no browser via html-to-image e passados como dataURL base64), música com fade
- Output 1080×1920 verticais, upload `shorts/videos/`

### Diagnóstico do piscar antes do fix

Confirmado por Vivianne no preview do Ancient Ground: piscar presente entre clips. Logo não era do Shotstack — eram as pontas dos clips Runway + falta de crossfade longo. O FFmpeg com `trim=0.3:9.7` + `xfade=fade:duration=1.5` resolveu determinisiticamente.

### Dois padrões FFmpeg coexistentes (propositado)

| Pipeline | Duração | Host | Porquê |
|---|---|---|---|
| Ancient Ground | ~1h | GitHub Actions runner | Vercel cap 5min, inviável |
| Funil (Nomear) | ~2min | Vercel serverless + @ffmpeg-installer | Cabe no cap, deploy único |
| Shorts | 30s | Vercel serverless + @ffmpeg-installer | Cabe no cap, deploy único |

Ambas as abordagens funcionam e não conflituam; cada uma é a certa para a sua escala.

---


## Leitura por esta ordem

1. `/CURSOS/PRODUCAO-STATUS.md` — ESTE FICHEIRO (estado)
2. `/CURSOS/VIDEOS-YOUTUBE-CONCEITO.md` — conceito dos 2 tipos de vídeo
3. `/ESCOLA-VEUS-VIDEO-PIPELINE REVISTO.md` — pipelines técnicos (Cursos + Funil)
4. `/CURSOS/PROMPTS-THINKDIFFUSION.md` — prompts de Ancient Ground (natureza)

---

## Admin — estrutura actual (2026-04-20)

```
/admin
├ alunas    analytics    biblioteca    calendario    escola/
├ producao/
│  ├ aulas                 Cursos pagos: slides + Ancient Ground (sem voz)
│  ├ funil                 122 Nomear — tab Prompts (editor inline)
│  ├ ancient-ground        Natureza Moçambique (prompts + clips)
│  │  └ montagem           Junta clips em vídeo ~60min
│  ├ shorts                30s verticais (TikTok / IG / Shorts)
│  └ audios                ElevenLabs em massa (Nomear + cursos)
└ layout.tsx page.tsx
```

**Nav top (7 items):** Dashboard · Alunas · Escola · Producao · Calendario · Biblioteca · Analytics

- **Escola** hub: tabs Cursos · Conteudo · Revisao · Materiais · Guidelines
- **Producao** umbrella: sub-nav para as 6 tracks

Páginas abolidas e apagadas: `producao` (antigo), `lora`, `territorios`, `youtube`, `youtube-montagem` (absorvido), `thinkdiffusion` (absorvido), `audio-bulk` (absorvido), `conteudo`/`revisao`/`guidelines`/`cursos` (absorvidos em `escola`).

---

## Estado dos conteúdos

| Componente | Estado | Detalhe |
|-----------|--------|---------|
| Estrutura dos 20 cursos | COMPLETO | `src/data/courses.ts` — 20 cursos, 160 módulos, 480 sub-aulas |
| Scripts Nomear (funil) | COMPLETO | 122 scripts em `nomear-scripts.ts`, 24 séries |
| Scripts aulas pagas | 7/20 cursos revistos | 168/480 scripts — Ouro Próprio, Limite Sagrado, Sangue e Seda, O Silêncio que Grita, Pele Nua, A Fome, A Chama |
| **Áudios ElevenLabs Nomear** | ~112 de 122 | Bucket Supabase `course-assets/youtube/` |
| Áudios ElevenLabs aulas | EM CURSO | Bucket Supabase `course-assets/curso-<slug>/` — entrega à parte (podcast para quem prefere ouvir) |
| **Prompts ThinkDiffusion funil** | Ouro Próprio COMPLETO | **83 prompts** para os 8 eps de Ouro Próprio (ep01–06, ep09, ep10). Seed em `funil-prompts.seed.json`, editáveis em `/admin/producao/funil` |
| Prompts ThinkDiffusion Ancient Ground | 112 prompts | `thinkdiffusion-prompts.json` — 15 mar, 15 praia, 15 rio, céu, caminho, noite, savana, flora, chuva |
| Prompts aulas cursos | 0 | Tab Prompts na página Aulas (colecção vazia — add via editor) |
| Imagens geradas Ancient Ground | ~60 horizontais | Supabase `youtube/images/` (mar-01 a mar-08) |
| Clips Runway Ancient Ground | ~50 | Supabase `youtube/clips/` |
| Música Ancient Ground (Loranne) | 100 faixas prontas | Supabase `audios/albums/ancient-ground/` |
| Vídeos renderizados | 0 | `youtube/videos/` vazio |
| Manuais PDF | 1/20 draft | Ouro Próprio |
| Cadernos exercícios PDF | 8/160 draft | Ouro Próprio |

---

## Pipelines técnicos (resumo)

### Pipeline 1 — Aulas (cursos pagos)
- Entrega vídeo: slides editorial escuro + música Ancient Ground (**sem voz**)
- Entrega áudio (à parte): ElevenLabs para quem prefere ouvir em vez de ver
- Motor: CLI `escola-veus curso parse/preview/render` (Node + Puppeteer + FFmpeg)
- Sem Shotstack, sem Remotion

### Pipeline 2 — Funil YouTube (122 Nomear)
- Clips Runway Gen-4 Turbo (10s cada)
- Imagens base: ThinkDiffusion **Flux** `flux1-dev-bnb-nf4-v2` (1920×1080, CFG 3.5, steps 25, Euler + Simple)
- SDXL tem bias para humanos quando vê "silk/veil/fabric" e ignora contagens — **não usar em funil**
- Regras Colecção B: **sem pessoas**, abstracto/simbólico, global (nada africano)
- Música Ancient Ground + texto overlay contemplativo
- Cada vídeo: áudio Nomear (~100s) / clip 10s = ~10 clips por vídeo
- Prompts editáveis em `/admin/producao/funil` (tab Prompts) — persistem em Supabase, sem deploy

### Ancient Ground (natureza)
- Imagens realistas Moçambique (mar, praia, rio, savana, céu, flora)
- Checkpoint: **UltraReal / Juggernaut XL** (SDXL — paisagem tolera interpretação livre)
- Clips 10s → vídeos de ~60min em loop (channel ambient)
- Música Loranne — álbum Ancient Ground (pares A+B em loop)
- Montagem: `/admin/producao/ancient-ground/montagem` → Shotstack

### Shorts
- 30s verticais (1080×1920) para TikTok / IG Reels / YouTube Shorts
- 3 imagens × clip 10s + música Loranne + versos
- Render via `/admin/producao/shorts`

---

## Editor de prompts inline (autonomia)

Desde 2026-04-20, para evitar deploys por cada edição de prompt:

- `/admin/producao/funil` tab Prompts → edita os 83 Ouro Próprio + adiciona novos
- `/admin/producao/aulas` tab Prompts → colecção "aulas" (vazia, add via UI)
- Config editável: checkpoint, width/height, CFG, steps, sampler, negative_prompt
- API: `/api/admin/prompts/[collection]/load` e `/save`
- Persistência: Supabase Storage `course-assets/admin/<collection>-prompts.json`
- Fallback: se Supabase vazio, usa o seed do repo

Ancient Ground continua a ler de `thinkdiffusion-prompts.json` (read-only na UI).

---

## APIs e Contas

| Serviço | Chave env | Estado |
|---------|-----------|--------|
| ElevenLabs | `ELEVENLABS_API_KEY` | OK — voz `UnchUh06d8TYP17TuqgU` (pt-PT) |
| ThinkDiffusion | manual via UI web | $30 saldo — QUICK $0.79/h |
| Runway | `RUNWAY_API_KEY` | OK — Gen-4 Turbo, ~200 cr |
| Shotstack | `SHOTSTACK_API_KEY` + `SHOTSTACK_ENV` | FALLBACK — Ancient Ground/Funil/Shorts usam FFmpeg por defeito |
| GitHub Actions (render Ancient Ground) | `GITHUB_DISPATCH_TOKEN` (PAT classic, scope `workflow`) | OK — despacha `render-ancient-ground.yml` |
| Supabase | NEXT_PUBLIC + SERVICE_ROLE | OK — bucket `course-assets` |
| fal.ai / Flux / LoRA | **ABOLIDO** | — |
| Suno | **RISCADO** | Não usar — música = Ancient Ground |

---

## Próximas acções (ordem)

1. **Validar render 1h Ancient Ground com FFmpeg** (em curso no fim da sessão 7) — se passar sem piscar, migração está fechada.
2. **Piloto ep01 Ouro Próprio** — 11 prompts × 1 áudio Nomear × música → pipeline `/admin/producao/funil/montar` com FFmpeg+ducking. Primeiro vídeo Nomear completo.
3. **Validar ep01 visualmente** no ThinkDiffusion (11 prompts). Ajustar tom se precisar.
4. **Gerar Limite Sagrado** — 8 eps Nomear (ep07, ep08 + ampliação Ep 44-47 série 6 + ampliação série 2).
5. Continuar pelos 5 cursos com áudios prontos: Sangue e Seda, Silêncio que Grita, Pele Nua, A Fome, A Chama.
6. Terminar áudios ElevenLabs em falta (~10 Nomear + vários de cursos).
   - **Pele Nua M8.A ("A pele como casa") e M8.B ("A reconciliação possível")** — apagados da lista audio-bulk, nunca gerados. Re-carregar "Só Pele Nua" e gerar esses 2 quando houver créditos.
7. Upload YouTube API + agendamento em `/admin/calendario` (hoje é stub).
8. **Limpar Shotstack** — depois de 3 renders FFmpeg bem-sucedidos em cada pipeline, apagar endpoints `render-submit/status/save`, envs `SHOTSTACK_*`, e o radio fallback na UI. Manter só `render-ffmpeg*`.

---

## Regras invioláveis

1. **Registo nomeador** em todos os scripts: contemplativo, acolhedor, não didáctico, não mindfulness, não espiritual, não coach.
2. **PT-PT** (nunca pt-BR): "objecto", "correcção", "tu", conjuntivo após "talvez".
3. **Gesto externo** nas aulas: escrever em folha, mandar mensagem, conversa real — nunca meditação interna.
4. **Colecção B** (funil): sem pessoas, sem mãos, sem silhuetas, global (nada africano), abstracto.
5. **Sem voz nos vídeos das aulas** — música Ancient Ground no fundo. Áudio ElevenLabs é entrega à parte.
6. **TaskIds** Runway sempre guardados em Supabase ANTES do polling (nunca se perdem).
7. **5s pausa** entre submissões batch Runway.
8. **Motion prompts**: evitar "dancing", "shimmering", "twinkling", "shifting" — causam flickering.
9. **Sem deploys** por edição de prompt — usar `/admin/producao/{funil,aulas}` tab Prompts.
10. **Negative prompt** deve incluir "multiple moons, duplicate moon, multiple suns, duplicate sun" (evita SDXL doppel-sun).
11. **PR único e claro, merge na UI GitHub** (merge via API MCP não dispara webhook Vercel).
12. **Motor de render default = FFmpeg (grátis)**. Shotstack só como fallback quando FFmpeg falha ou quando se quer comparar.
13. **CLIP_DURATION = 10s** (Runway gen4_turbo real).
14. **Ancient Ground render**: trim 0.3s nas pontas + xfade 1.5s — parâmetros validados contra piscar, não mexer sem razão.
