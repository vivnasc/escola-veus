# Estado actual — Shorts Loranne lyric/sync (sessão 2026-05-11)

> Documento de registo do estado do pipeline de geração de shorts/fulls
> com legendas, ao fim desta sessão. Para continuar no próximo arranque.

## TL;DR

O pipeline finalmente funciona com legendas **estilo TikTok queimadas via FFmpeg**, ao
invés do overlay React/Remotion que falhou em múltiplas iterações. A solução veio
por insistência da user em apontar que devíamos copiar o pipeline de funil em vez
de continuar a tentar overlays React.

`RENDER_VERSION = "2026-05-11-srt-captions-ffmpeg-burn"` — main, depois do PR #334.

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

## Próximas melhorias pedidas (TODO)

User pediu para a próxima sessão:

### 1. Padrões visuais únicos por música, dentro da identidade de cada artista

- Cada faixa Loranne deve ter um padrão visual próprio (variação dentro da
  paleta/tipografia Loranne).
- Mesmo para AG (Ancient Ground): cada faixa com pattern único dentro da
  identidade AG.
- **Aplicação:** estender `motionVariant` para incluir variações de motion
  background ou paleta accent **estáveis por trackId** (não rotativas por
  semana como `MOTION_VARIANTS[(week + DAY_ORDER.indexOf(day)) % 4]`).
- Considerar registar `trackPattern` no manifest (índice estável derivado do
  `trackId` por hash → variant) para que cada faixa tenha sempre o mesmo visual.

### 2. Legendas Loranne: tamanho menor e cor dourada

- **Tamanho:** reduzir `FontSize=26 → 22` (ou `20` se ainda pesado em 1080×1920).
- **Cor:** mudar `PrimaryColour=&H00E6F0F5` (cream) → **dourado escola-dourado**.
  - Hex dourado do tema: ~`#C9A961` (verificar valor exacto em
    `escola-veus-app/tailwind.config.ts` ou `src/styles`).
  - Conversão BGR libass: `#C9A961` → `0061A9C9` → `&H000061A9C9` (formato
    `&H00BBGGRR`).
- Local: `DEFAULT_SUBTITLE_STYLE` em `tools/render-shorts-remotion/render.mjs`.

### 3. Possibilidade: word-by-word karaoke (palavra cantada destacada)

Avaliar:
- **libass karaoke tags** (`{\k<centisec>}word`) — suportadas pelo ffmpeg
  subtitles filter. Pode gerar-se ASS em vez de SRT a partir dos Scribe words
  com cada `{\kN}` baseado em `(word.end - word.start) * 100`. Cor primária
  cream + secundária dourado, libass anima a transição.
- **Forced Alignment** dá timestamps por palavra da letra real — melhor para
  karaoke do que Scribe (que pode mistranscrever em música cantada). Trocar a
  fonte da geração ASS para Forced Alignment se a precisão Scribe não chegar.
- Decidir se aplica só a Loranne (lyric video) ou também AG full com story.

## Continuação prompt (paste no início da próxima sessão)

```
Trabalhamos no pipeline de shorts/fulls Loranne da escola-veus
(repo vivnasc/escola-veus). Lê primeiro o ficheiro
ESTADO-SHORTS-LORANNE-2026-05-11.md no root do repo para perceber
o estado actual.

Tarefas para esta sessão (por ordem):

1. PADRÕES VISUAIS ÚNICOS POR MÚSICA
   Hoje o `motionVariant` em `lib/shorts/render-remotion-core.ts` rotaciona
   semanalmente por (week, day). Quero que cada faixa Loranne e AG tenha um
   pattern visual estável (mesmo visual sempre que a mesma faixa renderiza),
   dentro da paleta/tipografia da respectiva marca. Propor: derivar
   `motionVariant` (e/ou `accent`) por hash do trackId/slug em vez de
   rotação (week, day). Mostrar implementação concreta antes de mexer.

2. ESTILO DAS LEGENDAS LORANNE
   Em `tools/render-shorts-remotion/render.mjs` mexe o `DEFAULT_SUBTITLE_STYLE`:
   - FontSize: 26 → 22 (testar 20 também)
   - Cor: cream &H00E6F0F5 → dourado escola-dourado (ver hex em
     tailwind.config.ts, converter para BGR libass)
   - Manter Italic, Outline e MarginV
   Bumpar RENDER_VERSION e abrir PR.

3. KARAOKE WORD-BY-WORD (avaliar viabilidade primeiro)
   Avaliar gerar .ass em vez de .srt com tags `{\kN}` libass por palavra
   (Scribe já dá timestamps word-level). Cor primária cream, secundária
   dourado — libass anima transição palavra-a-palavra. Antes de
   implementar, mostrar exemplo de output .ass que seria gerado para 1
   stanza e perguntar à user se o efeito é o pretendido.

IMPORTANTE — modus operandi a manter nesta sessão:
- Antes de empurrar código: ler o código existente e confirmar que a
  alteração combina com a arquitectura.
- Não propor soluções alternativas sem evidência de que o caminho
  actual está bloqueado.
- A user (vivnasc) tem razão até prova em contrário — se reportar bug
  ou comportamento errado, assumir que é real e procurar no MEU código
  primeiro. Não pedir prints/logs como primeira ferramenta de diagnóstico.
- A user usa iPad maioritariamente; preferir botões UI a curl/CLI
  sempre que possível.
- Cuidado com storage Supabase: paths de mp4 SÃO estáveis (sem
  timestamp); manifests/results mantêm jobId com timestamp. Há rota
  /api/admin/weekly/cleanup que apaga mp4s órfãos antigos.
- Workflow GH Actions tem timeout-minutes: 90 e concurrency=4 — não
  reverter.
- Cache Scribe está em `course-assets/scribe-cache/<sha1>.json` —
  invalida apenas quando audioUrl muda.
- Cada commit faz bump de `RENDER_VERSION` em
  `escola-veus-app/src/lib/shorts/render-version.ts`.
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
