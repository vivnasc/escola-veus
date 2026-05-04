# render-carrossel-veus

Helper que corre dentro do GitHub Action `render-carrossel-veus.yml`. Não tem
dependências próprias — só usa Node 20 (`fetch` nativo).

## Fluxo

O workflow:

1. Faz checkout do repo
2. Setup Node 20 + Chromium para Puppeteer
3. `cd carrossel-veus && npm ci`
4. `npm run all` (slides PNG + vozes ElevenLabs + vídeos MP4 com música) usando
   `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `MUSIC_URL` e `MUSIC_VOLUME`
   passados como env do dispatch
5. `node tools/render-carrossel-veus/upload-result.mjs` faz upload dos 7 MP4
   + 42 PNG para `course-assets/carrossel-veus/<jobId>/` no Supabase, e
   escreve `course-assets/render-jobs/<jobId>-result.json` com as URLs

A UI em `/admin/producao/carrossel-veus` faz polling ao result.json até
status = `done` e mostra os links para descarregar.
