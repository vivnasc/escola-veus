# Prompt de Continuidade — Sessão 6

**Projecto:** Escola dos Véus (@vivnasc/escola-veus)
**Data:** 2026-04-20
**Branch desta sessão:** claude/preview-pause-thumbnail-gen (merged PR #103)

LER POR ESTA ORDEM antes de qualquer trabalho:
1. /CURSOS/VIDEOS-YOUTUBE-CONCEITO.md — conceito dos 2 tipos de vídeo
2. /CURSOS/ROADMAP-VIDEO-PIPELINE.md — roadmap 4 fases
3. /CURSOS/CONTINUIDADE-SESSAO-5.md — sessão anterior
4. Este ficheiro — estado actual + problemas por resolver

---

## O QUE FOI FEITO NESTA SESSÃO (2026-04-20)

### PR #98 (merged)
- **Clips agrupados por prompt** na página montagem: 15 grupos × 4 variações. Dropdown GRUPO (posição nos 15) + dropdown VARIAÇÃO (ordem dos 4 clips dentro do grupo).
- **Thumbnail picker** (secção 3B) — lista imagens do Supabase, filtro por prompt.
- **Paginação `list-clips` / `list-images`** — `force-dynamic` + offset pagination até esgotar (evita cap 100). Resolveu o problema de aparecerem só 20 clips.
- **Preview double-buffer** — 2 `<video>` alternantes com preload para eliminar delay entre clips na preview (não afecta render).

### PR #103 (merged)
- **Pause/Resume** no preview (antes só Play/Stop).
- **Gerador de thumbnail com texto overlay** (canvas 1280×720): imagem + gradient + título DM Serif + tagline coral. Wrap automático 2 linhas. Download PNG.
- **Painel SEO editável** (secção 3C): thumbnailTitle, postTitle, description, hashtags. Auto-preenchimento do `youtube-metadata.json` (6 vídeos) OU **gerador template-based** (12 categorias: mar, praia, rio, ceu, chuva, savana, flora, nevoeiro, fogo, terra, noite, caminho) para os 44 vídeos sem metadata hand-written.
- **Migração legacy**: se localStorage tem `title` mas `videoId` vazio, restaura videoId automaticamente.
- **Auto-fill on mount**: se videoId existe mas SEO vazio, gera proposta sem precisar de click.
- **Render respeita ordem** — antes baralhava clips aleatoriamente a cada iteração, destruindo a sequência escolhida. Agora loop `[c1..cN, c1..cN, ...]` sem random.
- **Render desacoplado** — 3 endpoints curtos (`/render-submit`, `/render-status`, `/render-save`) para fugir ao 5min Vercel timeout. Client guarda renderId em localStorage → reload/fecho do browser já não perde renders. Se save falhar, mostra URL Shotstack directo.
- **Thumbnail ao render** — enviada ao endpoint (composta data:URL OU http URL). Guardada como `<slug>-<stamp>-thumb.{ext}` em `youtube/videos/`.
- **SEO sidecar** — guardado como `<slug>-<stamp>-seo.json` em `youtube/videos/`.
- **Upload MP4 drag-and-drop** (secção 6) — arrastas MP4, renomeia automaticamente usando título, upload Supabase + thumbnail + sidecar SEO. POST `/api/admin/youtube/upload-mp4` com FormData. Progress bar.
- **Duration selector** — dropdown 5min / 10min / 30min / 1h. Permite teste de 5min (5 créditos) antes de 1h (60 créditos).
- **CLIP_DURATION 15s → 10s** — alinha com Runway gen4_turbo real (era 15s mas os clips só têm 10s, logo 5s de frame congelado a cada clip = "piscar").

---

## O PROBLEMA QUE FICOU POR RESOLVER

### Piscar/delay entre clips no vídeo renderizado

Vivianne renderizou vídeos (custou ~60 créditos primeiro, depois vários testes) e continua a ver piscar/transições estranhas entre clips mesmo após múltiplos fixes:

1. CLIP_DURATION 15→10 (alinha com fonte Runway) — não resolveu totalmente
2. Remover fades, cortes duros com overlap — ela achou "brusco, desagradável"
3. Voltar a crossfade com fade + overlap 1s (estado final, commit `53c394a`) — ela disse "n mudou nada"

**Hipóteses a investigar na próxima sessão:**
- **O último deploy pode não ter arrancado.** Merge do PR #103 (ca49402) aparentemente não triggered Vercel Production build. Criei PR #115 com commit vazio para forçar. Verificar se está Ready como Current antes de continuar a mexer no render.
- **Os clips Runway têm artifacts próprios** (primeiro/último frame escuro/trémulo, mudança de enquadramento abrupta entre cenas). Se for isto, nenhuma config de render resolve — tem de se regenerar clips problemáticos com motion prompts mais estáveis.
- **Pediu-se à Vivianne para confirmar:** o preview (botão Play na montagem) mostra o mesmo piscar? → se sim, é problema dos clips. Se não, é do render. **Ela não respondeu a esta pergunta.** Confirmar primeiro na próxima sessão.
- **Shotstack e `fit: crop`** — possível que a re-escala 720p→1080p crie artifacts. Testar com `resolution: "720"` para ver se o piscar desaparece (sinal de problema de escala).
- **Alternativa:** `asset.trim: 0.3` para skipar primeiro 0.3s de cada clip, `length: clipDuration - 0.6` para skipar último 0.3s.

---

## CONFIGURAÇÃO ACTUAL DO RENDER (main branch após PR #103)

Ficheiros: `src/app/api/admin/youtube/render-submit/route.ts` + `render/route.ts`

```
CLIP_DURATION = 10 s (Runway gen4_turbo)
OVERLAP = 1.0 s
stride = clipDuration - OVERLAP = 9 s
Timeline total = (N-1) * stride + clipDuration
2 tracks alternadas (pares na A, ímpares na B) + 1 track de música
fade.in + fade.out em cada clip
output: 1080p, 30fps, mp4
```

---

## O QUE FUNCIONA HOJE (verificado em produção)

- Página `/admin/producao/ancient-ground/montagem`
  - Auto-load de clips do Supabase com paginação completa
  - 15 grupos × 4 variações visíveis e reordenáveis
  - Thumbnail picker em 3B
  - Compositor SEO com texto overlay em 3C
  - Preview Play / Pause / Stop com double-buffer
  - Dropdown duração (5m/10m/30m/1h)
  - Render MP4 via Shotstack (renderId persiste em localStorage, sobrevive a reloads)
  - Upload MP4 drag-and-drop em secção 6
- Endpoints novos:
  - POST `/api/admin/youtube/render-submit`
  - GET `/api/admin/youtube/render-status?id=`
  - POST `/api/admin/youtube/render-save`
  - POST `/api/admin/youtube/upload-mp4`
- Sidecar JSON SEO + thumbnail companion em `course-assets/youtube/videos/`

---

## ERROS E LIÇÕES DESTA SESSÃO

1. **Merge via GitHub MCP API não dispara webhook Vercel Production** — foi preciso commit vazio em branch separado para forçar deploy. De agora em diante, usar só UI GitHub para merges críticos.
2. **Tentei resolver piscar por suposição** — gastei créditos Vivianne (60+) em renders de debug. Na próxima: primeiro confirmar no preview se é problema dos clips, depois render-debugging.
3. **CLIP_DURATION desalinhado com Runway** — a sessão 4 dizia 10s Runway mas o código da montagem usava 15s. Resultado: 5s mortos por clip = bug base que gerou "piscar".
4. **3 branches simultâneos confundem** — `fix-runway-generation-fbftV` (merged), `preview-pause-thumbnail-gen` (merged), `trigger-vercel-redeploy` (closed), `trigger-deploy-2` (aguardar merge). Sempre pedir PR único e claro.
5. **Localstorage state legacy** — campo `title` era usado como value do dropdown, refactor mudou para `videoId`. Tive de adicionar migration useEffect. Lição: ao mudar schema localStorage, escrever migration explícita.

---

## REGRAS ACTUAIS (não mudar sem Vivianne pedir)

1. ThinkDiffusion para imagens (NÃO fal.ai)
2. Sem compressão (PNG original)
3. Só imagens HORIZONTAIS (vertical corta-se)
4. Clips seguem sequência dos prompts (ordem respeitada no render)
5. TaskIds SEMPRE no Supabase antes de polling
6. 5s pausa entre submissões batch Runway
7. Motion prompts editáveis pela Vivianne
8. Render respeita ordem do utilizador (nunca baralhar)
9. Créditos: Ancient Ground — music.seteveus.space (NÃO Loranne)
10. Projecto ELEVA MOÇAMBIQUE
11. **NOVO:** PR só, Vivianne faz merge na UI (merge via API não dispara deploy)
12. **NOVO:** Antes de render Shotstack, testar com duration 5min (5 créditos)
13. **NOVO:** CLIP_DURATION = 10s (Runway gen4_turbo real)

---

## CRÉDITOS E CONTAS

| Serviço | Saldo aproximado | Notas |
|---------|------------------|-------|
| ThinkDiffusion | ~$30 | UltraReal checkpoint |
| Runway API | ~200 cr | gen4_turbo 5cr/s, 10s clips = 50cr |
| Shotstack | ~145 cr (v1) | 1cr/min de output. 5min teste = 5cr, 1h = 60cr |
| Supabase | Ilimitado | Bucket course-assets público |

---

## FICHEIROS CHAVE (actualizados esta sessão)

```
escola-veus-app/src/
  app/admin/producao/ancient-ground/montagem/page.tsx    — página com grupos, SEO, thumbnail, upload, pause
  app/api/admin/youtube/
    render/route.ts                 — endpoint legacy (mantido)
    render-submit/route.ts          — novo: POST submete ao Shotstack
    render-status/route.ts          — novo: GET proxy status Shotstack
    render-save/route.ts            — novo: POST descarrega + upload Supabase
    upload-mp4/route.ts             — novo: POST upload manual MP4
  app/api/admin/thinkdiffusion/
    list-clips/route.ts             — paginação + force-dynamic
    list-images/route.ts            — paginação + force-dynamic
  data/
    video-plan.json                 — 50 vídeos, categorias
    youtube-metadata.json           — 6 vídeos com SEO hand-written
    thinkdiffusion-prompts.json     — 112 prompts (mar, praia, rio, etc.)
    runway-motion-prompts.json      — motion prompts editáveis
```

---

## PRÓXIMA SESSÃO — O QUE FAZER PRIMEIRO

1. **Confirmar deploy Production** — abrir Vercel Deployments, ver se `GLoXWNK9J` (ou commit mais recente de main) está Ready + Current. Se não, usar PR #115 (commit vazio) para forçar.
2. **Diagnosticar piscar** — Vivianne abre `/admin/producao/ancient-ground/montagem`, clica Play no preview. Observa se o piscar aparece entre clips AI ou não.
   - Se SIM no preview → problema dos clips Runway (regenerar com motion prompts sem "flickering", "dancing", "shimmering")
   - Se NÃO no preview → é do render Shotstack → tentar `resolution: "720"` ou `asset.trim: 0.3`
3. Só depois, testar render 5min (5 cr).

---

## DECISÕES PENDENTES

- Upload directo para YouTube via API (não começado — requer Google Cloud OAuth)
- 4K end-to-end (precisa upgrade Runway + ThinkDiffusion + Shotstack 2160 resolution)
- Duration selector pode precisar de validação (ex: impedir render se ordem não foi feita)

---

Sessão terminada com piscar por resolver. Não gastar mais créditos Shotstack sem primeiro confirmar se o piscar existe no preview (antes de ir ao render).
