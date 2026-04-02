# Escola dos Veus — Estado da Producao

**Ultima actualizacao:** 2026-03-25
**Actualizado por:** Claude Code

> Este ficheiro e a referencia unica de continuidade entre sessoes.
> Qualquer sessao nova DEVE ler este ficheiro antes de trabalhar na producao dos cursos.
> Actualizar SEMPRE este ficheiro no final de cada sessao de trabalho.

---

## Resumo do Estado

| Componente | Estado | Detalhe |
|-----------|--------|---------|
| Estrutura dos 20 cursos | COMPLETO | `src/data/courses.ts` — 20 cursos, 160 modulos, 480 sub-aulas |
| Guidelines de producao | COMPLETO | `src/data/course-guidelines.ts` — 706 linhas |
| Territorios visuais | COMPLETO | `src/data/territorios.ts` — 10 territorios mapeados |
| Admin de producao (UI) | COMPLETO | `/admin/cursos/producao/` — audio, imagem, video |
| APIs de producao | COMPLETO | 6 API routes (audio, imagem, video, LoRA, test, assets) |
| Imagens de referencia | PARCIAL | ~60 imagens em `CURSOS/imagens/` |
| **Scripts das aulas** | **EM CURSO** | **24/480 scripts escritos (Ouro Proprio completo — DRAFT)** |
| **Manuais (PDF)** | **EM CURSO** | **1/20 manuais escritos (Ouro Proprio — DRAFT) + pipeline PDF** |
| **Cadernos exercicios** | **EM CURSO** | **8/160 cadernos escritos (Ouro Proprio — DRAFT)** |
| **Scripts YouTube** | **EM CURSO** | **3/~50 scripts escritos (Ouro Proprio — DRAFT)** |
| Audios (ElevenLabs) | NAO INICIADO | Depende dos scripts |
| Visuais (ThinkDiffusion) | NAO INICIADO | Depende do LoRA + scripts |
| LoRA treinado | NAO INICIADO | Infra pronta, modelo nao treinado |
| PDFs gerados | EM CURSO | Pipeline implementado (`@react-pdf/renderer`) + API route |
| Tabelas Supabase cursos | NAO EXISTE | Falta `course_content`, `course_assets` |

---

## Pipeline de Producao — Ordem Obrigatoria

```
FASE 1: CONTEUDO (onde estamos)
  1.1 Scripts das aulas (480 sub-aulas) ← OURO PROPRIO COMPLETO (draft)
  1.2 Manuais (20, um por curso)
  1.3 Cadernos de exercicios (160, 8 por curso)
  1.4 Scripts YouTube (2-3 por curso)

FASE 2: AUDIO
  2.1 Gerar audios via ElevenLabs (480 audios de aulas)
  2.2 Gerar audios YouTube (40-60 audios)
  2.3 QA e aprovacao pela Vivianne

FASE 3: VISUAIS
  3.1 Treinar LoRA com estilo Mundo dos Veus
  3.2 Gerar biblioteca de assets (~100 imagens base)
  3.3 Gerar imagens por aula
  3.4 Gerar clips video (Wan 2.1)

FASE 4: MONTAGEM
  4.1 Juntar audio + visuais + texto animado
  4.2 Gerar PDFs dos manuais e cadernos
  4.3 QA e aprovacao final

FASE 5: PUBLICACAO
  5.1 Upload para Supabase Storage
  5.2 Activar na plataforma
  5.3 Lancamento
```

**REGRA: Nao avancar para a Fase 2 sem ter scripts aprovados.**

---

## Curso Prioritario: Ouro Proprio

O primeiro curso a ser produzido e o **Ouro Proprio** (slug: `ouro-proprio`).
Razao: porta universal — dinheiro e o tema mais activador.

### Progresso do Ouro Proprio

| Modulo | Titulo | Scripts | Manual | Caderno | Audio | Visual |
|--------|--------|---------|--------|---------|-------|--------|
| 1 | O Extracto como Espelho | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 2 | A Heranca Financeira Emocional | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 3 | A Vergonha do Dinheiro | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 4 | Cobrar, Receber, Merecer | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 5 | Gastar em Ti | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 6 | Dinheiro e Relacoes | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 7 | Ganhar Mais Nao Resolve | DRAFT (3/3) | DRAFT | DRAFT | — | — |
| 8 | Dinheiro como Liberdade | DRAFT (3/3) | DRAFT | DRAFT | — | — |

Legenda: — = nao iniciado | DRAFT = rascunho | APROVADO = Vivianne aprovou | PRODUZIDO = asset gerado

### Resumo dos Scripts Escritos (sessao 2026-03-25)

**Modulo 1 — O Extracto como Espelho:**
- m1a: O medo de olhar — abrir o extracto sem desviar o olhar
- m1b: Ler o extracto como um diario — cada linha conta uma historia emocional
- m1c: O corpo e o dinheiro — onde o dinheiro vive no corpo

**Modulo 2 — A Heranca Financeira Emocional:**
- m2a: Os scripts de infancia — as frases sobre dinheiro absorvidas antes dos 10 anos
- m2b: O que viste vs. o que ouviste — contradicoes entre palavras e actos dos pais
- m2c: Reescrever os scripts — escolher conscientemente o que manter e largar

**Modulo 3 — A Vergonha do Dinheiro:**
- m3a: Vergonha de nao ter — quando a falta se torna identidade
- m3b: Vergonha de querer mais — o pacto silencioso de querer pouco
- m3c: Dinheiro e dignidade — separar valor pessoal de valor monetario

**Modulo 4 — Cobrar, Receber, Merecer:**
- m4a: O desconto automatico — baixar o preco antes de alguem pedir
- m4b: A ligacao cobrar-merecer — o ciclo entre merecimento e cobranca
- m4c: Receber sem devolver imediatamente — a dificuldade de aceitar sem compensar

**Modulo 5 — Gastar em Ti:**
- m5a: A hierarquia dos gastos — onde te colocas na lista de prioridades
- m5b: Culpa e prazer — a culpa que impede o prazer de gastar em si
- m5c: O investimento em ti como acto politico — investir em si como posicionamento

**Modulo 6 — Dinheiro e Relacoes:**
- m6a: Quem paga, manda? — poder escondido nas contas partilhadas
- m6b: Dependencia financeira e medo — quando ficar e uma questao de contas
- m6c: A conversa sobre dinheiro que evitas — o tabu do dinheiro nas relacoes

**Modulo 7 — Ganhar Mais Nao Resolve:**
- m7a: O buraco que o dinheiro nao enche — quando mais nao traz paz
- m7b: Sabotagem financeira — o corpo que regressa ao que conhece
- m7c: Suficiente: quando e suficiente? — a esteira de querer sempre mais

**Modulo 8 — Dinheiro como Liberdade:**
- m8a: De sobrevivencia a direccao — sair do modo reaccao
- m8b: O mapa do futuro que queres financiar — saber para onde queres ir
- m8c: Liberdade, nao acumulacao — dinheiro como ferramenta, nao como destino

---

## Proxima Accao (para a proxima sessao)

**OPCAO A — Revisao pela Vivianne:**
Os 24 scripts e o manual do Ouro Proprio estao em DRAFT. A Vivianne deve reve-los e marcar como APROVADO ou deixar notas de revisao.

**OPCAO B — Continuar producao de conteudo do Ouro Proprio:**
1. ~~Escrever o manual do Ouro Proprio~~ FEITO
2. ~~Escrever os 8 cadernos de exercicios~~ FEITO
3. ~~Escrever os 3 scripts YouTube~~ FEITO

**Todo o conteudo do Ouro Proprio esta em DRAFT. Proxima accao:**
- Vivianne rever e aprovar tudo
- Ou comecar o conteudo do Limite Sagrado

**OPCAO C — Comecar o segundo curso:**
Se o Ouro Proprio estiver aprovado, comecar os scripts do Limite Sagrado (`src/data/course-scripts/limite-sagrado.ts`).

---

## Onde Guardar Conteudo

```
src/data/course-scripts/
  ouro-proprio.ts          ← scripts das 24 sub-aulas (DRAFT COMPLETO)
  limite-sagrado.ts        ← (futuro)
  arte-inteireza.ts        ← (futuro)
  ...

src/data/course-manuals/
  ouro-proprio.ts          ← conteudo do manual (8 capitulos) (DRAFT COMPLETO)
  ...

src/data/course-workbooks/
  ouro-proprio.ts          ← conteudo dos 8 cadernos (DRAFT COMPLETO)
  ...

src/data/course-youtube/
  ouro-proprio.ts          ← scripts dos 3 hooks YouTube (DRAFT COMPLETO)
  ...
```

---

## Ficheiros Chave (referencia rapida)

| Ficheiro | Contem |
|----------|--------|
| `src/data/courses.ts` | Estrutura dos 20 cursos (modulos, sub-aulas, titulos) |
| `src/data/course-guidelines.ts` | Guidelines de producao (tom, estrutura, visual) |
| `src/data/course-scripts/ouro-proprio.ts` | **24 scripts DRAFT do Ouro Proprio** |
| `src/data/course-manuals/ouro-proprio.ts` | **Manual DRAFT do Ouro Proprio (8 capitulos)** |
| `src/data/course-workbooks/ouro-proprio.ts` | **8 cadernos de exercicios DRAFT do Ouro Proprio** |
| `src/lib/pdf/manual-template.tsx` | **Template PDF com identidade visual + licenca** |
| `src/app/api/courses/manual/route.ts` | **API para gerar PDF personalizado** |
| `src/data/territorios.ts` | 10 territorios visuais |
| `src/types/course.ts` | Types TypeScript dos cursos |
| `CLAUDE.md` | Arquitectura tecnica completa do projecto |
| `CURSOS/PRODUCAO-STATUS.md` | **ESTE FICHEIRO** — estado da producao |

---

## Decisoes Tomadas

1. **Ordem de lancamento:** Ouro Proprio → Limite Sagrado → A Arte da Inteireza → restantes
2. **Formato dos scripts:** TypeScript em `src/data/course-scripts/` (permite import directo na plataforma)
3. **Pipeline:** Conteudo primeiro, producao depois (nao produzir video sem script aprovado)
4. **Voz:** Clone ElevenLabs da Vivianne (ja configurado)
5. **Visuais:** ThinkDiffusion + LoRA (infra pronta, modelo por treinar)

---

## Decisoes Pendentes

1. **Pseudonimo da instrutora** — deve funcionar em PT e EN, soar a educadora/guia
2. **Ferramenta de montagem de video** — Wan 2.1 vs CapCut vs ffmpeg
3. **Preco dos cursos** — ainda nao definido
4. **Calendario de lancamento exacto** — depende da velocidade de producao

---

## Instrucoes para Sessoes Futuras

1. Ler este ficheiro (`CURSOS/PRODUCAO-STATUS.md`)
2. Ler `src/data/course-guidelines.ts` para tom e estrutura
3. Verificar a "Proxima Accao" acima
4. Trabalhar na accao indicada
5. **Actualizar este ficheiro** no final da sessao com o progresso feito
6. Commit e push das alteracoes

**IMPORTANTE:** Nao saltar fases. Nao comecar a gerar audios ou visuais sem scripts aprovados.
