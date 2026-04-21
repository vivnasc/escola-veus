# Prompt de Continuidade — Sessão 7

**Projecto:** Escola dos Véus (@vivnasc/escola-veus)
**Data:** 2026-04-21
**Branch desta sessão (Ancient Ground):** `claude/escola-veus-continuation-d7nOQ` (PR #121 mergeado)
**Branch paralelo na mesma data (shorts+funil):** `claude/shorts-generator-page-4g4bk` (PR #118 + PR #122 mergeados)

LER POR ESTA ORDEM antes de qualquer trabalho:
1. `/CURSOS/PRODUCAO-STATUS.md` — estado actual
2. `/CURSOS/VIDEOS-YOUTUBE-CONCEITO.md` — conceito dos 2 tipos de vídeo
3. `/CURSOS/CONTINUIDADE-SESSAO-6.md` — sessão anterior (piscar por resolver)
4. Este ficheiro — o que foi feito e lições

---

## O PROBLEMA QUE ERA PRIORITÁRIO (e foi resolvido)

**Piscar entre clips no vídeo Ancient Ground.** Arrastava-se da sessão 6. Foram gastos +60 créditos Shotstack em renders de debug que não resolviam.

### Diagnóstico feito nesta sessão

Primeiro passo: confirmar se o piscar era do render (Shotstack) ou dos clips Runway. Para isso, adicionaram-se **3 toggles de diagnóstico ao preview** da página `montagem` (commit `647da8f`):

- **Cortar 0.3s das pontas** — testa se são frames-edge Runway
- **Cut duro** — desliga fade 75ms entre buffers (testa CSS)
- **Loop 1º clip 4x** — isola edge-frame vs jump-cut

Vivianne confirmou que o piscar aparecia no preview. Logo: problema dos clips, não do render.

### Fix aplicado (commits `447d1e9`, `7b7a32a`)

Em vez de fazer fix por suposição no Shotstack, **migrou-se o render para FFmpeg** onde temos controlo total:

- `trim=0.3:9.7` em cada clip — salta o frame escuro de entrada e saída do Runway
- `xfade=fade:duration=1.5:offset=<stride>` — crossfade longo, absorve qualquer micro-edge
- `fps=30 CFR`, `format=yuv420p`, `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080`

Validação: render 5 min correu liso, sem piscar. Render 1h em curso à hora do fecho desta nota.

---

## ARQUITECTURA — 3 PIPELINES FFMPEG COEXISTENTES

### 1. Ancient Ground (`/admin/producao/ancient-ground/montagem`)

**Duração:** até 1h. **Host:** GitHub Actions runner.

```
Admin UI (radio "FFmpeg grátis")
  ↓ POST /api/admin/youtube/render-ffmpeg-submit
    · escreve course-assets/render-jobs/<jobId>.json (manifest com clips, música, duração, crossfade, trim)
    · POST /repos/../actions/workflows/render-ancient-ground.yml/dispatches { inputs: { jobId } }
  ↓ workflow_dispatch
GitHub Actions: .github/workflows/render-ancient-ground.yml
  · checkout + setup-node + setup-ffmpeg
  · node tools/render-ancient-ground/render.mjs <jobId>
    · download clips + música de Supabase para /tmp
    · ffmpeg [PASSO 1] base sequence (N clips com xfade) → base.mp4
    · ffmpeg [PASSO 2] música combinada mp3 (concat se >1 faixa)
    · ffmpeg [PASSO 3] loop + música (-stream_loop -1 -c:v copy, -t targetDuration)
    · upload output.mp4 + thumbnail + seo.json para course-assets/youtube/videos/
    · escreve course-assets/render-jobs/<jobId>-result.json { status: done, videoUrl }
  ↓
Admin UI faz polling ao result.json (GET /api/admin/youtube/render-ffmpeg-status?jobId=...)
```

**Porquê GitHub Actions e não Vercel serverless:** renders de 1h demoram 15-20 min de wall-clock — muito além do cap de 5min da Vercel function. GitHub Actions aguenta 4h.

### 2. Funil Nomear (`/admin/producao/funil/montar`)

**Duração:** ~2 min (script Nomear + clips). **Host:** Vercel serverless.

- Endpoint: `POST /api/admin/funil/render-ffmpeg` (commit `a8ccef5`)
- Usa `@ffmpeg-installer/ffmpeg` (binário node empacotado no bundle Vercel)
- **Diferencial face ao Shotstack:** sidechain compressor faz ducking automático — a música baixa sozinha quando a voz fala, volta no silêncio entre frases. Impossível fazer isto no Shotstack.
- SSE stream parse do `stderr` do FFmpeg para percentagem de progresso.

### 3. Shorts (`/admin/producao/shorts`)

**Duração:** 30s verticais. **Host:** Vercel serverless.

- Endpoint: `POST /api/admin/shorts/render-ffmpeg` (commit `5c0366f`, PR #122)
- Mesmo `@ffmpeg-installer/ffmpeg`
- **Truque das fontes:** os 2 versos de overlay são renderizados no BROWSER como PNG 1080×1920 transparente via `html-to-image`, depois passados como dataURL base64 no body. Servidor escreve-os em /tmp antes do ffmpeg. Dá texto pixel-perfect Montserrat 800 sem precisar de TTF no servidor.
- 3 clips 9:16 concat + overlay PNGs com `enable='between(t,0,half)'` + música.

---

## O QUE FUNCIONA HOJE (verificado em produção)

- `/admin/producao/ancient-ground/montagem`
  - 3 toggles de diagnóstico no preview
  - Radio "Motor de render": FFmpeg (grátis) default, Shotstack fallback
  - Render 5min FFmpeg validado end-to-end
  - Upload Supabase com file size limit global 1.95GB + bucket course-assets 1.95GB (antes 50MB bloqueava)
  - Dropdown duração mostra "grátis" quando FFmpeg seleccionado
- `/admin/producao/funil/montar` — FFmpeg com ducking automático
- `/admin/producao/shorts` — FFmpeg com overlays PNG do browser
- Endpoints:
  - POST `/api/admin/youtube/render-ffmpeg-submit`
  - GET `/api/admin/youtube/render-ffmpeg-status?jobId=`
  - POST `/api/admin/funil/render-ffmpeg`
  - POST `/api/admin/shorts/render-ffmpeg`
- Workflow `.github/workflows/render-ancient-ground.yml`

---

## ENVS / SECRETS

### Vercel (Environment Variables)

| Var | Novo nesta sessão? | Uso |
|---|---|---|
| `GITHUB_DISPATCH_TOKEN` | SIM | PAT classic com scope `workflow` — despacha workflows Actions |
| `GITHUB_REPO_OWNER` | opcional | default `vivnasc` |
| `GITHUB_REPO_NAME` | opcional | default `escola-veus` |
| `GITHUB_WORKFLOW_FILE` | opcional | default `render-ancient-ground.yml` |
| `GITHUB_DISPATCH_REF` | opcional | default `main` |
| `SUPABASE_SERVICE_ROLE_KEY` | já existia | Escrita de manifests e uploads |
| `SHOTSTACK_API_KEY` | já existia | Fallback opcional, não crítico |

### GitHub Actions Secrets

| Secret | Uso |
|---|---|
| `SUPABASE_URL` | Base URL público Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Upload MP4 + result.json |

### Supabase Storage

- **Global file size limit**: 1.95GB (Settings → Storage → limit)
- **Bucket `course-assets`**: file size limit 1.95GB

---

## ERROS E LIÇÕES DESTA SESSÃO

1. **Primeira versão do token falhou com 403** — criei um PAT classic SEM marcar o scope `workflow`, só `repo`. `repo` sozinho não chega para dispatch de workflows. Regenerar com `workflow` marcado resolveu.
2. **413 Payload too large** — o bucket Supabase tinha default 50MB, e um MP4 de 5min @ 1080p CRF 20 dá ~200MB. Solução: subir global file size limit do projecto (Storage Settings) e depois do bucket.
3. **Bug no render.mjs v1** — tinha `concat` sobre streams infinitas de música (`-stream_loop -1` em cada faixa e depois concat das duas). Resultado: concat fica preso na 1ª faixa para sempre. Fix: concatenar AS DUAS faixas num MP3 combinado FIRST (passo 2a), depois `stream_loop` sobre esse combinado.
4. **Tentei resolver piscar no Shotstack por suposição na sessão 6** — gastei 60+ créditos. Sessão 7: primeiro diagnóstico no preview (custo 0), depois solução determinística em FFmpeg.
5. **Shotstack para renders longos é caro e opaco.** 1h × $1/min = $0.60/vídeo × 50 vídeos Ancient Ground = $30. Com FFmpeg + GitHub Actions free tier: $0.
6. **GitHub Actions free tier** = 2000 min/mês. 1h render ≈ 15-20 min runner = ~100 renders/mês no free tier. Largamente suficiente.

---

## REGRAS ACTUALIZADAS

Adicionadas ao `PRODUCAO-STATUS.md`:

11. PR único e claro, merge na UI GitHub (API MCP não dispara webhook Vercel).
12. Motor de render default = FFmpeg. Shotstack só fallback.
13. CLIP_DURATION = 10s (Runway gen4_turbo).
14. Ancient Ground: trim 0.3s + xfade 1.5s, não mexer sem razão.

---

## PRÓXIMA SESSÃO — O QUE FAZER PRIMEIRO

1. **Confirmar que o render 1h Ancient Ground completou com sucesso** (se ficou a correr no fim desta sessão).
2. **Validar qualidade do vídeo de 1h no YouTube Studio** (drag-drop do MP4).
3. **Piloto ep01 Ouro Próprio (funil)** — 11 prompts × 1 áudio × música → pipeline funil render-ffmpeg. Objectivo: primeiro vídeo Nomear completo pronto a subir.
4. **Upload YouTube API** — ainda stub em `/admin/calendario`. Requer Google Cloud OAuth.
5. **Limpar código Shotstack** após ~3 renders FFmpeg validados de cada pipeline (Ancient Ground, Funil, Shorts). Até lá, manter como fallback.

---

## DECISÕES PENDENTES

- Apagar definitivamente Shotstack endpoints + envs quando FFmpeg tiver sido o motor de 3+ renders bem-sucedidos em cada pipeline.
- 4K end-to-end para Ancient Ground (precisaria Runway Gen-4 Turbo 4K + update do `fps`/escala no render.mjs — hoje é 1080p30).
- Migração Aulas para mesma stack FFmpeg? Hoje usa CLI `escola-veus curso render` (TODO, nunca implementado). Pode valer a pena trazer aulas também para `@ffmpeg-installer/ffmpeg` dentro da Vercel, já que os vídeos são <5min.

---

Sessão terminada com piscar resolvido, Shotstack deprecado, 3 pipelines FFmpeg operacionais. Custo $0.
