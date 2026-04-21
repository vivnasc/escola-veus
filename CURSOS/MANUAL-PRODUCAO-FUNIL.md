# Manual de Produção — Vídeo Funil (Nomear)

**Versão:** 2026-04-21
**Escala:** 1 vídeo Funil Nomear do zero até estar pronto para YouTube

> Funil Nomear = vídeos curtos (~90-120s) do canal YouTube com narração
> contemplativa + imagens abstractas (Colecção B) + música Ancient Ground.
> Diferente das Aulas dos cursos (pagas, sem voz) e diferente do Ancient
> Ground ambient (1h, sem narração).

---

## Visão geral — 8 passos

| # | Passo | Onde | Tempo | Custo |
|---|---|---|---|---|
| 1 | Escolher episódio | `/admin/producao/funil` | 1 min | — |
| 2 | Gerar áudio narração | `/admin/producao/audios` | 2 min | ~$0.10 |
| 3 | Gerar imagens no Midjourney | midjourney.com/imagine | 15-20 min | plano MJ |
| 4 | Upload imagens para a app | `/admin/producao/funil/gerar` | 2 min | — |
| 5 | Gerar clips Runway | mesma página, botão "clip" | 10 min | ~$5 (10 clips) |
| 6 | Montar vídeo final | `/admin/producao/funil/montar` | 5 min | 0 (GitHub Actions) |
| 7 | Gerar legenda SRT | mesma página, secção narração | 1 min | ~$0.01 |
| 8 | Upload YouTube + SRT + thumbnail | YouTube Studio | 5 min | — |

**Total por vídeo:** ~45 min · ~$5-6 · mais subscrições fixas (MJ, ElevenLabs).

---

## Passo 1 — Escolher episódio

1. Vai a **`/admin/producao/funil`**, tab **Séries**
2. Cada série lista os episódios com o badge de imagens existentes
3. Anota:
   - **id** (ex: `nomear-trailer-00`, `nomear-ep01`)
   - **título** (ex: "A culpa que chega antes da compra")
   - **curso** associado (determina estilo dos prompts)

---

## Passo 2 — Áudio narração (ElevenLabs)

1. **`/admin/producao/audios`**
2. Configura voz: voice ID `UnchUh06d8TYP17TuqgU` (pt-PT contemplativa)
3. Model: `eleven_v3`
4. Clica preset do Nomear (ex: "Série Nomear Eps 1-10")
5. **Sincroniza com Supabase** para marcar os já gerados (evita desperdício)
6. Clica **gerar** apenas no episódio em falta
7. Ficheiro guardado: `course-assets/youtube/<slug-do-título>-<timestamp>.mp3`

**Importante:** confirma que o folder é `youtube` antes de gerar. Se meteres `cursos` o áudio cai no sítio errado e a página Montar não o encontra.

---

## Passo 3 — Imagens Midjourney

**Settings fixos** (aplicar uma vez no painel de sliders da MJ, topo direito):
- Aspect Ratio: **16:9 Landscape**
- Stylization: **100**
- Weirdness: **0** · Variety: **0**
- Raw: **ON**
- Version: **v7**
- Speed: Fast (ou Relax se tiveres Standard+)

**Negative prompt** (colar uma vez, fica guardado):
```
person, people, woman, man, human, face, portrait, body, skin, hair, eyes, nose, mouth, lips, hands, fingers, silhouette, figure, girl, boy, child, model, mannequin, cartoon, illustration, painting, drawing, anime, 3d render, CGI, artificial, plastic, oversaturated, text, watermark, logo, signature, frame, border, low quality, blurry, out of focus, deformed, ugly, multiple moons, duplicate moon, multiple suns, duplicate sun, two moons, two suns
```

**Prompts por episódio:**
- Abre a app: **`/admin/producao/funil`** tab **Prompts** → filtro por episódio
- Cada card tem o texto pronto → clica **copiar**
- Cola no MJ → gera grid de 4 → escolhe melhor → clica → **download** da versão grande

---

## Passo 4 — Upload das imagens

1. **`/admin/producao/funil/gerar`** → filtro do episódio
2. Cada prompt tem zona "arrasta imagens aqui"
3. Arrasta o PNG do MJ para a zona do prompt correspondente
4. App detecta horizontal, numera `-h-01`, guarda em `course-assets/youtube/images/<promptId>/horizontal/`

---

## Passo 5 — Clips Runway

1. Na mesma página (`funil/gerar`), cada imagem uploaded tem botão **clip**
2. Clica → Runway submete + polling automático
3. ~1 min por clip, custa ~$0.50
4. Clip fica em `course-assets/youtube/clips/<name>.mp4`
5. Re-gera individual se não gostares

Motion prompts estão pré-escritos em `runway-motion-prompts.json` — cada imagem usa o motion do seu prompt (intro fade, dust drift, etc.)

---

## Passo 6 — Montagem final

1. **`/admin/producao/funil/montar`**
2. Clica no botão do episódio
3. Narração carrega sozinha (se está no `youtube/`)
4. Música AG: selecciona 1 faixa (uma só cobre 3-5min, não trocar)
5. Volume: 20% default (ajusta)
6. Clips aparecem na ordem alfabética — reordena com setas ↑↓
7. Motor: **FFmpeg** (grátis, via GitHub Actions)
8. Clica **Montar vídeo**
9. 3-5 min de render:
   - `queued` → `downloading` → `rendering` → `uploading` → `done`
10. Vídeo final em `course-assets/youtube/funil-videos/`
    - Intro: mandala + "A ESCOLA DOS VÉUS" 5s
    - Conteúdo: 9-13 clips com narração + música duckada
    - Outro: mandala + "A ESCOLA DOS VÉUS · seteveus.space" 5s
    - Fades in/out, sem cortes bruscos

---

## Passo 7 — Legenda SRT

1. Mesma página Montar, secção **2. Narração**
2. Botão **"Gerar legenda SRT (Whisper)"**
3. Usa ElevenLabs Scribe (mesma chave do audio-bulk)
4. ~30s, aparece link **"✓ abrir/descarregar SRT"**
5. Download do `.srt`

SRT é line-level (agrupa palavras em frases curtas de ~3-4s). Timings exactos do áudio.

---

## Passo 8 — Upload YouTube

**Via app (`/admin/calendario` tab Upload):**
Depois de configurares o OAuth (setup em baixo), colas os URLs Supabase (MP4, thumbnail, SRT), preenches título/descrição/tags, opcionalmente data de agendamento, clicas **Upload YouTube**. O vídeo sobe com thumbnail + legendas em PT-PT automaticamente.

**Via YouTube Studio (alternativa manual):**
1. `course-assets/youtube/funil-videos/<nome>.mp4` → download do Supabase
2. YouTube Studio → **Upload video** → selecciona MP4
3. Título, descrição, tags
4. Thumbnail: upload manual do PNG de `youtube/thumbnails/`
5. **Subtitles → Add language → Portuguese (Portugal) → Upload file** → SRT
6. Visibility: Scheduled ou Public

### Setup OAuth YouTube (uma vez, ~15 min)

Para o upload via app funcionar:

1. **Google Cloud Console** → New Project
2. **APIs & Services → Library** → "YouTube Data API v3" → Enable
3. **APIs & Services → Credentials** → Create Credentials → OAuth Client ID
4. Application type: Desktop app → copia `client_id` e `client_secret`
5. Abre [OAuth Playground](https://developers.google.com/oauthplayground/)
6. Cog ⚙️ → "Use your own OAuth credentials" → cola client_id + client_secret
7. Scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube.force-ssl` (necessário para legendas)
8. Authorize APIs → entra com a conta do canal YouTube
9. Exchange authorization code for tokens → copia `refresh_token`
10. Vercel → Settings → Environment Variables → adiciona:
    - `GOOGLE_OAUTH_CLIENT_ID`
    - `GOOGLE_OAUTH_CLIENT_SECRET`
    - `GOOGLE_OAUTH_REFRESH_TOKEN`
11. Redeploy

O refresh token não expira (excepto se revogares manualmente). Basta configurar uma vez.

---

## Custos por vídeo

| Item | Por vídeo | 1×/semana (mês) |
|---|---|---|
| Áudio ElevenLabs | ~$0.10 | ~$0.40 |
| Imagens MJ (Standard $30/mês) | incluído | $30 |
| Clips Runway (10×) | ~$5 | ~$20 |
| Render FFmpeg (GitHub Actions) | 0 | 0 |
| SRT Whisper (ElevenLabs) | ~$0.01 | ~$0.04 |
| **Total variável** | **~$5-6** | **~$20-25** |
| **+ Fixos MJ** | — | **~$50/mês** |

---

## Melhorias pendentes

Áreas onde o fluxo ainda é manual/incompleto e vale a pena automatizar:

1. **Thumbnail YouTube** — hoje manual. Podia gerar via FFmpeg (mandala + título episódio sobreposto + cor de acento).
2. **SEO metadata** — título/descrição/tags geradas por IA a partir do script Nomear.
3. **Dashboard de estado por episódio** — mostrar progresso (script ✓ · áudio ✓/× · imagens N/10 · clips N/10 · vídeo ×/✓ · srt ×/✓) na página Funil, para ver onde ficaste em cada.
4. **YouTube upload API** — automatizar upload + agendamento a partir do `/admin/calendario`.
5. **Cross-post** — gerar Shorts verticais automaticamente (trechos de 30s com 1 imagem MJ + frase-chave) para TikTok/IG/YouTube Shorts.
6. **Revisão automática de SRT** — o Scribe pode errar palavras PT-PT menos comuns ("nomear", "véu"); passar uma correcção baseada no texto original do script.

Priorizar por ordem: **3** (ver progresso) → **1** (thumbnail) → **4** (upload YouTube) → **2** (SEO) → **6** (SRT fix) → **5** (cross-post).

---

## Atalhos do admin

| URL | Para quê |
|---|---|
| `/admin/producao/funil` | Lista de episódios + tab Prompts |
| `/admin/producao/funil/gerar` | Upload imagens + gerar clips |
| `/admin/producao/funil/montar` | Montagem final + SRT |
| `/admin/producao/audios` | Áudios ElevenLabs em massa |
| `/admin/producao/ancient-ground` | Pipeline separado (natureza 1h) |
| `/admin/biblioteca` | Browser do Supabase |
| `/admin/calendario` | Calendário de publicação |
