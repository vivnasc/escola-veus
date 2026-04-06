# Roadmap de Producao de Videos — Escola dos Veus

**Criado:** 2026-04-06
**Para:** Vivianne (que nunca produziu videos e quer algo como School of Life)

---

## O que ja existe vs. o que falta

```
                        OURO PROPRIO (1o curso)
  ┌──────────────────────────────────────────────────────┐
  │  CONTEUDO ESCRITO                         TUDO FEITO │
  │  ├── 24 scripts de aulas (8 modulos x 3)     DRAFT  │
  │  ├── 1 manual (8 capitulos)                   DRAFT  │
  │  ├── 8 cadernos de exercicios                 DRAFT  │
  │  └── 3 scripts YouTube (hooks)                DRAFT  │
  ├──────────────────────────────────────────────────────┤
  │  INFRAESTRUTURA TECNICA                   TUDO FEITO │
  │  ├── API de audio (ElevenLabs)               PRONTO  │
  │  ├── API de imagem (ComfyUI/ThinkDiffusion)  PRONTO  │
  │  ├── API de video (Wan 2.1)                  PRONTO  │
  │  ├── Sistema visual (cores, particulas)      PRONTO  │
  │  ├── Workflows ComfyUI (3 tipos)             PRONTO  │
  │  └── Admin dashboard                         PRONTO  │
  ├──────────────────────────────────────────────────────┤
  │  O QUE FALTA PRODUZIR                                │
  │  ├── Aprovacao dos scripts pela Vivianne    BLOQUEIO  │
  │  ├── Treinar modelo LoRA (estilo visual)   ~3 horas  │
  │  ├── Gerar audios narrados                   ~1 dia  │
  │  ├── Gerar imagens por cena                  ~1 dia  │
  │  ├── Gerar clips video (5-10s cada)          ~1 dia  │
  │  ├── Montar videos finais                    ~2 dias │
  │  └── Publicar no YouTube                     ~1 dia  │
  └──────────────────────────────────────────────────────┘
```

---

## O estilo que queremos: "School of Life, mas nosso"

Os videos da School of Life funcionam com:
- Narrador calmo sobre ilustracoes simples
- Texto sobreposto nos momentos-chave
- Transicoes suaves (dissolves lentos)
- Musica ambiente subtil
- 6-10 minutos de duracao

**A nossa versao (Escola dos Veus):**
- Voz da Vivianne (clone ElevenLabs) — calma, proxima, contemplativa
- Silhuetas femininas em terracota/dourado (sem rosto, universais)
- Paisagens de territorio (cada curso tem o seu "mundo" visual)
- Fundo navy-blue profundo (#1A1A2E) — "o momento antes da madrugada"
- Texto creme (#F5F0E6) em Playfair Display/Cormorant Garamond
- Zero cortes bruscos — tudo dissolve, tudo respira
- Particulas flutuantes (po dourado, brasas, nevoa) conforme o territorio

**A diferenca:** School of Life e intelectual/explicativa. Nos somos corporais/poeticas.
A aluna nao deve pensar "que interessante" — deve sentir "isto sou eu".

---

## Pipeline de producao: passo a passo (para alguem que nunca fez isto)

### FASE 0: PREPARACAO (fazer uma vez)

```
Tempo: ~1 dia
Custo: ~5€
```

| Passo | O que e | Como fazer | Estado |
|-------|---------|------------|--------|
| 0.1 | Configurar ElevenLabs | Conta + clone de voz da Vivianne | Feito (chave necessaria) |
| 0.2 | Configurar ThinkDiffusion | Conta Hobby ($0.99/h) ou Pro ($19.99/mes) | Por fazer |
| 0.3 | Treinar modelo LoRA | Usar as 59 imagens de referencia que ja existem em CURSOS/imagens/ | Por fazer |
| 0.4 | Testar pipeline | Gerar 1 imagem + 1 audio + 1 clip de teste | Por fazer |

**O modelo LoRA e o "estilo visual" do Mundo dos Veus.** Treina-se uma vez e usa-se para
todos os videos. As 59 imagens de referencia e os prompts ja estao prontos.

---

### FASE 1: APROVAR SCRIPTS (o teu trabalho, Vivianne)

```
Tempo: 1-3 dias (ao teu ritmo)
Custo: 0€
```

**Comeca por aqui. Nada avanca sem isto.**

| O que rever | Ficheiro | Quantidade |
|-------------|----------|------------|
| Scripts YouTube (hooks) | `src/data/course-youtube/ouro-proprio.ts` | 3 scripts |
| Scripts das 24 aulas | `src/data/course-scripts/ouro-proprio.ts` | 24 scripts |
| Manual do curso | `src/data/course-manuals/ouro-proprio.ts` | 8 capitulos |
| Cadernos exercicios | `src/data/course-workbooks/ouro-proprio.ts` | 8 cadernos |

**Como rever:**
1. Le cada script
2. Pergunta: "Isto soa a mim? Eu diria isto assim?"
3. Marca como APROVADO ou deixa notas do que mudar
4. Os scripts YouTube sao a prioridade #1 (sao os videos que vao ao publico primeiro)

**Sugestao: comeca pelo YouTube Hook 1** — "Porque sentes culpa quando gastas dinheiro em ti mesma?"
E o primeiro video que vai existir no mundo. Se este funcionar, os outros seguem.

---

### FASE 2: GERAR AUDIO (automatico)

```
Tempo: ~30 min para 3 videos YouTube / ~2h para 24 aulas
Custo: ~5-10€ (ElevenLabs)
```

**O que acontece:**
1. O script aprovado entra na API de audio
2. A API envia o texto para o ElevenLabs com a voz clonada
3. O ElevenLabs devolve um MP3 narrado com a tua voz
4. O MP3 e guardado no Supabase Storage

**Configuracoes ja afinadas:**
- Estabilidade: 0.75 (voz consistente, calma)
- Semelhanca: 0.85 (muito proxima da tua voz real)
- Velocidade: 0.9 (ligeiramente mais lenta que o normal — contemplativa)
- Pausas naturais inseridas automaticamente (parágrafos = silencio, pontos = pausa)

**O teu papel:** Ouvir os audios gerados. Aprovar ou pedir re-geracao.

---

### FASE 3: GERAR IMAGENS (semi-automatico)

```
Tempo: ~2-4 horas para um video YouTube (8 cenas)
Custo: ~2-5€ (ThinkDiffusion)
```

**Para cada cena do video, geramos 1-3 imagens:**

| Tipo de cena | Tipo de imagem | Exemplo |
|--------------|----------------|---------|
| Abertura | Paisagem do territorio | Ceu escuro sobre casa de espelhos dourados |
| Pergunta | Silhueta + paisagem | Mulher de costas, pe no espelho de agua |
| Situacao | Composicao narrativa | Sofa, telemovel, notificacao a brilhar |
| Revelacao | Elemento simbolico | Espelhos a descobrirem-se lentamente |
| Gesto | Silhueta activa | Mao estendida, particulas douradas |
| Frase final | Ecra escuro + texto | Frase em creme sobre navy-blue |
| CTA | Territorio com URL | Vista do Mundo com link seteveus.space |
| Fecho | Dissolve para ceu | Paisagem a dissolver-se no azul profundo |

**O que ja existe:**
- 20 prompts de territorio (um por curso) com 4 niveis de progressao
- 8 poses de silhueta pre-definidas (de pe, sentada, maos no peito, etc.)
- Workflows ComfyUI prontos para gerar paisagens, silhuetas e composicoes

**O teu papel:** Ver as imagens geradas. Escolher as melhores. Pedir re-geracao se necessario.

---

### FASE 4: GERAR CLIPS VIDEO (automatico)

```
Tempo: ~10-20 min por cena (8 cenas = ~2 horas)
Custo: ~3-5€ (ThinkDiffusion)
```

**Cada imagem aprovada torna-se um clip video de 5-10 segundos:**

| Tipo de cena | Tipo de movimento | Duracao |
|--------------|-------------------|---------|
| Abertura | Camara desce lentamente | 10-12s |
| Pergunta | Silhueta a respirar | 15-25s |
| Situacao | Camara lenta, ambiente vivo | 2-3 min (loop) |
| Revelacao | Espelhos a descobrir, veus a levantar | 2-3 min (loop) |
| Gesto | Mao a estender, particulas a juntar | 1-2 min |
| Frase final | Zoom lento para escuro | 15-25s |
| CTA | Vento suave, particulas, luz quente | 20s |
| Fecho | Dissolve para ceu navy | 8-10s |

**Nota:** As cenas mais longas (situacao, revelacao) usam loops subtis —
a imagem "respira" mas nao se repete de forma obvia.

**Tecnologia:** Wan 2.1 (image-to-video) via ThinkDiffusion. Ja configurado.

---

### FASE 5: MONTAGEM FINAL

```
Tempo: ~2-4 horas por video
Custo: 0€ (ferramentas gratuitas)
Opcoes: CapCut (facil) / DaVinci Resolve (pro, gratis) / ffmpeg (automatico)
```

**O que juntamos:**

```
  TIMELINE DO VIDEO (6 min)
  ┌─────────────────────────────────────────────────┐
  │ VISUAL:  clip1  │ clip2 │ clip3 │ ... │ clip8   │
  │ AUDIO:   ───────────── narracao.mp3 ──────────  │
  │ TEXTO:   ···pergunta···  ·······  ···frase···   │
  │ MUSICA:  ═══════════ ambiente subtil ══════════  │
  │ PAUSA:      ▪          ▪              ▪         │
  └─────────────────────────────────────────────────┘
```

**Camadas:**
1. **Video de fundo** — clips gerados pelo Wan 2.1, com dissolves entre eles
2. **Audio narrado** — MP3 do ElevenLabs (voz da Vivianne)
3. **Texto sobreposto** — frases-chave em momentos especificos (Playfair Display, creme)
4. **Musica ambiente** — textura sonora subtil (nao melodia), volume baixo
5. **Silencios** — pausas intencionais (2-3 segundos entre seccoes)

**Opcoes de montagem (do mais facil ao mais tecnico):**

| Ferramenta | Dificuldade | Para quem |
|------------|-------------|-----------|
| **CapCut** (desktop, gratis) | Facil | Se nunca editaste video. Arrastar e largar. |
| **DaVinci Resolve** (gratis) | Media | Se queres mais controlo. Profissional mas gratis. |
| **ffmpeg** (linha de comando) | Tecnica | Para automatizar. Nao recomendado para comecar. |

**Recomendacao para comecar: CapCut Desktop.**
- Gratis, intuitivo, suporta texto animado
- Podes importar os clips + audio + texto
- Exportar em 1080p para YouTube

---

### FASE 6: PUBLICAR

```
Tempo: ~30 min por video
Custo: 0€
```

| Passo | Descricao |
|-------|-----------|
| 6.1 | Upload para YouTube (canal Escola dos Veus / Sete Veus) |
| 6.2 | Titulo, descricao, tags (ja definidos no youtube-calendar.ts) |
| 6.3 | Thumbnail (gerada a partir da imagem principal + texto) |
| 6.4 | Agendar publicacao (Terca/Quinta/Sabado 18:00 Maputo) |

**Calendario previsto (YouTube hooks):**
- Semana 1-7: 3 videos/semana = 21 videos
- Primeiro: "Porque sentes culpa quando gastas dinheiro em ti mesma?"
- Os hooks sao entrada gratuita — levam a aluna para o curso pago

---

## Resumo visual: onde estamos no pipeline

```
  SCRIPT ──→ AUDIO ──→ IMAGEM ──→ VIDEO ──→ MONTAGEM ──→ PUBLICAR
    ✅          ⬜        ⬜         ⬜         ⬜           ⬜
  (escrito)  (pronto   (pronto    (pronto    (escolher    (canal +
              a gerar)  a gerar)   a gerar)   ferramenta)  calendario)

  ▲
  │
  TU ESTAS AQUI: a rever os scripts
```

---

## Plano para o PRIMEIRO VIDEO (YouTube Hook 1)

**Titulo:** "Porque sentes culpa quando gastas dinheiro em ti mesma?"
**Duracao:** ~6 minutos
**Objectivo:** Primeiro video no mundo. Entrada para o curso Ouro Proprio.

### Checklist de producao:

```
□  1. Vivianne aprova o script do YouTube Hook 1
        → ficheiro: src/data/course-youtube/ouro-proprio.ts (hook 0)
        → versao detalhada: src/data/youtube-scripts.ts (8 cenas)

□  2. Configurar ElevenLabs
        → criar conta (se nao existe)
        → verificar clone de voz
        → definir ELEVENLABS_API_KEY no .env

□  3. Gerar audio narrado
        → via admin dashboard ou API directamente
        → ouvir, aprovar ou re-gerar

□  4. Configurar ThinkDiffusion
        → criar conta ($0.99/hora ou $19.99/mes)
        → lançar instancia ComfyUI

□  5. Treinar LoRA (uma vez)
        → executar preparar-imagens.py (prepara dataset)
        → upload para ThinkDiffusion
        → treinar com kohya-config.toml (~3 horas)
        → testar com comfyui-test-workflow.json

□  6. Gerar 8 imagens (uma por cena)
        → abertura: paisagem Casa dos Espelhos Dourados
        → pergunta: silhueta + espelho de agua
        → situacao: sofa, telemovel, notificacao
        → revelacao: espelhos a descobrirem-se
        → gesto: mao estendida, moedas flutuando
        → frase_final: ecra escuro, texto creme
        → cta: territorio com URL
        → fecho: dissolve para ceu

□  7. Gerar 8 clips video (5-10s cada)
        → cada imagem → Wan 2.1 → clip animado
        → movimentos subtis, nao dramaticos

□  8. Encontrar musica ambiente
        → textura, nao melodia
        → sugestao: Epidemic Sound ou Artlist (~10€/mes)
        → ou musica CC0 do Pixabay/Freesound

□  9. Montar video no CapCut
        → importar clips + audio + musica
        → adicionar texto nos momentos-chave
        → dissolves entre cenas (nao cortes)
        → exportar 1080p

□ 10. Vivianne ve o video final
        → aprovar ou pedir ajustes

□ 11. Criar thumbnail
        → imagem principal + texto: "A culpa de gastar em ti"
        → subtitulo: "um padrao que herdaste"

□ 12. Publicar no YouTube
        → titulo, descricao, tags (ja escritos)
        → agendar para proximo dia util
```

---

## Custos estimados (por video)

| Item | Custo | Nota |
|------|-------|------|
| ElevenLabs (audio) | ~1-2€ | Depende do plano e duracao |
| ThinkDiffusion (imagens) | ~2-3€ | 8 imagens × ~20s cada |
| ThinkDiffusion (video clips) | ~3-5€ | 8 clips × ~2 min cada |
| LoRA training | ~3-5€ | Uma vez (para todos os videos) |
| Musica ambiente | 0-10€ | Gratis (CC0) ou subscricao |
| CapCut | 0€ | Versao desktop gratis |
| YouTube | 0€ | — |
| **TOTAL primeiro video** | **~10-25€** | |
| **Videos seguintes** | **~5-10€ cada** | LoRA ja treinado |

---

## Depois do primeiro video: escalar

Uma vez que o primeiro video estiver feito, o processo repete-se:

```
VIDEO 1 (mais lento — aprendizagem)     ~1 semana
VIDEO 2-3 (mais rapido — rotina)         ~2-3 dias cada
VIDEO 4+ (pipeline estavel)              ~1-2 dias cada
```

**Para os 3 YouTube hooks do Ouro Proprio:**
- Hook 1: "Porque sentes culpa quando gastas dinheiro em ti mesma?" (6 min)
- Hook 2: "3 frases sobre dinheiro que a tua mae te ensinou sem saber" (7 min)
- Hook 3: "O teste do preco: diz o teu valor em voz alta" (5 min)

**Depois dos hooks YouTube → aulas do curso:**
Os 24 scripts de aula usam o mesmo pipeline mas com mais profundidade visual
(cada modulo tem progressao de luz: modulos 1-2 mais escuros → modulos 7-8 quase madrugada).

---

## Decisoes que precisas de tomar

| Decisao | Opcoes | Recomendacao |
|---------|--------|--------------|
| Ferramenta de montagem | CapCut / DaVinci Resolve / ffmpeg | CapCut para comecar |
| Musica ambiente | CC0 gratis / Epidemic Sound / Artlist | Testa CC0 primeiro |
| ThinkDiffusion plano | Hobby $0.99/h / Pro $19.99/mes | Hobby para testar, Pro se ficares |
| Publicar com pseudonimo? | Nome real / pseudonimo | Ainda por decidir |
| Preco do curso | ? | Ainda por definir |

---

## Onde esta tudo (mapa de ficheiros)

```
CURSOS/
  PRODUCAO-STATUS.md              ← estado actual da producao
  ROADMAP-PRODUCAO-VIDEOS.md      ← ESTE FICHEIRO
  imagens/                         ← 59 imagens de referencia para LoRA
  lora-training/                   ← configs de treino do modelo visual

escola-veus-app/src/
  data/
    course-guidelines.ts           ← tom, estrutura, regras visuais
    courses.ts                     ← 20 cursos completos (estrutura)
    course-scripts/ouro-proprio.ts ← 24 scripts de aulas (DRAFT)
    course-manuals/ouro-proprio.ts ← manual 8 capitulos (DRAFT)
    course-workbooks/ouro-proprio.ts ← 8 cadernos (DRAFT)
    course-youtube/ouro-proprio.ts ← 3 scripts YouTube (DRAFT)
    youtube-scripts.ts             ← scripts YouTube detalhados (cena a cena)
    youtube-calendar.ts            ← calendario de publicacao (21 videos, 7 semanas)
    territory-themes.ts            ← cores por curso

  app/api/admin/courses/
    generate-audio/route.ts        ← API ElevenLabs
    generate-image/route.ts        ← API ComfyUI (imagens)
    generate-video/route.ts        ← API Wan 2.1 (video clips)
    train-lora/route.ts            ← API treino LoRA

  lib/
    comfyui-workflows.ts           ← workflows de geracao (paisagem, silhueta, video)
    video-visuals.ts               ← paletas, particulas, composicoes

  components/
    VideoComposer.tsx              ← orquestrador de geracao de clips
```

---

**Proxima accao concreta:** Abre `src/data/course-youtube/ouro-proprio.ts` e le o Hook 1.
Se soa a ti, aprovamos e comecamos a produzir.
