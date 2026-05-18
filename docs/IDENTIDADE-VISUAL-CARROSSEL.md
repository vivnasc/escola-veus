# Identidade Visual dos Carrosséis — "Ofício do Véu"

**Versão:** 2026-05-18 (rev. 2 — adiciona boho/botânica/artesanato leve, distinção capa/fecho)
**Estado:** activo (single source of truth)
**Aplica a:** todas as colecções de carrossel (52 semanas/ano + Estação dos Véus)

Identidade visual distinta das produções vizinhas:
- `hoje-em-mim` = noite contemplativa, amber íntimo (vela, brasa, chuva)
- `vc-sabia` = fantasia natureza vívida, cor forte, transmutação
- **`carrossel-veus` = Ofício do Véu** (este documento)

Modelo: **núcleo fixo + variação de ênfase por tema**. A gramática (materiais,
paleta, luz, regras de composição) NÃO muda nunca. O que muda semana a
semana é o material em destaque dentro dessa gramática, conforme o brief.

---

## 1. Gramática fixa (não muda)

### 1.1 Materiais autorizados — lista fechada

**Núcleo têxtil/cerâmica (a imagem tem de mostrar pelo menos um):**

| Material | Descrição | Uso |
|---|---|---|
| **Linho cru** | linen oatmeal, dobrado/drapeado/bordado-à-mão | Tecido principal, fundo de altar, panos rituais |
| **Sarja navy** | wool serge dark navy or smoke-grey, vincos verticais pesados | Camadas, mantas, drapeados em peso |
| **Rafia natural** | woven palm fibre, mel-dourado, trama visível | Cestas, mats, detalhes em trança |
| **Cerâmica rústica** | handmade clay, terracota ou navy-glaze, formas simples | Tigelas, jarros, peças centrais |
| **Juta / sisal** | natural jute or sisal weave, tons crus | Mantas leves, runners, contexto boho |

**Botânica autorizada (boho tropical contido, sem geografia explícita):**

| Planta | Descrição | Onde usar |
|---|---|---|
| **Estrelícia** | strelitzia / bird-of-paradise flower or leaf, deep orange + navy bract | Acento de cor forte, único elemento botânico vivo |
| **Palmeira** | palm fronds (areca, fan), banana leaves | Folha como sombra/textura, não paisagem |
| **Monstera** | monstera leaf, recortada, dramática | Detalhe escultural |
| **Pampas seca** | dried pampas grass, beige/cream plumes | Vaso/jarro, soft texture |
| **Ramos secos** | bare branch, twig, dried botanicals | Em cerâmica, minimal |
| **Folha tropical** | broadleaf tropical foliage, navy-green | Sombra, fundo textural |

**Artesanato leve (peças pequenas, não opressivas):**

| Item | Descrição |
|---|---|
| Contas de osso/madeira | small bone or wooden beads, beige/cream, em fio simples |
| Pulseiras macramé | macramé bracelet, natural fibre |
| Cesto pequeno | small woven basket, jute or raffia |
| Vaso de barro | small handmade clay vase |
| Pano tingido natural | indigo/clay-dyed natural cloth, irregular pattern |

**Suportes (apoio cenográfico, secundário):**

| Suporte | Descrição |
|---|---|
| Madeira escura | walnut/oak velho, mesa ou banco |
| Pedra clara | limestone/cream stone, parede ou superfície |
| Parede stucco | hand-troweled cream stucco, textured |

### 1.2 Paleta — Hex fixos

```
Navy profundo    #1A1A2E   (fundo principal, sarja navy, cerâmica glaze escura)
Linho cru        #E8DCC0   (linen oatmeal, base do tecido)
Terracota suave  #B85C38   (cerâmica rústica, acentos quentes)
Rafia dourada    #C9A14A   (trama natural, luz, brilho subtil)
Pedra creme      #D8CFB8   (pedra clara, superfície neutra)
```

### 1.3 Luz

- **Único ponto, oblíquo, suave.** Sempre.
- **Hora**: tarde dourada OU manhã suave. NUNCA meio-dia, NUNCA flash, NUNCA HDR.
- **Sombras** desenham textura (chiaroscuro suave). Não dramáticas.

### 1.4 Composição

- **Ratio**: 9:16 vertical (sempre).
- **Sujeito**: single forte OU dual em diálogo. Negative space generoso.
- **Estilo**: editorial still life, painterly, contemplativo. Não documental seco.

### 1.5 O QUE NUNCA ENTRA

- Pessoas, rostos, mãos.
- Fotorrealismo HDR ou stock photo glossy.
- Cores saturadas, néons.
- Texto, logos, watermarks.
- Geografia identificável (sem "Africa", "Mozambique", "Mediterranean").
- Tecnologia moderna (vidro, metal cromado, plástico, ecrãs).

---

## 2. Mapping tema → material em destaque

Quando o brief da semana mencionar (ou evocar) os conceitos abaixo, o
material em destaque é o seguinte. O Claude API faz este mapping ao gerar
a `notaVisual` de cada slide. Os outros materiais ficam em segundo plano
ou ausentes.

| Tema da semana evoca | Material destaque | Composição típica |
|---|---|---|
| Aconchego, calor, lar, ninho | **SARJA pesada** + linho dobrado | interior íntimo, lamp glow, drapeado |
| Solidão fértil, contemplação, vazio | **CERÂMICA isolada** + pedra | objeto único em vasto espaço, silêncio |
| Brotar, semente, fertilidade, recomeço | **CERÂMICA com ramo** + linho | jarro com galho seco, orvalho, gota |
| Limite que ensina, fronteira, decisão | **LINHO liso** + madeira dura | dobra nítida, sombra clara |
| Recolhimento, silêncio interior | tecidos empilhados | interior fechado, luz oblíqua, sombra |
| Memória, linhagem, herança | **LINHO bordado** à mão | textura macro, gesto antigo |
| Fluidez, soltar, passagem | **LINHO drapeado** | dobra a desfazer-se, movimento subtil |
| Corpo, presença física | **SARJA** + textura macro | trama de tecido em macro |
| Verdade, despir, autenticidade | **LINHO cru** sem ornamento | tecido limpo, single subject |
| Comunidade, partilha, círculo | conjunto de objetos | agrupamento, pilha, altar |
| Festa interior, gratidão | **CERÂMICA + RAFIA** + ramo | mesa preparada, luz dourada quente |
| Início, manhã, recomeço | **LINHO seco** a vento | tecido luminoso, luz limpa |

**Default** (quando o brief não cai claramente em nenhuma): **LINHO** + cerâmica isolada, composição contemplativa.

---

## 3. Composição por tipo de slide

Cada dia tem 6 slides. A ÊNFASE escolhida acima aplica-se aos 2 slides com
fundo MJ (capa + cta), mas com **distinção CRÍTICA**:

### CAPA — DETALHADA e RICA

Cena editorial composta, várias camadas, vários elementos do núcleo +
botânica + artesanato leve em diálogo. Boho contido. Atrai o olhar com
densidade visual de matéria. NÃO é minimal.

Exemplos:
- "Jarro de cerâmica terracota com folha de estrelícia inclinada, sobre
  linho cru drapeado, contas de osso ao lado, sombra de palma na parede
  stucco creme, luz oblíqua da tarde, deep navy ao fundo"
- "Manta de juta sobre madeira escura com cesto pequeno de rafia, ramos
  secos no jarro, palma de banana folha pendurada à esquerda, luz
  manhã suave"
- "Sarja navy drapeada sobre banco com pampas seca em vaso de barro,
  pulseira de macramé pousada, sombra de monstera atrás, golden hour"

### FECHO/CTA — SIMBÓLICA e SIMPLES

Single subject minimal, espaço amplo, evocativo, contemplativo. Um único
objecto do núcleo OU uma única planta. NÃO bohemia carregada. É o silêncio
depois da história. Quase altar.

Exemplos:
- "Single ceramic vessel on pale stone, vast empty navy space, single
  shaft of warm light"
- "Single dried branch in small clay vase against stucco wall, soft
  shadow"
- "Folded linen sheet on dark wood, nothing else, oblique light"

### CONTEÚDO interno (slides 2-5) — sem MJ

Ficam só com tipografia + template editorial. Não forçar fundo onde não há.

---

## 4. Prompt MJ — estrutura fixa

```
<cena com material destaque + objetos núcleo + suporte> ,
<luz oblíqua suave + paleta navy linho terracota rafia> ,
editorial still life photograph, painterly, contemplative,
no people no faces no text no logos no watermarks,
8k, --ar 9:16
```

Exemplo concreto (tema "Solidão fértil", capa):

```
single rustic ceramic vessel in terracotta clay placed on a folded
cream linen cloth on dark walnut wood, vast empty space around,
single oblique soft afternoon light from the left, deep navy
background, painterly editorial still life, contemplative quiet,
no people no faces no text no logos no watermarks, 8k, --ar 9:16
```

---

## 5. Versionamento

Mudanças à gramática (materiais, paleta, luz) exigem:
1. Edição deste documento (bump de data no topo)
2. Edição de `escola-veus-app/src/lib/carousel-generate.ts` (system prompt)
3. Edição de `escola-veus-app/src/lib/carrossel-veus-prompt.ts` (STYLE_BASE)
4. Regerar coleções relevantes via "✦ regerar tudo (Claude)" no editor

Mudanças ao mapping tema→material são livres — só editam este documento.

---

## 6. Origem da escolha

Conversa com Vivianne (2026-05-18, sessão de design):
- A (Limiar Véu) sozinho era demasiado etéreo/abstracto
- B (Ofício Sagrado) sozinho perdia o conceito-véu da marca
- A+B juntos sobre matéria concreta (linho, sarja, rafia, cerâmica) =
  "rústico elegante" com herança craft sem clichê folk
- Modelo 3 (núcleo fixo + ênfase variável) escolhido sobre fixo total ou
  livre total
