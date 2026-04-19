# Prompt de Continuidade — Sessão 5

**Projecto:** Escola dos Véus (@vivnasc/escola-veus)
**Branch:** claude/fix-runway-generation-iyIk9
**Última sessão:** 2026-04-19 (sessão 3+4 combinada, muito longa)

LER POR ESTA ORDEM:
1. /CURSOS/VIDEOS-YOUTUBE-CONCEITO.md — conceito dos 2 tipos de vídeo
2. /CURSOS/ROADMAP-VIDEO-PIPELINE.md — roadmap 4 fases
3. Este ficheiro — estado actual + o que fazer

---

## ESTADO ACTUAL (19 Abril 2026)

### Vídeo 1 — Oceano Índico
- **Imagens:** ~60 horizontais + ~60 verticais (8 prompts × 4 cada + 7 novos prompts)
- **Clips:** ~50 clips no Supabase (`youtube/clips/`)
- **Clips regenerados:** alguns com `?t=timestamp` no URL (cache-bust)
- **Clips com problemas:** mar-08-tempestade (tremia), mar-14-ondas-lentas (piscava), mar-15-crepusculo h-04 (artefacto nocturno)
- **Música:** 100 faixas ancient-ground prontas (pares A+B)
- **Montagem:** página carrega clips automaticamente, tem thumbnails com hover-to-play

### O QUE FUNCIONA
- Página `/admin/thinkdiffusion` — prompts, upload, gerar clips, editar motion prompts, regenerar, apagar
- Página `/admin/youtube-montagem` — carrega clips do Supabase, dropdown vídeo, música, preview, render
- TaskIds guardados no Supabase antes de polling (nunca se perdem)
- 5s de pausa entre submissões batch
- Sync de imagens e clips do Supabase ao carregar página
- Motion prompts editáveis por imagem
- Cache-bust em URLs de clips

### O QUE FALTA FAZER AGORA

#### PRIORITÁRIO — Página Montagem
1. **Reordenar clips por GRUPOS de 4** — cada prompt (mar-01, mar-02...) é um grupo de 4 clips. Vivianne quer:
   - Reordenar DENTRO de cada grupo (trocar posição dos 4 clips)
   - Reordenar a ORDEM dos 15 grupos (qual grupo sai primeiro no vídeo)
   - Dropdown de posição por grupo, não por clip individual
2. **Thumbnail** — secção para escolher uma imagem como thumbnail do vídeo YouTube
3. **Preview correcto** — clips devem tocar na ordem definida
4. **Render Shotstack** — testar montagem completa (clips + música → MP4)

#### CORRIGIR
1. **Prompts carregáveis via ficheiro** — mover prompts para Supabase para editar sem deploy
2. **Clips com cache** — list-clips já tem `?t=timestamp` mas verificar se funciona em todo o lado
3. **Clip com .mp4.mp4** — mar-09-amanhecer-rosa-h-03.mp4.mp4 (extensão duplicada)

#### PRÓXIMO — Mais conteúdo
1. **Gerar imagens novos prompts** (mar-09 a mar-15, praia-16 a praia-20) — ThinkDiffusion
2. **Prompts Wimby + Pemba** já estão no código (praia-16 a praia-20)
3. **Praias do norte** — Ilha de Moçambique, Quirimbas, Nacala
4. **Colecção B** — imagens abstractas para vídeos dos cursos (aprovado, por criar prompts)

---

## DECISÕES FIRMES (NÃO MUDAR SEM VIVIANNE PEDIR)

1. ThinkDiffusion para imagens (NÃO fal.ai)
2. Sem compressão (PNG original)
3. Só imagens HORIZONTAIS — vertical corta-se da horizontal
4. Clips seguem sequência dos prompts
5. TaskIds SEMPRE no Supabase antes de polling
6. 5s pausa entre submissões batch
7. Motion prompts editáveis pela Vivianne
8. NÃO mudar funcionalidades sem Vivianne pedir
9. Projecto ELEVA MOÇAMBIQUE
10. Créditos: Ancient Ground — music.seteveus.space (NÃO Loranne)

---

## CRÉDITOS E CONTAS

| Serviço | Saldo | Notas |
|---------|-------|-------|
| ThinkDiffusion | ~$30 | QUICK $0.79/hr, ULTRA $1.99/hr. Checkpoint: UltraReal |
| Runway API | ~200 cr | Limite diário ~50 clips. gen4_turbo 5cr/s |
| Shotstack | Configurado | SHOTSTACK_ENV + API_KEY no Vercel |
| Supabase | Ilimitado | Bucket course-assets (público) |

---

## FICHEIROS CHAVE

```
escola-veus-app/src/data/
  thinkdiffusion-prompts.json   — 112 prompts (15 mar, 20 praia, 15 rio, restantes)
  runway-motion-prompts.json    — motion prompts por cena (editáveis)
  video-plan.json               — 50 vídeos planeados
  youtube-metadata.json         — títulos, descrições, hashtags SEO (6 vídeos)

escola-veus-app/src/app/admin/
  thinkdiffusion/page.tsx       — imagens + upload + clips + editar prompts
  youtube-montagem/page.tsx     — montagem vídeo longo

CURSOS/
  VIDEOS-YOUTUBE-CONCEITO.md    — conceito completo (2 tipos de vídeo)
  CONTINUIDADE-SESSAO-5.md      — ESTE FICHEIRO
  ROADMAP-VIDEO-PIPELINE.md     — roadmap 4 fases
```

---

## ERROS A NÃO REPETIR

1. NÃO submeter todos os clips ao mesmo tempo — usar 5s de pausa
2. NÃO mudar motion prompts em bulk sem verificar resultado
3. NÃO usar "dancing", "shimmering", "twinkling", "shifting" em motion prompts — causa flickering
4. NÃO gerar imagens verticais — SD1.5/UltraReal distorce. Usar só horizontal e cortar
5. NÃO perder taskIds — guardar no Supabase ANTES de polling
6. NÃO remover funcionalidades sem Vivianne pedir
7. Negative prompt deve incluir: "multiple moons, duplicate moon, multiple suns, duplicate sun, two moons, two suns"
