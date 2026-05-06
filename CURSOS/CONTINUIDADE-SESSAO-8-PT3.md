# Sessao 8 pt.3 — 2026-04-26

**Branch:** `claude/review-session-8-status-bwaOf` (último commit `91d7d89`)
**Status:** vídeos do M1-M8 de Ouro Próprio renderizados e em produção (24 sub-aulas, excepto M3·B com timeout no Install FFmpeg que precisa de re-run).
**PRs abertas (não mergeadas):** [#263](https://github.com/vivnasc/escola-veus/pull/263) faixa AG no render bulk, [#265](https://github.com/vivnasc/escola-veus/pull/265) timeout detection.

> Sessão muito longa. Vivianne atingiu limite Vercel de deploys/24h e mudou de sessão.

---

## O que ficou feito (resumo executivo)

### A. Editor editorial autónomo no preview admin
`/admin/producao/aulas/preview/[slug]/[m]/[sub]` deixou de ser só pré-visualização — é onde tudo se edita sem deploy. Persistência em Supabase (`course-assets/admin/aulas-config/<slug>/m<N>-<letter>.json`).

- 5 campos do script editáveis com autosave
- Quebra em blocos manual (juntar/dividir blocos por acto)
- Timing por slide + multiplicador global de ritmo
- Picker de faixa Ancient Ground (do bucket `audios`, não `course-assets`)
- Volumes em dB por acto
- Botão "↩ Repor original deste slide" e "↩ Repor toda a aula"
- "Mostrar texto original" copy-to-clipboard

### B. Edição global do curso
- `/admin/producao/aulas/editar/[slug]` — 24 sub-aulas em coluna, autosave, filtro por texto
- `/admin/producao/aulas/diagramas-preview` — galeria local sem custo, com termos editáveis
- Tab Q&A em `/admin/producao/aulas` para editar instruções extras do system prompt do Q&A

### C. Revisão Claude (acentos / ortografia / travessões)
`/admin/producao/aulas/revisao/[slug]`. Chunked por módulo (cabe em 60s Vercel Hobby). Diff side-by-side. Aceitar/rejeitar/aplicar individual ou em massa. Tratamento de timeout/JSON inválido. Botão re-tentar só os módulos com erro.

### D. Sugestão de diagramas Claude
`/admin/producao/aulas/diagramas/[slug]`. Claude lê texto e propõe infografias onde faz sentido. UI com preview SVG inline + accept/reject por sugestão.

### E. Pipeline de render MP4 (FFmpeg via GitHub Actions)
- `tools/render-course-slide/render.mjs` (Puppeteer + FFmpeg, espelha `SlidePreview.tsx`)
- `.github/workflows/render-course-slide.yml`
- API `/api/admin/aulas/render-submit` + `/render-status`
- API `/api/admin/aulas/render-bulk` (paralelo todas as sub-aulas)
- Página `/admin/producao/aulas/render-bulk/[slug]` com tabela + polling + retry-only-failed
- TUS upload com pre-DELETE (resolve 409 "resource already exists")
- xfade 0.5s entre slides, AG com volume modulado por acto (janelas disjuntas)
- Output: `course-assets/curso-<slug>/videos/m<N>-<letter>.mp4`

### F. Sistema visual dos slides Mock B
Fundo `#141428` (roxo Escola), tipografia única Cormorant Garamond regular (italic só na pergunta, DM Serif maior na frase), capitular dourada, glifos `· · ·` entre frases, marca "Escola dos Véus" no canto, fio vertical à esquerda, texto a aparecer **palavra-a-palavra** (typewriter SMIL).

**Camadas ambiente** (todas SMIL nativo, sem JS): manchas aguarela ondulantes, ondas concêntricas a pulsar, pétalas a cair, silhueta contemplativa Matisse-like a respirar.

**Estrutura narrativa entre actos**: pull-quote (frase de impacto do acto anterior em italic display), pausa activa (silhueta grande a respirar 5s + "respira"), eco "DE ANTES + palavra" no canto.

**Diagramas** (5 templates): Âncora, Constelação, Pólos, Passagem, Órbita. **Âncora montada visualmente** com 6 camadas (dingbat ❦, label, hairline, palavra, hairline+círculo, dingbat ✦). Os outros 4 templates ainda têm a versão tipográfica simples — replicar a lógica de composição quando a Vivianne der OK.

**Inferência automática** (regras estritas — sem falsos positivos):
- Frase final → Âncora com palavra-chave
- Lista numerada `1. X. 2. Y.` → Sequência
- "Não é X. É Y." → Pareado
- "X, mas Y." → Pareado
- "X, Y e Z" → Tríade
- Resto: null (manual via editor ou Sugestão Claude)

**Gesto demonstrado** no acto IV: silhueta detectada por palavras-chave (respira, mão no peito, escreve, olha, abre as mãos).

### G. Conteúdo (Ouro Próprio)
- 149 travessões purgados de scripts/manual/caderno
- Acentos PT-PT corrigidos em massa em todo o espaço da aluna
- Regra permanente em `CURSOS/PRODUCAO-STATUS.md`: zero travessões em conteúdo, acentuação PT-PT obrigatória, fundo `#141428`, faixa AG do bucket `audios`

### H. Espaço da aluna
- Q&A movido da sub-aula para a página do módulo (conversa cacheada por módulo)
- `territoryStage` no topo da página do módulo
- Barra de progresso X/N sub-aulas no curso
- Manual PDF + Cadernos preenchidos PDF (`/api/courses/cadernos`)
- Botão "Gerar certificado e concluir curso"
- `/api/courses/lesson` prefere MP4 Mock B em `course-assets/curso-<slug>/videos/m<N>-<letter>.mp4`, fallback legacy

---

## Bugs descobertos no fim da sessão (fixes locais commitados, falta deploy)

A Vivianne entrou no espaço da aluna e reportou 4 problemas. Diagnóstico + fix
ficaram feitos no branch — só falta a Vercel desbloquear amanhã para deployar.

### A. "Vídeo em produção" em todos os módulos ✅ commitado
`/api/courses/lesson` usava `HEAD` para confirmar a presença do MP4 público no
bucket `course-assets`. O Storage da Supabase nem sempre devolve 200 em HEAD
para ficheiros públicos (devolve não-2xx mesmo com ficheiro presente). Fix:
substituir HEAD por `GET` com header `Range: bytes=0-0` que devolve 206 Partial
Content quando o ficheiro existe sem descarregar tudo.

### B. Manual PDF "Autenticação necessária" ✅ commitado
`/api/courses/manual` parseava cookies à mão à procura de
`sb-<ref>-auth-token`. A Supabase SSR usa nomes chunked
`sb-<ref>-auth-token.0`, `.1`, `.2` para JWTs grandes — o parse manual nunca
encontrava o cookie e devolvia 401. Fix: usar `createSupabaseServerClient()`
(que lida com chunked nativamente). Mantido fallback Bearer token para
clientes API.

### C. Cadernos PDF mesmo bug ✅ commitado
Aplicado o mesmo fix em `/api/courses/cadernos` (era cópia do parse manual
antigo).

### D. Áudios não aparecem ✅ commitado
Mismatch de naming. O gerador (`/api/admin/audio-bulk/generate-one`) gravava
em `course-assets/curso-<slug>/<slug-do-titulo>-<ts>.mp3`. A rota da aluna
(`/api/courses/audio`) procurava por prefixo `m<N>-<letter>-`. Fix: o gerador
agora aceita `scriptId` (ex.: `ouro-proprio-m1a`), extrai `m1-a-` por regex e
prefixa o ficheiro. A página bulk passa `scriptId: script.id`. Áudios
**antigos** ficam órfãos — re-gerar quando for prioridade ou re-nomear via
SQL.

### E. YouTube hooks não batem com vídeos reais ⚠️ verificado, pendente decisão
`courses.ts` define 3 `youtubeHooks` fictícios por curso (ex.: para
ouro-proprio: "Porque sentes culpa quando gastas dinheiro em ti mesma?"). Os
scripts **reais** que existem em `nomear-scripts.ts` são outros (8 títulos
para ouro-proprio, ex.: "A culpa que chega antes da compra", "O extracto que
te lê de volta", "A vergonha que inventa desculpas", etc.).

A Vivianne tem que decidir caso a caso quais 3 hooks promover por curso na
landing. Os títulos reais por curso estão em `src/data/nomear-scripts.ts`
filtrando por `curso: "<slug>"`. Não fiz a edição porque mexe em copy
público — proposta para próxima sessão: criar `/admin/cursos/hooks` que mostra
os 3 hooks actuais lado a lado com os scripts reais e permite picker.

---

## O que está PENDENTE (próxima sessão)

### 1. **Generator de scripts via Claude para os outros 19 cursos** ← bloqueia tudo
Apenas Ouro Próprio tem `course-scripts/ouro-proprio.ts` com os 5 campos × 24 sub-aulas. `getBaseScript()` em `src/lib/course-slides.ts:155` está hardcoded a devolver scripts só para `ouro-proprio`.

**Plano que ficou desenhado mas não implementado:**

a) `POST /api/admin/aulas/generate-scripts` — body `{slug, module}`. Para as 3 sub-aulas do módulo, chama Claude (sonnet-4-6, prompt cached 1h) com:
- System: `TONE_GUIDELINES` de `course-guidelines.ts` + 2 exemplos completos de Ouro Próprio (ex.: m1a + m4a) + regras (PT-PT, zero travessões, terça-feira não transcendência)
- User: meta do curso de `courses.ts` (slug, title, subtitle, arcoEmocional, diferencial, território de `territory-themes`) + título e descrição das 3 sub-aulas
- Output: JSON `[{ subLetter, perguntaInicial, situacaoHumana, revelacaoPadrao, gestoConsciencia, fraseFinal }]`
- Guardar em `course-assets/admin/aulas-config/<slug>/m<N>-<letter>.json` (mesmo path que overrides)

b) Modificar `resolveScript()` em `course-slides.ts` para construir o script inteiramente do override quando não há base hardcoded — actualmente devolve `null` se `getBaseScript` devolver null.

c) `/admin/producao/aulas/gerar/[slug]` — UI com 8 botões "Gerar M1", "Gerar M2"... para cada curso, com progresso e preview de cada sub-aula gerada.

**Custo estimado:** ~€0.15 por curso (24 sub-aulas) com prompt caching. Total para 19 cursos = €3.

### 2. M3·B de Ouro Próprio com timeout
O `Install FFmpeg` step morreu com `TypeError: fetch failed`. Vivianne pode:
- Re-run pelo botão na página do GitHub Actions (job #18)
- OU esperar pela merge da PR #265 (timeout detection no admin), depois re-tentar pelo botão "↻ Re-tentar só os com erro"

### 3. Replicar "composição visualmente montada" aos outros 4 templates de diagrama
Âncora ficou refeita com 6 camadas (dingbat, label, hairlines, palavra, ornamento, dingbat de fecho). Constelação, Pólos, Passagem, Órbita ainda têm a versão tipográfica simples. Aplicar mesma lógica de composição em camadas — Vivianne disse para fazer **se** a direcção da Âncora a tocar, validar primeiro.

### 4. Frame sequence capture no render MP4
As animações SMIL são visíveis no preview browser mas o render MP4 actual captura 1 frame estático por slide (estado final, `fill="freeze"`). Para ter animação **dentro** do MP4 é preciso modificar `tools/render-course-slide/render.mjs` para capturar 30-60 frames por slide durante a entrada e usar FFmpeg concat com timing diferente (~1s de animação + duração-1s de hold).

### 5. PRs abertas a mergear quando Vercel desbloquear
- [#263](https://github.com/vivnasc/escola-veus/pull/263) faixa AG no render bulk
- [#265](https://github.com/vivnasc/escola-veus/pull/265) timeout detection

---

## Configuração actual no Supabase (estado real)

**Bucket `course-assets`:**
- `curso-ouro-proprio/videos/m{1..8}-{a,b,c}.mp4` — **23 vídeos** (M3·B falta)
- `admin/aulas-config/ouro-proprio/m<N>-<letter>.json` — overrides editoriais
- `admin/aulas-course-defaults/ouro-proprio.json` — faixa AG default + volumes
- `admin/aulas-qa-prompt.json` — extras do system prompt do Q&A
- `render-jobs/<jobId>.json` + `<jobId>-result.json` — manifests + estados de render

**Bucket `audios`:**
- `albums/ancient-ground/<faixa>.mp3` — biblioteca AG (público)

**Anthropic credits:** Vivianne sabe que se acabar a meio de bulk review/diagramas Claude, há botão "Tentar só os módulos com erro" para retomar sem repagar.

**Vercel:** Hobby tier — 100 deploys/dia. Atingido em 2026-04-26. Resetar em ~24h.

---

## Como continuar na próxima sessão

```
cd /home/user/escola-veus
git fetch && git checkout main && git pull
cat CURSOS/CONTINUIDADE-SESSAO-8-PT3.md
```

Pergunta da Vivianne provável: "**queres começar pelo generator de scripts dos outros cursos?**"

Resposta esperada: sim, é o que mais valor tem (desbloqueia 19 cursos × 24 sub-aulas × infraestrutura toda já feita = 456 vídeos potenciais). Sem o generator, a infraestrutura pesada do Mock B serve só Ouro Próprio.

Plano detalhado para essa próxima sessão está na secção **"O que está PENDENTE → 1. Generator de scripts"** acima.
