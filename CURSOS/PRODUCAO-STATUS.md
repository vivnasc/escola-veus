# Escola dos Véus — Estado da Produção

**Última actualização:** 2026-04-20 (reestruturação admin + funil Ouro Próprio)

> Ficheiro único de continuidade entre sessões. Ler no início de cada sessão nova.
> Actualizar no fim. Histórico antigo em `_arquivo-historico/INDEX.md`.

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
- Imagens base: ThinkDiffusion SDXL RealVisXL v4 (1920×1080)
- Regras Colecção B: **sem pessoas**, abstracto/simbólico, global (nada africano)
- Música Ancient Ground + texto overlay contemplativo
- Cada vídeo: áudio Nomear (~100s) / clip 10s = ~10 clips por vídeo
- Prompts editáveis em `/admin/producao/funil` (tab Prompts) — persistem em Supabase, sem deploy

### Ancient Ground (natureza)
- Imagens realistas Moçambique (mar, praia, rio, savana, céu, flora)
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
| Shotstack | `SHOTSTACK_API_KEY` + `SHOTSTACK_ENV` | OK |
| Supabase | NEXT_PUBLIC + SERVICE_ROLE | OK — bucket `course-assets` |
| fal.ai / Flux / LoRA | **ABOLIDO** | — |
| Suno | **RISCADO** | Não usar — música = Ancient Ground |

---

## Próximas acções (ordem)

1. **Validar ep01 visualmente** no ThinkDiffusion (11 prompts). Ajustar tom se precisar.
2. **Gerar Limite Sagrado** — 8 eps Nomear (ep07, ep08 + ampliação Ep 44-47 série 6 + ampliação série 2).
3. Continuar pelos 5 cursos com áudios prontos: Sangue e Seda, Silêncio que Grita, Pele Nua, A Fome, A Chama.
4. Terminar áudios ElevenLabs em falta (~10 Nomear + vários de cursos).
5. Piloto: render completo do ep01 (áudio + 11 clips Runway + texto + música → MP4).
6. Upload YouTube API + agendamento em `/admin/calendario` (hoje é stub).

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
