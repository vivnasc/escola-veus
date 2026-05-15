# Trinta Manhãs · Junho 2026
## Produção visual e sonora — slideshow editorial sem voz

> Ficheiro técnico para a equipa de produção visual e sonora.
> Bíblia em `MES-01-JUNHO-2026-BIBLIA.md`. Texto literário em `MES-01-JUNHO-2026-GUIOES.md`.
> Copy publicável em `MES-01-JUNHO-2026-METRICOOL.csv`.

Cada capítulo entrega:
- **3 imagens Midjourney v6** (1080×1920, --ar 9:16 --style raw --stylize 200) em `assets/trinta-manhas/imagens/cap-NN-{1,2,3}.jpg`
- **1 faixa Ancient Ground do véu** (instrumental Loranne, looped) — reciclada pelos 4 ciclos
- **3 painéis de texto cinético** + **1 cartão final** com frase-âncora

Duração-alvo: **25 segundos** (slot do cartão final inclusive).

---

## Identidade visual partilhada nos 90 prompts

Adiciona automaticamente a TODO o prompt MJ deste documento:

> `side-lit ibérian portuguese morning, fine grain, painterly, no human faces, palette deep night-blue #1A2238 and amber-gold #E8C97A, literary quietude --ar 9:16 --style raw --stylize 200`

Cada cap apresenta abaixo apenas o **fragmento específico** — o sufixo de estilo é apenso pelo renderer (`render-slideshow.py`).

---

## Trilhas Ancient Ground — 1 faixa por véu, reciclada

Catálogo de 100 faixas instrumentais Loranne (álbum *Ancient Ground*) em Supabase.
Cada véu usa **uma** faixa do catálogo, repetida ao longo dos 4 ciclos do mês —
recorrência intencional para criar reconhecimento sonoro semanal.

Atribuição inicial (edita `tools/contos-mensais/content.py:AG_TRACKS_BY_VEU` para trocar):

| Véu | Capítulos | Faixa | URL |
|---|---|---|---|
| **permanencia** | 1, 8, 15, 22, 29 | `faixa-08` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-08.mp3> |
| **memoria** | 2, 9, 16, 23 | `faixa-22` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-22.mp3> |
| **turbilhao** | 3, 10, 17, 24 | `faixa-37` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-37.mp3> |
| **esforco** | 4, 11, 18, 25 | `faixa-49` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-49.mp3> |
| **desolacao** | 5, 12, 19, 26 | `faixa-63` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-63.mp3> |
| **horizonte** | 6, 13, 20, 27 | `faixa-71` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-71.mp3> |
| **dualidade** | 7, 14, 21, 28 | `faixa-84` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-84.mp3> |
| **inteireza** | 30 | `faixa-95` | <https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-95.mp3> |

O renderer (`render-slideshow.py`) usa estes URLs diretamente — FFmpeg lê do Supabase.
Para correr offline, descarrega para `assets/trinta-manhas/musica/veu-{nome}.mp3` e o renderer prefere o local.

---

## Timings do slideshow (idêntico em todos os 30 caps)

```
00:00.0 – 00:00.3   imagem 1 entra em fade (300ms)
00:00.5 – 00:07.0   painel 1 (palavra-a-palavra, ~150ms/palavra; depois holds)
00:07.0 – 00:08.0   cross-fade imagem 1 → imagem 2 (1s)
00:08.0 – 00:14.0   painel 2
00:14.0 – 00:15.0   cross-fade imagem 2 → imagem 3 (1s)
00:15.0 – 00:21.0   painel 3
00:21.0 – 00:25.0   cartão final (imagem 3 escurecida a 60%, frase-âncora dourada)
```

Numeração de capítulo aparece como texto cream 12px no canto topo-direito ao longo do vídeo (`N/30`).

---

## CAP 01 · Segunda 2026-06-01 · Véu da PERMANENCIA

**Trilha:** `veu-permanencia.mp3`  ·  **Imagens:** `cap-01-{1,2,3}.jpg`

### Prompts Midjourney

1. `old white-tiled bathroom, oval wall mirror with a film of fine dust, predawn cobalt window light low and lateral`
2. `single drop on a porcelain basin, vintage brass tap, faint amber reflection in early light`
3. `dust motes drifting in a single beam of sun across a bathroom corner, still air`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Acordou às quatro e treze. |
| `00:08.0 – 00:14.0` | Não foi o telemóvel.<br>Não foi um som. |
| `00:15.0 – 00:21.0` | Foi como se alguém tivesse aberto a porta — e fechado outra vez. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A mesma cara. Outra luz.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*
- **Linha 3** (Inter 28px cream #F5F0E6): *seteveus.space*

---

## CAP 02 · Terça 2026-06-02 · Véu da MEMORIA

**Trilha:** `veu-memoria.mp3`  ·  **Imagens:** `cap-02-{1,2,3}.jpg`

### Prompts Midjourney

1. `old wooden drawer half-open, a yellowed sealed envelope inside, lacework cloth nearby`
2. `a woman's hand approaching a folded letter without lifting it, soft hesitation`
3. `the drawer closed again, dark wood with faint fingerprints, dust motes`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Procurava um carregador. |
| `00:08.0 – 00:14.0` | Encontrou uma carta da mãe.<br>Letra antiga. Dezassete anos. |
| `00:15.0 – 00:21.0` | Pesou-a na mão. Não pesava nada.<br>Voltou a fechar a gaveta. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não era a primeira vez. Era a primeira vez que reparava.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 03 · Quarta 2026-06-03 · Véu da TURBILHAO

**Trilha:** `veu-turbilhao.mp3`  ·  **Imagens:** `cap-03-{1,2,3}.jpg`

### Prompts Midjourney

1. `vintage stovetop kettle whistling, steam plume catching a low sun beam`
2. `an empty wooden kitchen chair foreground, blurred kettle behind, curtain light`
3. `the kettle silent on the burner, last steam dissipating, soft heat haze`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | A chaleira começou a apitar. |
| `00:08.0 – 00:14.0` | Ela ficou na cadeira.<br>Disse a si mesma: agora levanto. |
| `00:15.0 – 00:21.0` | Não se levantou.<br>A chaleira apitou até parar sozinha. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A chaleira apitou até parar sozinha.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 04 · Quinta 2026-06-04 · Véu da ESFORCO

**Trilha:** `veu-esforco.mp3`  ·  **Imagens:** `cap-04-{1,2,3}.jpg`

### Prompts Midjourney

1. `an empty wooden kitchen chair backed to a window, oblique morning light`
2. `a woman seen from behind sitting in the chair, hands in lap, no face`
3. `a forgotten cup of tea on the table, cup near the edge, light dropping`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | A cadeira do pai estava sempre vazia. |
| `00:08.0 – 00:14.0` | Hoje, sem perceber porquê,<br>sentou-se nela.<br><br>Pensou: descanso quando isto acalmar.<br>E ficou. |
| `00:15.0 – 00:21.0` | O chá ficou frio.<br>Ela não. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *O chá ficou frio. Ela não.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 05 · Sexta 2026-06-05 · Véu da DESOLACAO

**Trilha:** `veu-desolacao.mp3`  ·  **Imagens:** `cap-05-{1,2,3}.jpg`

### Prompts Midjourney

1. `evening kitchen table, a half-full glass of wine, empty chair opposite, warm low lamp`
2. `a phone face-down on the table, a single notification glow leaking out from beneath`
3. `open window letting in damp earthen rain smell, curtain barely moving`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | A amiga cancelou.<br>O outro nunca chegou a confirmar. |
| `00:08.0 – 00:14.0` | Pensou que ia sentir pena.<br>Não sentiu.<br><br>O vazio cheirava a terra molhada.<br>A vasos por regar. A chuva nova. |
| `00:15.0 – 00:21.0` | Algo ali ia nascer. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não era inimigo. Era terra preparada.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 06 · Sábado 2026-06-06 · Véu da HORIZONTE

**Trilha:** `veu-horizonte.mp3`  ·  **Imagens:** `cap-06-{1,2,3}.jpg`

### Prompts Midjourney

1. `tiled iberian balcony foreground, distant hill with two shades of light, dawn-pink sky`
2. `ceramic mug on a balcony rail with steam rising, hill in soft focus behind`
3. `the hill closer now, sun ridge bright and shadowed face darker, layered relief`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | A mesma colina ao longe.<br>Já a tinha visto quatro mil vezes. |
| `00:08.0 – 00:14.0` | Hoje, sem decidir, olhou.<br><br>Tinha duas cores.<br>Uma do sol. Outra da sombra. |
| `00:15.0 – 00:21.0` | A vida não estava depois.<br>Estava ali. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A vida não estava depois. Estava ali.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 07 · Domingo 2026-06-07 · Véu da DUALIDADE

**Trilha:** `veu-dualidade.mp3`  ·  **Imagens:** `cap-07-{1,2,3}.jpg`

### Prompts Midjourney

1. `hands kneading bread dough on flour-dusted light wood, Sunday window light`
2. `risen bread dough in a ceramic bowl under a cloth, kitchen calm and warm`
3. `rough hands meeting pliant dough, warm earth tones, presence as a verb`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Domingo.<br>Fez pão pela primeira vez em anos. |
| `00:08.0 – 00:14.0` | As mãos eram quentes.<br>A massa fria. |
| `00:15.0 – 00:21.0` | Por minutos inteiros,<br>não estava separada de nada. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *As mãos e a massa. A mesma coisa.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 08 · Segunda 2026-06-08 · Véu da PERMANENCIA

**Trilha:** `veu-permanencia.mp3`  ·  **Imagens:** `cap-08-{1,2,3}.jpg`

### Prompts Midjourney

1. `digital alarm clock reading 04:13, dim red glow, bedroom in cobalt night`
2. `a hand resting on a pillow not moving, ceiling shadows, calm awakeness`
3. `soft light slipping under a closed door, the still room breathing slowly`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Segunda.<br>Quatro e treze. Outra vez. |
| `00:08.0 – 00:14.0` | Desta vez não se assustou. |
| `00:15.0 – 00:21.0` | A casa estava igual.<br>Mas alguma coisa nela<br>não estava. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A casa estava igual. Alguma coisa nela não estava.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 09 · Terça 2026-06-09 · Véu da MEMORIA

**Trilha:** `veu-memoria.mp3`  ·  **Imagens:** `cap-09-{1,2,3}.jpg`

### Prompts Midjourney

1. `an opened letter unfolded on a wooden table, mother's handwriting visible obliquely`
2. `a hand smoothing a crease across the page, soft morning light`
3. `the letter resting alone, a cooling coffee cup nearby, time settling`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Voltou à gaveta.<br>Tirou a carta. |
| `00:08.0 – 00:14.0` | Demorou três minutos a abrir o envelope.<br><br>A última linha dizia:<br>"espero que tenhas aprendido a parar." |
| `00:15.0 – 00:21.0` | Dezassete anos depois,<br>ainda estava a aprender. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Espero que tenhas aprendido a parar.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 10 · Quarta 2026-06-10 · Véu da TURBILHAO

**Trilha:** `veu-turbilhao.mp3`  ·  **Imagens:** `cap-10-{1,2,3}.jpg`

### Prompts Midjourney

1. `kettle steaming in soft focus, a hand on the chest in foreground, no face`
2. `kitchen counter with kettle and a slow breathing torso, side light`
3. `the kettle silent, steam tapering off, calm air rebuilding`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | A chaleira apitou.<br>Hoje respirou com ela. |
| `00:08.0 – 00:14.0` | Inspirou na subida.<br>Expirou na descida. |
| `00:15.0 – 00:21.0` | A cabeça não acalma<br>quando se manda calar.<br>Acalma quando se respira ao lado dela. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A cabeça acalma quando se respira ao lado dela.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 11 · Quinta 2026-06-11 · Véu da ESFORCO

**Trilha:** `veu-esforco.mp3`  ·  **Imagens:** `cap-11-{1,2,3}.jpg`

### Prompts Midjourney

1. `interior of a portuguese morning bus, vertical handrail in sharp focus, passengers blurred`
2. `an empty bus seat between two standing figures, low cinematic light`
3. `bus window with city dawn passing by, soft motion blur`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Autocarro das 8:14. |
| `00:08.0 – 00:14.0` | Uma mulher mais velha<br>levanta-se para deixar<br>um homem cansado sentar.<br><br>A gente ainda sabe<br>descansar uns aos outros. |
| `00:15.0 – 00:21.0` | É a única coisa<br>que aguenta as cidades. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Ainda sabemos descansar uns aos outros.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 12 · Sexta 2026-06-12 · Véu da DESOLACAO

**Trilha:** `veu-desolacao.mp3`  ·  **Imagens:** `cap-12-{1,2,3}.jpg`

### Prompts Midjourney

1. `a wooden market stall almost empty at dusk, three pears huddled at one end`
2. `a vendor's hand offering the pears wrapped in newspaper, warm market light`
3. `a single bitten pear on a plain kitchen plate, jagged skin, soft amber`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Mercado ao fim do dia.<br>Três peras numa banca quase arrumada. |
| `00:08.0 – 00:14.0` | "Leva. São as últimas. Dou-tas."<br><br>Em casa, mordeu uma.<br>A casca rasgada.<br>A polpa ainda doce. |
| `00:15.0 – 00:21.0` | As coisas amassadas<br>continuam doces<br>se ninguém as deitar fora cedo demais. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *As coisas amassadas continuam doces.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 13 · Sábado 2026-06-13 · Véu da HORIZONTE

**Trilha:** `veu-horizonte.mp3`  ·  **Imagens:** `cap-13-{1,2,3}.jpg`

### Prompts Midjourney

1. `wide landscape with an elderly figure sitting on a rock far away, dawn light`
2. `the same scene closer, no facial detail, posture relaxed, alone with the air`
3. `the rock empty, a path of footprints leading away, sky widening`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Caminhada longa.<br>Um homem velho sentado numa pedra. |
| `00:08.0 – 00:14.0` | — Está à espera de quê?<br>— Não estou à espera. Estou só. |
| `00:15.0 – 00:21.0` | Levou a frase a casa. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não estou à espera. Estou só.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 14 · Domingo 2026-06-14 · Véu da DUALIDADE

**Trilha:** `veu-dualidade.mp3`  ·  **Imagens:** `cap-14-{1,2,3}.jpg`

### Prompts Midjourney

1. `smartphone face-down on a wooden table, sunlight angled across`
2. `the phone screen lit with an incoming call labelled MÃE, soft glow on the hands nearby`
3. `the phone again face-down after the call, two cups on the table, silence settling`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Domingo. Ligou à mãe.<br><br>Falaram do tempo.<br>Da sopa. |
| `00:08.0 – 00:14.0` | — Estou bem, mãe.<br>— Eu sei, filha.<br><br>Dez segundos de silêncio.<br>Sem sentir o silêncio. |
| `00:15.0 – 00:21.0` | Nada para resolver.<br>Só presença. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Nada para resolver. Só presença.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 15 · Segunda 2026-06-15 · Véu da PERMANENCIA

**Trilha:** `veu-permanencia.mp3`  ·  **Imagens:** `cap-15-{1,2,3}.jpg`

### Prompts Midjourney

1. `an open window before dawn, faint city skyline in pale blue, curtain still`
2. `a small balcony rail with the city quietly awakening below, soft amber edges`
3. `the sun touching distant rooftops with golden filaments, breath of new air`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | 4:13.<br>Hoje sem peso. |
| `00:08.0 – 00:14.0` | À janela.<br>A cidade ainda dormia.<br><br>Não estava sozinha.<br>Estava acordada com a cidade. |
| `00:15.0 – 00:21.0` | Quando o céu aclarou,<br>percebeu que estava a sorrir.<br>Sem motivo. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Acordada com a cidade. Não sozinha.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*
- **Linha 3** (Inter 28px cream #F5F0E6): *seteveus.space*

---

## CAP 16 · Terça 2026-06-16 · Véu da MEMORIA

**Trilha:** `veu-memoria.mp3`  ·  **Imagens:** `cap-16-{1,2,3}.jpg`

### Prompts Midjourney

1. `phone screen showing a message preview from an old friend, gentle glow`
2. `the phone laid on a notebook, a hand resting near but not grabbing`
3. `phone in shadow on a side table, a window's light moving across slowly`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Mensagem de uma amiga antiga.<br>Seis anos depois. |
| `00:08.0 – 00:14.0` | "Lembras-te?"<br><br>Lembrava. |
| `00:15.0 – 00:21.0` | Não respondeu logo.<br>O coração não tinha fechado.<br>Só estava a aprender<br>outra forma de responder. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *O coração não fechou. Só está a aprender.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 17 · Quarta 2026-06-17 · Véu da TURBILHAO

**Trilha:** `veu-turbilhao.mp3`  ·  **Imagens:** `cap-17-{1,2,3}.jpg`

### Prompts Midjourney

1. `laptop screen with a to-do list barely touched, office dusk light`
2. `a hand pausing over the trackpad, no decision in motion`
3. `the laptop closed on the desk, the room ready to rest`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Seis da tarde.<br>A lista de tarefas: igual.<br><br>"Hoje não fiz nada." |
| `00:08.0 – 00:14.0` | Mas alguma coisa tinha acontecido.<br>Algures por baixo.<br><br>Uma decisão pequena.<br>Uma frase que não disse.<br>Um pedido recusado com calma. |
| `00:15.0 – 00:21.0` | Não tudo é lista. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não tudo é lista.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 18 · Quinta 2026-06-18 · Véu da ESFORCO

**Trilha:** `veu-esforco.mp3`  ·  **Imagens:** `cap-18-{1,2,3}.jpg`

### Prompts Midjourney

1. `a narrow neighbourhood street, simple worn shoes mid-stride, low sun`
2. `a dog wagging in a doorway, the silhouette of a woman passing without stopping`
3. `the front door of a house slightly ajar, returning, no rush`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Saiu à rua sem destino.<br>Meia hora.<br><br>Cumprimentou um cão.<br>Não entrou no café. |
| `00:08.0 – 00:14.0` | Voltou.<br><br>Não fez nada.<br>E fez tudo. |
| `00:15.0 – 00:21.0` | A diferença não estava no relógio.<br>Estava em quem voltou. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A diferença não estava no relógio.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 19 · Sexta 2026-06-19 · Véu da DESOLACAO

**Trilha:** `veu-desolacao.mp3`  ·  **Imagens:** `cap-19-{1,2,3}.jpg`

### Prompts Midjourney

1. `an old beeswax candle on a wooden table, the flame steady, dim room`
2. `the candle burning down, wax pooling slowly, soft amber glow`
3. `blackened wick with a thin ribbon of smoke rising, presence remaining`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Acendeu uma vela velha. |
| `00:08.0 – 00:14.0` | Não rezou.<br>Não pediu.<br><br>Sentou-se em frente.<br>Ficou até o pavio se apagar. |
| `00:15.0 – 00:21.0` | A paz não vinha depois do choro.<br>Vinha da presença. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *A paz que vem da presença.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 20 · Sábado 2026-06-20 · Véu da HORIZONTE

**Trilha:** `veu-horizonte.mp3`  ·  **Imagens:** `cap-20-{1,2,3}.jpg`

### Prompts Midjourney

1. `balcony with white laundry catching late golden light, summer solstice`
2. `the long evening sky still bright, a chair facing it, a woman from behind`
3. `twilight finally settling, a hand reaching for the laundry, slow time`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Solstício.<br>Dia mais longo do ano.<br><br>Foi à mercearia.<br>Lavou roupa.<br>Estendeu na varanda. |
| `00:08.0 – 00:14.0` | À noite, a luz ainda era de tarde.<br><br>O sol não tinha pressa.<br>"Porque é que eu tenho." |
| `00:15.0 – 00:21.0` | Algo dentro dela<br>também demorou mais hoje. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *O sol não tinha pressa. Porque é que eu tenho.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 21 · Domingo 2026-06-21 · Véu da DUALIDADE

**Trilha:** `veu-dualidade.mp3`  ·  **Imagens:** `cap-21-{1,2,3}.jpg`

### Prompts Midjourney

1. `park bench with an open book on it, fallen leaves nearby, soft Sunday light`
2. `in the distance a child running blurred, a pigeon taking flight, mother glancing up`
3. `the book held loosely, a finger marking a page, child's laughter implied`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Domingo. Banco do jardim. Livro aberto. |
| `00:08.0 – 00:14.0` | Uma criança a correr atrás de um pombo.<br>A mãe a levantar os olhos do telemóvel.<br><br>O livro e a criança<br>são o mesmo domingo. |
| `00:15.0 – 00:21.0` | Eu estou nos dois. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Eu estou nos dois.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 22 · Segunda 2026-06-22 · Véu da PERMANENCIA

**Trilha:** `veu-permanencia.mp3`  ·  **Imagens:** `cap-22-{1,2,3}.jpg`

### Prompts Midjourney

1. `a clean bathroom mirror reflecting morning, no smudges, simple frame`
2. `a hand touching the mirror's frame, fingertips just visible, light from behind`
3. `the mirror reflecting a window across the room, calm geometry`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | O espelho estava limpo.<br><br>Não se lembrava de o ter limpado.<br>Não havia pano por perto. |
| `00:08.0 – 00:14.0` | Olhou.<br>A mesma cara.<br><br>Mas a poeira fina<br>de há semanas<br>tinha-se ido. |
| `00:15.0 – 00:21.0` | Às vezes não é preciso limpar.<br>É preciso olhar. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Às vezes não é preciso limpar. É preciso olhar.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 23 · Terça 2026-06-23 · Véu da MEMORIA

**Trilha:** `veu-memoria.mp3`  ·  **Imagens:** `cap-23-{1,2,3}.jpg`

### Prompts Midjourney

1. `hands typing on a phone over a kitchen table, careful and slow`
2. `phone screen showing three short lines of text, soft glow on the hands`
3. `the phone laid down after sending, hands intertwined nearby`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Sete dias depois,<br>respondeu à amiga.<br><br>Três frases. |
| `00:08.0 – 00:14.0` | "Hesitei.<br>Lembrei-me de ti.<br>Estou aqui."<br><br>Ela respondeu sete minutos depois.<br>Uma palavra:<br>"também." |
| `00:15.0 – 00:21.0` | Foi suficiente. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Hesitei. Lembrei-me de ti. Estou aqui.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 24 · Quarta 2026-06-24 · Véu da TURBILHAO

**Trilha:** `veu-turbilhao.mp3`  ·  **Imagens:** `cap-24-{1,2,3}.jpg`

### Prompts Midjourney

1. `a single ceramic mug steaming on a plain table, light from one window`
2. `the steam folding into itself, no other detail, contemplative`
3. `the mug emptied, steam gone, the light still gentle`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Chaleira. Apito. Respiração. |
| `00:08.0 – 00:14.0` | Hoje a cozinha não tinha mente nenhuma.<br><br>Só água, gás, vapor, mãos. |
| `00:15.0 – 00:21.0` | Não foi meditação.<br>Foi cozinha. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não foi meditação. Foi cozinha.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 25 · Quinta 2026-06-25 · Véu da ESFORCO

**Trilha:** `veu-esforco.mp3`  ·  **Imagens:** `cap-25-{1,2,3}.jpg`

### Prompts Midjourney

1. `a fingertip just above the send button on a phone, slight hesitation`
2. `the sent-message confirmation softly visible, fingers relaxing`
3. `the phone laid aside, shoulders relaxing in soft window light`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Pequeno pedido.<br>Grande por dentro.<br><br>Há um mês teria dito sim.<br>Hoje, parou. |
| `00:08.0 – 00:14.0` | "Não posso.<br>Obrigada por pensares em mim."<br><br>A pessoa: "tudo bem." |
| `00:15.0 – 00:21.0` | O mundo não caiu.<br>Os ombros desceram um centímetro. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *O mundo não caiu. Os ombros desceram um centímetro.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 26 · Sexta 2026-06-26 · Véu da DESOLACAO

**Trilha:** `veu-desolacao.mp3`  ·  **Imagens:** `cap-26-{1,2,3}.jpg`

### Prompts Midjourney

1. `heavy summer rain hitting a balcony, drops bouncing high, warm light behind`
2. `open hands receiving rainwater, no face, joyful posture`
3. `wet apartment floor with footprints, a towel resting nearby, lit window`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Primeira chuva depois de semanas.<br><br>As pessoas a correr.<br>Ela ficou. |
| `00:08.0 – 00:14.0` | Saiu para a varanda.<br>Sem casaco.<br><br>Em segundos estava molhada.<br>Não correu. Riu-se. |
| `00:15.0 – 00:21.0` | Voltou para dentro a pingar.<br>Não secou logo. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não correu. Riu-se.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 27 · Sábado 2026-06-27 · Véu da HORIZONTE

**Trilha:** `veu-horizonte.mp3`  ·  **Imagens:** `cap-27-{1,2,3}.jpg`

### Prompts Midjourney

1. `an open window with a thin curtain moving slowly, no clock in sight`
2. `the same window with afternoon light, indoor plants growing patient`
3. `evening light dimming through the curtain, the day having arrived anyway`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Decidiu não decidir.<br><br>Sem agenda.<br>Sem plano. |
| `00:08.0 – 00:14.0` | Olhou pela janela.<br>Saiu. Voltou.<br>Leu. Cozinhou.<br>Falou com a vizinha sobre flores.<br><br>Cinco horas<br>sem olhar o relógio. |
| `00:15.0 – 00:21.0` | O dia chegou na mesma. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *O dia chegou na mesma.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 28 · Domingo 2026-06-28 · Véu da DUALIDADE

**Trilha:** `veu-dualidade.mp3`  ·  **Imagens:** `cap-28-{1,2,3}.jpg`

### Prompts Midjourney

1. `wooden apartment floor seen from above, a woman lying with arms slightly open`
2. `the floor texture in detail, a hand resting palm down, calm light`
3. `the floor empty, the imprint of warmth lingering, soft window light`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Deitou-se no chão de madeira.<br>Sem motivo. |
| `00:08.0 – 00:14.0` | As costas reconheceram a casa.<br><br>"O frio do chão<br>também sou eu." |
| `00:15.0 – 00:21.0` | Não no sentido místico.<br>No sentido óbvio. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *O frio do chão também sou eu.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*

---

## CAP 29 · Segunda 2026-06-29 · Véu da FECHAMENTO

**Trilha:** `veu-permanencia.mp3`  ·  **Imagens:** `cap-29-{1,2,3}.jpg`

### Prompts Midjourney

1. `a hand pulling a white cloth off a hallway mirror, slow revelation`
2. `the mirror appearing in pieces, the reflection emerging gently`
3. `fully revealed mirror, a quiet hallway lit by clean morning`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Segunda. Seis da manhã.<br>O corpo escolheu.<br><br>No corredor,<br>um espelho coberto há anos. |
| `00:08.0 – 00:14.0` | Tirou o pano.<br><br>A mesma cara.<br>Diferente. |
| `00:15.0 – 00:21.0` | Não mais nova.<br>Não mais bonita.<br>Mais sua. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Mais sua. Sustentou o olhar.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Continua amanhã.*
- **Linha 3** (Inter 28px cream #F5F0E6): *seteveus.space*

---

## CAP 30 · Terça 2026-06-30 · Véu da INTEIREZA

**Trilha:** `veu-inteireza.mp3`  ·  **Imagens:** `cap-30-{1,2,3}.jpg`

### Prompts Midjourney

1. `a kettle, a closed drawer, a hallway mirror — soft visual triptych in fade`
2. `a single cup of tea on a kitchen table at sunrise, peaceful`
3. `a window open to a portuguese morning, light moving across the room`

### Painéis cinéticos

| Tempo | Texto |
|---|---|
| `00:00.5 – 00:07.0` | Última terça-feira de Junho. |
| `00:08.0 – 00:14.0` | Pôs a chaleira.<br>Verteu a água.<br>Sentou-se à mesa.<br><br>A gaveta com a carta: fechada.<br>O espelho do corredor: destapado. |
| `00:15.0 – 00:21.0` | Não prometeu nada para amanhã.<br>Mas sabia que amanhã ia chegar. |

### Cartão final (00:21.0 – 00:25.0)

- **Linha 1** (Cormorant Garamond italic 44px dourado #E8C97A): *Não prometeu nada. Sabia que amanhã ia chegar.*
- **Linha 2** (Inter 32px cream #F5F0E6): *Recomeça amanhã.*
- **Linha 3** (Inter 28px cream #F5F0E6): *seteveus.space*

---

## Fluxo de produção condensado

```bash
# 1. Gerar 90 imagens MJ a partir dos prompts acima (Discord ou API).
#    Convenção: assets/trinta-manhas/imagens/cap-NN-{1,2,3}.jpg

# 2. Música: as 8 faixas já existem em Supabase (Ancient Ground).
#    O renderer puxa do URL automaticamente. Para correr offline,
#    descarregar de cada URL para assets/trinta-manhas/musica/veu-{nome}.mp3.

# 3. Render dos 30 shorts:
python3 tools/contos-mensais/render-slideshow.py            # todos
python3 tools/contos-mensais/render-slideshow.py 1 7        # caps 1-7
python3 tools/contos-mensais/render-slideshow.py 15 15      # só cap 15

# 4. Regenerar copy CSV e importar no Metricool:
python3 tools/contos-mensais/generate-metricool-csv.py
```
