# Render Ancient Ground (FFmpeg)

Renderizador FFmpeg para os vídeos ambient de ~1h (ou 5min/10min/30min) da
colecção Ancient Ground. Corre dentro de um GitHub Actions runner disparado
pelo admin UI — não requer terminal da utilizadora.

## Fluxo

```
 Admin UI (/admin/producao/ancient-ground/montagem)
   ↓ botão "Gerar MP4 — FFmpeg grátis"
 POST /api/admin/youtube/render-ffmpeg-submit
   ↓ escreve course-assets/render-jobs/<jobId>.json (manifest)
   ↓ dispatch workflow via GitHub API
 GitHub Actions: .github/workflows/render-ancient-ground.yml
   ↓ ffmpeg concat + xfade + música
   ↓ upload mp4 + thumb + seo.json para Supabase
   ↓ escreve course-assets/render-jobs/<jobId>-result.json { status: done, videoUrl }
 Admin UI faz polling (/api/admin/youtube/render-ffmpeg-status?jobId=...)
```

## Parâmetros FFmpeg (contra o piscar)

- **trim 0.3s** nas pontas de cada clip → evita o frame inicial/final escuro do Runway
- **xfade (fade) de 1.5s** entre clips → dissolve suave, não revela edge-frames
- **scale + crop 1920×1080** → garante resolução uniforme
- **fps 30 CFR** e `format=yuv420p` → evita estouros em variable-framerate
- **libx264 preset medium, CRF 20** → bom equilíbrio qualidade/tempo
- **Loop eficiente**: a base sequence é encodada uma vez; depois `-stream_loop -1 -c:v copy` para preencher a duração alvo sem re-encode.

## Env / Secrets

### No repositório (GitHub → Settings → Secrets → Actions)

| Secret | Uso |
|---|---|
| `SUPABASE_URL` | Base URL do Supabase (o mesmo de `NEXT_PUBLIC_SUPABASE_URL`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key para upload do MP4 |

### Em Vercel (Vercel → Project → Settings → Environment Variables)

| Var | Default | Uso |
|---|---|---|
| `GITHUB_DISPATCH_TOKEN` | — | **Obrigatório.** Personal Access Token (classic) com scope `workflow` OU fine-grained token com `actions: write` no repo |
| `GITHUB_REPO_OWNER` | `vivnasc` | |
| `GITHUB_REPO_NAME` | `escola-veus` | |
| `GITHUB_WORKFLOW_FILE` | `render-ancient-ground.yml` | |
| `GITHUB_DISPATCH_REF` | `main` | Branch onde corre o workflow |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Para o endpoint submit escrever o manifest |
| `NEXT_PUBLIC_SUPABASE_URL` | — | Já deve existir |

## Criar o GitHub PAT

1. github.com → Settings → Developer settings → **Personal access tokens (classic)**
2. Generate new token (classic) → scope `workflow`
3. Expiry: 1 ano
4. Copiar → colar em Vercel como `GITHUB_DISPATCH_TOKEN`

Alternativa fine-grained: Only select repositories → escola-veus → Repository permissions → **Actions: Read and write**, Contents: Read-only.

## Teste manual local (opcional)

```bash
cd tools/render-ancient-ground
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
# Assumindo que já existe course-assets/render-jobs/test-123.json
node render.mjs test-123
```

## Limites conhecidos

- **Filter graph xfade** com >100 clips pode ficar pesado. Se der erro de memória, o render.mjs pode ser extendido para chunks (tipo 50 clips por segment, depois concat).
- **GitHub Actions free tier**: 2000 min/mês. Um render de 1h ocupa ~20-30 min do runner → ~65 renders/mês no free tier.
- **Workflow dispatch latência**: entre POST e arranque pode demorar 10-30s.
