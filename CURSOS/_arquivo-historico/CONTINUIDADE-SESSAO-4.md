# Prompt de Continuidade — Sessão 5

**Projecto:** Escola dos Véus (@vivnasc/escola-veus)
**Branch:** claude/fix-runway-generation-iyIk9

LER POR ESTA ORDEM antes de qualquer trabalho:
1. /CURSOS/ROADMAP-VIDEO-PIPELINE.md — roadmap das 4 fases
2. /CURSOS/PRODUCAO-STATUS.md — estado completo
3. /CURSOS/CONTINUIDADE-SESSAO-4.md — ESTE FICHEIRO

---

## O QUE FOI FEITO NA SESSÃO 3 (2026-04-17)

### Pipeline YouTube Completo
- Página `/admin/thinkdiffusion` — gerar imagens + upload + gerar clips
- Página `/admin/youtube-montagem` — montar vídeo longo + Shotstack render
- 107 prompts ThinkDiffusion (15 mar + 15 praia + 15 rio + restantes)
- 45 motion prompts Runway (editáveis pela Vivianne)
- Music: 100 faixas ancient-ground (pares A+B loop)

### Imagens Geradas (Oceano Índico)
- 8 prompts × 4 horizontais + 4 verticais = ~60 imagens
- Guardadas em Supabase: `course-assets/youtube/images/mar-*/horizontal/` e `vertical/`
- Upload por prompt com auto-rename e detecção H/V

### Clips Runway Gerados
- ~50 clips submetidos via API (gen4_turbo, 10s, 1280:720)
- ~30 guardados com nomes correctos no Supabase
- 19 recuperados de timeout (nomes `recovered-*.mp4` — PRECISAM DE RENOMEAR MANUALMENTE)
- Clips em: `course-assets/youtube/clips/`
- 800 créditos Runway restantes

### Fixes Críticos
- TaskIds agora guardados no Supabase ANTES de polling (nunca mais se perdem)
- 5s de pausa entre submissões batch (evita rate limit)
- Rota `/api/admin/thinkdiffusion/complete-tasks` — recupera clips pendentes
- Upload de imagens via FormData binário (sem compressão, qualidade total)

---

## O QUE FALTA FAZER (por prioridade)

### URGENTE — Antes de montar o vídeo
1. **Renomear 19 clips recovered** — no Supabase, ver cada clip, renomear para `mar-XX-nome-h-NN.mp4`
2. **Regenerar clips que faltam** — limite diário Runway reseta amanhã
3. **Gerar clips dos novos prompts** (mar-09 a mar-15) — precisam de imagens primeiro no ThinkDiffusion

### Montagem do primeiro vídeo longo
1. Ir a `/admin/youtube-montagem`
2. Carregar clips do Supabase (por ordem dos prompts)
3. Escolher par de música ancient-ground
4. Render via Shotstack → MP4
5. Upload YouTube

### Metadados YouTube (Moçambique no centro)
- Títulos, descrições, hashtags que elevem Moçambique
- Vivianne pediu que fique claro que o projecto eleva Moçambique

### Colecção B — Imagens dos cursos (global, abstracto)
- Prompts SEM pessoas, SEM estereótipos africanos
- Temas: espelho, porta, luz, tecido, vazio, fragmento, raiz, tempo
- Para vídeos YouTube associados aos 20 cursos
- Vivianne aprovou a filosofia visual proposta

---

## REGRAS INVIOLÁVEIS

1. **NÃO mudar funcionalidades sem a Vivianne pedir**
2. **NÃO usar fal.ai** — ThinkDiffusion (créditos $34) é o gerador de imagens
3. **NÃO comprimir imagens** — qualidade total PNG sempre
4. **NÃO baralhar clips** — seguir sequência dos prompts
5. **TaskIds SEMPRE guardados no Supabase** antes de polling
6. **5s de pausa** entre submissões Runway batch
7. **Página Imagens** — prompts e settings colapsáveis, upload sempre visível
8. **Horizontal = vídeos longos**, Vertical = Shorts (pipelines separados)
9. **Runway API**: gen4_turbo, 10s, horizontal 1280:720, vertical 720:1280
10. **Música**: ancient-ground pares (faixa-01+02, 03+04, etc.) em loop

---

## CONTAS E CRÉDITOS

| Serviço | Saldo | Notas |
|---------|-------|-------|
| ThinkDiffusion | ~$32 | Tier QUICK $0.79/hr ou ULTRA $1.99/hr |
| Runway API | 800 cr | Limite diário ~50 clips. $0.01/cr, gen4_turbo 5cr/s |
| Shotstack | Configurado | stage (watermark) ou v1 (produção) |
| Supabase | Ilimitado | Bucket course-assets (público) |

---

## MAPA DE FICHEIROS NOVOS

```
tools/
  thinkdiffusion-batch/
    generate.js              — batch CLI (não usado, Vivianne prefere web)
    prompts.json             — 107 prompts (sincronizado com src/data/)
    select-by-mood.js        — mood selector

  escola-veus-cli/
    cli.js                   — CLI cursos (parse + preview)

  youtube-pipeline/
    music-ancient-ground.json — 100 faixas URLs

escola-veus-app/src/
  data/
    thinkdiffusion-prompts.json  — 107 prompts (mar, praia, rio, etc.)
    video-plan.json              — 50 vídeos planeados
    runway-motion-prompts.json   — motion prompts por cena (editáveis)

  app/admin/
    thinkdiffusion/page.tsx      — gerar imagens + upload + clips
    youtube-montagem/page.tsx    — montar vídeo longo

  app/api/admin/
    thinkdiffusion/
      generate/route.ts          — proxy A1111 (não funciona com ThinkDiffusion)
      generate-falai/route.ts    — fal.ai (backup, não preferido)
      save-image/route.ts        — upload imagem ao Supabase
      save-clip/route.ts         — upload clip ao Supabase
      save-task/route.ts         — guardar taskId no Supabase
      list-images/route.ts       — listar imagens existentes
      complete-tasks/route.ts    — recuperar clips pendentes
      recover-all/route.ts       — recuperação de emergência (taskIds hardcoded)
      rename-recovered/route.ts  — renomear recovered (não funcionou)
      gen-script/route.ts        — gerar script para consola ThinkDiffusion
      export-template/route.ts   — template MD para motion prompts
      import-prompts/route.ts    — importar motion prompts de MD

    youtube/
      generate-clips/route.ts    — batch Runway clip generation
      render/route.ts            — Shotstack render (clips + música → MP4)

    music/
      list-album/route.ts        — listar faixas de um álbum Supabase
```
