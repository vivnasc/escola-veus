# Sessao 8 — 2026-04-24

**Branch:** `claude/create-course-slides-8ZsTQ` (5 commits, **PR ainda nao aberta**)

> Sessao via web (nao Claude Code CLI). Tudo o que importa esta nos commits e
> neste ficheiro. Faz `git pull` antes da proxima sessao CLI.

---

## Decisoes tomadas

### Conceito do video-aula (apos varias iteracoes para clarificar ambito)

- **NAO usar:** imagens, motion, clips Runway, fundos animados, ilustracao,
  Loranne (album com letras — confusao corrigida), nem clips Ancient Ground
  como fundo.
- **USAR:** slides editoriais Mock B + musica Ancient Ground (apenas o som,
  album instrumental).

### Mock B — design dos slides

- Fundo `#0d0d0d` puro, sem gradient/grain/particulas.
- Cor do curso (de `territory-themes.ts`) **so** no label de acto e linha de acento.
- Tipografia distinta por acto:
  - Pergunta: Cormorant Garamond italic, grande, centrado
  - Situacao: Cormorant regular, alinhado a esquerda
  - Revelacao: DM Serif Display, centrado
  - Gesto: Nunito sans-serif (numerado quando ha passos)
  - Frase final: DM Serif Display gigante + linha de acento gradient
- Label permanente canto superior esquerdo: `I · PERGUNTA`, `II · SITUACAO`...
- Rodape discreto: `OURO PROPRIO · M1 · A · O MEDO DE OLHAR` (10px, 25% opacidade)
- Marker intersticial entre actos: 2s com numero romano gigante centrado.
- Transicoes: so fade simples. Respiracao 1.5-2s entre actos.
- Ritmo: 1s/5chars (mais lento que pace de podcast — leitura contemplativa).

### Estrutura por sub-aula

5 actos a partir dos 5 campos ja escritos em `course-scripts/<slug>.ts`:

| # | Acto | Fonte do script | Notas |
|---|---|---|---|
| 1 | Titulo | `title` + `Modulo X · Aula Y` | 8s |
| 2 | I Pergunta | `perguntaInicial` | 1 bloco normalmente |
| 3 | II Situacao | `situacaoHumana` | partido em blocos ~220 chars |
| 4 | III Revelacao | `revelacaoPadrao` | partido em blocos ~220 chars |
| 5 | IV Gesto | `gestoConsciencia` | 1-2 blocos |
| 6 | V Frase | `fraseFinal` | 1 slide, 12s fixos |
| 7 | Fecho | "Escola dos Veus · seteveus.space" | 5s |

### O que o aluno encontra na sub-aula (4 camadas)

1. **Ver** — video-aula (slides + musica AG, sem voz).
2. **Ouvir** — audio "podcast" ElevenLabs (entrega paralela, em
   `course-assets/curso-<slug>/m<N>-<letter>-*.mp3`).
3. **Escrever** — pausa para reflexao (ja existia, autosaved).
4. **Perguntar** — Q&A com Claude API por modulo (cacheado 1h).

### Q&A com Claude

- **Por modulo**, nao por sub-aula nem por curso. Conversa unica para as 3
  sub-aulas do M1.
- Modelo: `claude-sonnet-4-6` (custo ~€0.002/pergunta com cache).
- Contexto cacheado (ephemeral 1h): 3 scripts + capitulo do manual + caderno
  + guidelines de tom (`course-guidelines.ts`).
- System prompt em `src/lib/course-context.ts:renderSystemPrompt`. Iterar
  com base em respostas reais.
- Persistencia: `escola_questions` (RLS por user).

---

## Commits desta sessao (em `claude/create-course-slides-8ZsTQ`)

1. **Q&A backend** — `escola_questions` SQL + `course-context.ts` + endpoint
   `POST/GET /api/courses/ask` com prompt caching.
2. **Q&A UI** — componente `AskClaude` na pagina da sub-aula.
3. **Audio podcast** — endpoint `/api/courses/audio` + `AudioPlayer` abaixo
   do video.
4. **Manual chapter card** — `course-manuals/index.ts` + componente
   `ManualChapterCard` na pagina do modulo.
5. **Slides Mock B** — `course-slides.ts` (script -> 5 actos) +
   `SlidePreview` componente + pagina admin
   `/admin/producao/aulas/preview/[slug]/[modulo]/[sub]` + letras das
   sub-aulas em `/admin/producao/aulas` viram links para preview.

---

## URLs de teste (apos merge para `main`)

Dominio: `https://escola.seteveus.space`

- Slides preview: `/admin/producao/aulas/preview/ouro-proprio/1/a`
- Modulo (com manual card): `/cursos/ouro-proprio/1`
- Sub-aula (Q&A + audio): `/cursos/ouro-proprio/1/a`

---

## Estado da infra

- `supabase-escola-questions.sql`: **APLICADA** (Vivianne correu na sessao).
- `ANTHROPIC_API_KEY`: **OK na Vercel** (confirmado).
- `course-assets/curso-ouro-proprio/`: precisa verificar se ja ha audios com
  prefixo `m1-a-*.mp3`. Se nao ha, AudioPlayer mostra "em producao" (ok).

---

## Pendente (proxima sessao)

1. **Abrir PR e fazer merge** para `main` — Vivianne ainda nao deu OK.
2. **Testar Q&A em producao** — verificar tom da resposta. Provavel ajuste
   no system prompt (`src/lib/course-context.ts`) com base no que sair.
3. **Render HTML->MP4 dos slides** — Mock B preview ja existe; falta o
   render real. Plano:
   - Puppeteer captura cada slide como sequencia de frames.
   - FFmpeg concatena + adiciona faixa Ancient Ground com fade-in/out e
     volume modulado por acto (-18dB pergunta/situacao -> -15dB gesto/frase).
   - GitHub Actions (mesmo padrao de `render-ancient-ground.yml`).
   - Output: `course-assets/curso-<slug>/videos/m<N>-<letter>.mp4`.
4. **Mapeamento canonico Ancient Ground -> curso.** Decidir 1 faixa por
   curso (nao por modulo) para identidade sonora consistente.
5. **Estender aos outros 6 cursos com scripts** — actualmente so Ouro
   Proprio tem manual + caderno escritos. Os outros tem so scripts:
   - Q&A funciona parcialmente (so com scripts, sem manual/caderno).
   - Slides preview funciona (so precisa scripts).
   - Manual card nao aparece (sem dados).
6. **Q&A: integrar via UI no modulo, nao na sub-aula?** Actualmente o
   componente esta na sub-aula mas a conversa e por modulo. Considerar
   mover para a pagina do modulo.

---

## Falhas e correcoes desta sessao

Para nao repetir:

- Confundi **Loranne** (artista com letras) com **Ancient Ground**
  (album instrumental). Loranne nao entra em material didactico.
- Tinha proposto **clips de natureza Ancient Ground** como fundo dos
  slides — errado, eram dois pipelines separados (track 3 = videos
  ambient YouTube, nao aulas).
- Tinha proposto **imagens dos territorios** como fundo — fora do que a
  Vivianne queria ("simples, n parecer YouTube").
- Conclusao: **slide editorial puro + som Ancient Ground**. Nada mais.

---

## Como a proxima sessao deve comecar

```
cd /home/user/escola-veus
git fetch && git checkout claude/create-course-slides-8ZsTQ && git pull
cat CURSOS/CONTINUIDADE-SESSAO-8.md
```

Depois pergunta a Vivianne se quer:
- (a) Fechar a PR e mergear (e testar Q&A em producao).
- (b) Iterar mais no preview (tipografia, paleta, ritmo) antes de mergear.
- (c) Avancar para o render MP4.
