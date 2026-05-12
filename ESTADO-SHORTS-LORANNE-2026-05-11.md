# Estado actual — Shorts Loranne + Ancient Ground (sessão 2026-05-11)

> Documento de registo do estado dos pipelines de shorts/fulls **para as três
> marcas (Loranne, Ancient Ground, Escola dos Véus)** ao fim desta sessão.
> Para continuar no próximo arranque.

## TL;DR

Esta sessão tocou **só no caminho Loranne** (lyric video com letras cantadas).
**Ancient Ground não foi alterada** — continua com `storyChapters` em React
overlay. **Escola dos Véus não foi alterada** — só nasceu PR #322 com o
endpoint `/api/admin/escola-veus/package` para CSV/Drive de upload, sem mexer
no visual dos vídeos.

Os TODOs da próxima sessão aplicam-se **às três marcas**, não só Loranne.

`RENDER_VERSION = "2026-05-11-srt-captions-ffmpeg-burn"` — main, depois do PR #334.

## Os três caminhos coexistem hoje

| | **Loranne (lyric)** | **Ancient Ground** | **Escola dos Véus** |
|---|---|---|---|
| Conteúdo | Música cantada com letras | Música instrumental | Episódios curso/longos didácticos |
| Plano weekly | Sim (`weekly/plan`) | Sim (`weekly/plan`) | Não (pipeline próprio em `admin/producao/escola-veus`) |
| `lyricsSync` no manifest | `true` (sempre) | `false` (sempre) | n/a (não passa por `render-remotion-short`) |
| Fonte de texto no vídeo | Scribe (STT) sobre o áudio | `storyChapters` do plano (texto narrativo) | Próprio (PDFs, cadernos, longos) |
| Pipeline de overlay | SRT + FFmpeg burn (esta sessão) | React/Remotion `SyncedLyricsLayer` (story-mode) | Pipeline próprio (longos, cadernos PDF) |
| Visual actual | Liberation Serif italic cream queimada via libass | Playfair Display cream render React | Variado (vídeos longos `render-longo`, PDFs, etc.) |
| Mudou esta sessão? | ✅ Tudo refeito | ❌ Intocada | ❌ Só o endpoint `/package` (CSV upload Drive — PR #322) |



## Pipeline actual (Loranne lyric short / full)

1. **`/api/admin/weekly/plan`** — gera `WeeklyPlan` com `syncedLyrics` (stanzas
   limpas via parser de tags Suno multi-linha — fix do PR #328).
2. **`/api/admin/weekly/dispatch`** — escreve manifest a `course-assets/render-jobs/<jobId>.json`
   e dispatch via `workflow_dispatch` no `render-remotion-short.yml`.
3. **Worker `tools/render-shorts-remotion/render.mjs`:**
   1. Lê manifest.
   2. `ensureStanzaTimings(manifest)` — chama **ElevenLabs Scribe**
      (`/v1/speech-to-text`) sobre o MP3 (com cache em
      `course-assets/scribe-cache/<sha1>.json`). Computa `stanzaTimings` via
      `alignStanzas()` para apurar `audioStartFromSec` no clip (chorus shift).
   3. `ensureFullDuration(manifest)` — ffprobe se mode=full sem duração.
   4. **Gera `.srt`** a partir dos Scribe words via `wordsToSrt(words, offset, maxSec)`
      (mesmo padrão do funil). Para clip: offset = audioStartFromSec, max = 30s.
      Para full: offset = 0, sem max.
   5. **Desliga overlay Remotion:** `manifest.lyricsSync = false` + `verses = ["", ""]`
      antes do `renderMedia()`. Composition cai no else-fallback que renderiza
      `VerseOverlay` com text vazio → returns null → nada de texto no vídeo.
   6. **Remotion renderiza mp4 limpo** (motion + audio, sem texto).
   7. **FFmpeg burn:** `ffmpeg -i mp4 -vf "subtitles=foo.srt:force_style='...'" -c:v libx264 -preset veryfast -crf 20 -c:a copy out.mp4`
      → mp4 com legendas queimadas.
   8. Upload do mp4-burned para `course-assets/shorts/videos/<stableId>.mp4`
      (path estável, sem timestamp — re-renders substituem). URL retornada com
      `?v=<timestamp>` para cache-busting do browser.
   9. Resultado em `course-assets/render-jobs/<jobId>-result.json` (jobId mantém
      timestamp).

## Estilo das legendas (libass `DEFAULT_SUBTITLE_STYLE`)

Em `tools/render-shorts-remotion/render.mjs:~440`:

```
FontName=Liberation Serif,FontSize=26,Italic=1,
PrimaryColour=&H00E6F0F5,            // cream #F5F0E6
OutlineColour=&H00000000,             // outline preto
BorderStyle=1,Outline=1,Shadow=1,     // sem caixa opaca
Alignment=2,MarginV=120               // bottom-center, 120px do fundo
```

Override por job via `manifest.subtitleStyle` (string libass válida).

## Bugs corrigidos nesta sessão (cronológico)

| PR | Sha | Fix |
|---|---|---|
| #322 | `87b9489` | Endpoint `/api/admin/escola-veus/package` para empacotamento Drive |
| #325 | `d0fcd39` | Build Vercel quebrado por export inválido `HASHTAGS_YT` em `route.ts` |
| #325 | (idem) | Container preview UI `aspect-16/9` quando tab "Full" activo (antes hard-coded 9/16 escondia que fulls landscape funcionavam) |
| #325 | (idem) | Override `composition.width/height` no worker baseado em `manifest.orientation` (belt-and-suspenders ao `calculateMetadata` do Root.tsx) |
| #325/#327 | `7b05c29` | Reverter "clip uniform forçado" — voltava a rotação sem sync |
| #328 | `48c85cf` | **Root cause brackets:** parser `lyricsToStanzasWithKind` agora trata linhas que abrem com `[` sem fechar como continuação de tag truncada Suno multi-linha (`[Vocal: ONE warm mezzo-contralto…sl`). Sem este fix, esse texto entrava como letra cantada |
| #328 | `2dfea7f` | `alignStanzas` mais robusto: tokens ≥3 chars, skip de tokens encalhados, threshold 30% (era 70%) |
| #329 | `2f6ca39` | Workflow `timeout-minutes: 90` + `renderMedia concurrency: 4` (ubuntu-latest 4 cores). Fulls de 3.5min cabem em ~25min em vez de cancelados |
| #330 | `51e98e6` | mp4 path estável (sem timestamp) + endpoint `/api/admin/weekly/cleanup` + botão UI 🧹 |
| (descartado) | `61ea509` | Tentativa: ElevenLabs Forced Alignment (`/v1/forced-alignment`). Funcionou mas user preferiu approach SRT/legenda |
| #334 | `6e319b3` `7001d96` `63e481f` | **SRT + FFmpeg burn** pipeline igual ao funil. Estilo Loranne (Liberation Serif Italic cream). Fix do fallback verses overlay |

## Decisões arquitecturais

- **Forced Alignment ficou em código mas desactivado.** Função `callForcedAlignment`
  e cache `forced-align-cache/` permanecem em `render.mjs`. Para reactivar (caso
  de música muito desafiante para Scribe), basta trocar `tryFetchScribeCache` por
  `tryFetchForcedAlignCache` em `ensureStanzaTimings` e swap das chamadas.
- **`alignStanzas` continua a correr** mesmo que o overlay seja desligado — usa-se
  o `stanzaTimings` apenas para computar `audioStartFromSec` (chorus shift) que
  shifta a SRT. Se o chorus detect falhar, o clip pode arrancar no início do
  tema em vez do refrão.
- **`hasStory` (AG full com storyChapters) continua a usar overlay Remotion**, não
  passa pela queima SRT. Esta sessão tocou apenas no caminho Loranne.

## Arquivos chave para próxima sessão

```
tools/render-shorts-remotion/render.mjs                          # worker GH Actions
escola-veus-app/src/remotion/shorts/ShortsComposition.tsx        # composition Remotion
escola-veus-app/src/lib/shorts/render-remotion-core.ts           # constrói manifest
escola-veus-app/src/lib/shorts/lyrics-stanzas.ts                 # parser stanzas + sanitize
escola-veus-app/src/lib/shorts/render-version.ts                 # RENDER_VERSION constant
escola-veus-app/src/app/api/admin/weekly/dispatch/route.ts       # dispatch route
escola-veus-app/src/app/api/admin/weekly/plan/route.ts           # plan + chorusStanzaIdx detect
escola-veus-app/src/app/api/admin/weekly/cleanup/route.ts        # cleanup mp4s órfãos
escola-veus-app/src/components/admin/WeeklyBulkPanel.tsx         # painel UI weekly
escola-veus-app/src/app/api/admin/funil/generate-srt/route.ts    # referência: SRT do funil
tools/render-funil/render.mjs                                    # referência: FFmpeg burn do funil
```

## Próximas melhorias pedidas (TODO) — APLICAR ÀS 3 MARCAS

User pediu para a próxima sessão:

### 1. Padrões visuais únicos por música/conteúdo, dentro da identidade de cada marca

Aplicar **a todas**:
- **Loranne:** cada faixa com pattern visual estável (mesma faixa → mesmo
  visual sempre que renderiza), dentro da paleta/tipografia Loranne. Hoje
  `MOTION_VARIANTS[(week + DAY_ORDER.indexOf(day)) % 4]` em
  `app/api/admin/weekly/plan/route.ts:216` rotaciona por semana — quero
  estabilidade por `trackId`.
- **Ancient Ground:** mesmo princípio, cada faixa instrumental AG com
  pattern próprio dentro da identidade AG (paleta terra/raízes).
- **Escola dos Véus:** cada episódio/conteúdo do curso com pattern próprio
  dentro da identidade EV. Verificar o que aplica — `admin/producao/escola-veus`
  e `tools/render-longo` têm pipelines próprios.

**Implementação proposta:**
- Derivar `motionVariant` (e/ou `accent`) por **hash do trackId/slug** em
  vez de rotação `(week, day)`. Função stable: `motionFromTrackId(slug)
  → "A" | "B" | "C" | "D"`.
- Registar `trackPattern` no manifest para auditoria.
- Mexer: `app/api/admin/weekly/plan/route.ts` (Loranne + AG), e investigar
  se Escola dos Véus precisa de mudança equivalente.

### 2. Legendas Loranne: tamanho menor e cor dourada

Aplica-se hoje só a Loranne (única marca com SRT burn):
- **Tamanho:** reduzir `FontSize=26 → 22` (ou `20` se ainda pesado em 1080×1920).
- **Cor:** mudar `PrimaryColour=&H00E6F0F5` (cream) → **dourado escola-dourado**.
  - Hex dourado do tema: ~`#C9A961` (verificar valor exacto em
    `escola-veus-app/tailwind.config.ts` ou `src/styles`).
  - Conversão BGR libass: `#C9A961` → `&H000061A9C9` (formato `&H00BBGGRR`).
- Local: `DEFAULT_SUBTITLE_STYLE` em `tools/render-shorts-remotion/render.mjs`.

**E os outros?** AG não tem SRT (overlay React). Escola dos Véus tem pipeline
próprio — verificar se também quer afinar tipografia/cores para coerência.

### 3. Word-by-word karaoke (palavra cantada destacada) — avaliar viabilidade

Aplica-se principalmente a **Loranne** (lyric video):
- **libass karaoke tags** (`{\k<centisec>}word`) suportadas pelo `ffmpeg
  subtitles=` filter. Gerar `.ass` em vez de `.srt` a partir dos Scribe words
  com `{\kN}` por palavra. Cor primária cream/dourado + secundária outro tom,
  libass anima transição palavra-a-palavra.
- **Forced Alignment** (já em código, desactivado) dá timestamps por palavra
  da letra real — melhor para karaoke do que Scribe (que pode mistranscrever
  música cantada). Trocar fonte da geração `.ass` para Forced Alignment se a
  precisão Scribe não chegar.
- Avaliar se aplica também a **AG** (full com story) ou apenas Loranne.
  Escola dos Véus provavelmente não — é didáctico, não musical.

## Continuação prompt (paste no início da próxima sessão)

```
Trabalhamos no pipeline de produção de conteúdo para 3 MARCAS da
escola-veus (repo vivnasc/escola-veus): Loranne (música cantada),
Ancient Ground (música instrumental), e Escola dos Véus (curso).

Lê primeiro o ficheiro ESTADO-SHORTS-LORANNE-2026-05-11.md no root
do repo. Tem o panorama completo + a tabela das 3 marcas.

Tarefas para esta sessão (por ordem):

1. PADRÕES VISUAIS ÚNICOS POR MÚSICA/CONTEÚDO (3 MARCAS)
   Hoje em app/api/admin/weekly/plan/route.ts:216, MOTION_VARIANTS
   rotaciona por (week, day) — mesmo trackId pode ter pattern
   diferente em semanas diferentes. Quero ESTABILIDADE: cada
   faixa/conteúdo tem sempre o seu visual.
   - Loranne: hash(trackId) → motion + accent dentro da paleta
     Loranne.
   - Ancient Ground: hash(trackId) → motion + accent dentro da
     paleta AG.
   - Escola dos Véus: investigar pipeline (admin/producao/escola-veus
     e tools/render-longo). Aplicar mesmo princípio se faz sentido.
   Mostrar implementação concreta antes de mexer.

2. ESTILO DAS LEGENDAS LORANNE (só Loranne tem SRT hoje)
   Em tools/render-shorts-remotion/render.mjs mexe DEFAULT_SUBTITLE_STYLE:
   - FontSize: 26 → 22 (testar 20 se ainda pesado em 1080×1920)
   - Cor: cream &H00E6F0F5 → dourado escola-dourado
     (hex exacto em tailwind.config.ts, converter BGR libass formato
     &H00BBGGRR)
   - Manter Italic, Outline, MarginV
   Bumpar RENDER_VERSION e abrir PR.

   Avaliar se AG ou Escola dos Véus também querem afinação tipográfica
   coerente nos seus pipelines próprios.

3. KARAOKE WORD-BY-WORD (avaliar viabilidade primeiro)
   Avaliar gerar .ass em vez de .srt com tags {\kN} libass por palavra
   (Scribe já dá timestamps word-level). Cor primária cream/dourado +
   secundária outro tom — libass anima transição palavra-a-palavra.
   Aplica a Loranne. Avaliar se AG full (instrumental com story
   chapters) também faz sentido. Escola dos Véus provavelmente não.
   Antes de implementar, mostrar exemplo de output .ass para 1 stanza
   e perguntar à user se o efeito é o pretendido.

IMPORTANTE — modus operandi a manter nesta sessão:
- Antes de empurrar código: ler o existente, confirmar que a
  alteração combina com a arquitectura.
- Não propor soluções alternativas sem evidência de que o caminho
  actual está bloqueado.
- Quando a user reporta bug/comportamento errado: assumir que é real
  e procurar no MEU código primeiro. Não pedir prints/logs como
  primeira ferramenta de diagnóstico.
- A user usa iPad maioritariamente — preferir botões UI a curl/CLI.
- 3 marcas, não 1 — quando fizer uma mudança, perguntar se aplica
  às outras antes de assumir que é só Loranne.
- Cuidado com storage Supabase: paths de mp4 SÃO estáveis (sem
  timestamp); manifests/results mantêm jobId com timestamp. Há rota
  /api/admin/weekly/cleanup que apaga mp4s órfãos antigos.
- Workflow GH Actions tem timeout-minutes: 90 e concurrency=4 — não
  reverter.
- Cache Scribe em course-assets/scribe-cache/<sha1>.json — invalida
  apenas quando audioUrl muda.
- Cada commit faz bump de RENDER_VERSION em
  escola-veus-app/src/lib/shorts/render-version.ts.
- PRs com título descritivo + body curto com "antes/depois".
```

## Branch + PRs neta sessão

- **Branch:** `claude/weekly-content-generator-BFogS`
- **PRs merged (cronológico):** #322, #325, #327, #328, #329, #330, #333, #334
- **Forced Alignment quedou em código DESACTIVADO** (pode ser reactivado se Scribe
  falhar em algumas faixas).

## Estado de risco residual

- Word-by-word karaoke ainda não existe (TODO acima).
- Algumas faixas (chorus muito curto, instrumental longo a meio dos 30s)
  podem ter gaps de legendas — é correcto mas pode parecer estranho.
- Se Scribe falhar a transcrever uma faixa específica em PT, fácil trocar
  para Forced Alignment a uma só linha (`tryFetchScribeCache` →
  `tryFetchForcedAlignCache`, com hash audio+text).
