# Identidade Visual dos Videos YouTube — Escola dos Veus

Documento de referencia para producao visual dos videos do canal YouTube da Escola dos Veus / Sete Veus.

---

## 1. Paleta de Cores Principal

| Cor | Hex | Uso |
|---|---|---|
| Navy (azul-marinho profundo) | `#1A1A2E` | Fundo de todas as cenas. O "ceu antes da madrugada". |
| Terracota | `#C4745A` | Cor das silhuetas humanas. Quente contra o fundo escuro. |
| Dourado | `#D4A853` | Contorno luminoso das silhuetas, particulas flutuantes, acentos de luz. |
| Creme | `#F5F0E6` | Texto sobreposto (titulos, frases, overlays). |
| Dourado suave (accent) | `#C9A96E` | Brilho dourado alternativo usado em elementos de territorio. |
| Violeta (accent) | `#8B5CF6` | Accent secundario (uso pontual). |

Cada curso/territorio tem tambem a sua paleta propria (ver `territory-themes.ts`), mas estas quatro cores sao a base que nunca muda.

---

## 2. As Silhuetas

- **Terracota** (`#C4745A`) com contorno/brilho dourado (`#D4A853`).
- **Sem rosto, sem features, sem textura de pele.** Apenas uma forma quente e solida.
- **Gender-neutral.** Sem raca, sem idade. Sempre a mesma "pessoa".
- Claramente visiveis contra o fundo navy escuro.
- Golden outline glow — um brilho dourado subtil a contornar a silhueta.

### Poses com significado

| Pose | Significado |
|---|---|
| De pe, imovel | Presenca |
| Curvada | Peso, medo |
| Sentada | Reflexao |
| Maos no peito | Auto-conexao |
| Maos abertas | Recepcao |
| A caminhar | Avanco |
| De costas | Contemplacao |
| Mao estendida | Coragem |

---

## 3. Progressao Luminosa

**A REGRA CENTRAL:** em cada video, a silhueta comeca quase invisivel (fundida com a escuridao navy) e torna-se progressivamente mais visivel, quente e luminosa ao longo das cenas. Nos ultimos momentos, a silhueta esta totalmente radiante com contorno dourado. Isto espelha o arco emocional: da inconsciencia a consciencia.

| Etapa | Tipo de cena | Silhueta | Luz |
|---|---|---|---|
| 1 | Gancho / Abertura | Quase invisivel, fundida com o navy | Escuridao quase total, uma luz dourada longinqua |
| 2 | Reconhecimento / Situacao | Comeca a emergir, terracota muito escuro | Ligeiramente mais visivel que o fundo |
| 3 | Framework / Revelacao | Claramente terracota, mais definida | Contorno comeca a aparecer |
| 4 | Exemplo | Quente, tons dourados a surgir | Hints de dourado nos detalhes |
| 5 | Exercicio / Gesto | Visivel, contorno dourado activo | Golden outline glow presente |
| 6 | Reframe / Frase final | Totalmente luminosa, radiante | Contorno dourado completo, brilho |
| 7 | CTA / Fecho | Luminosa, calor, dissolve | Luz quente que se desvanece suavemente |

### Exemplo concreto (video v1 — "Culpa de gastar dinheiro")

- **Gancho:** "a very faint barely visible dark silhouette figure standing alone in the distance, almost merged with the darkness"
- **Situacao:** "the figure is very dark almost blending into the navy background but slightly visible"
- **Reconhecimento:** "the figure is becoming slightly more terracotta toned now, starting to emerge from the darkness"
- **Exemplo:** "both figures in terracotta now more visible, golden phrases floating like falling leaves"
- **Exercicio:** "a clearly visible terracotta silhouette figure with hand on chest, a warm golden glow radiating"
- **Frase final:** "the terracotta figure now luminous with a golden outline, standing tall and calm, fully visible and radiant"
- **CTA:** "the luminous terracotta and gold figure walking calmly toward a warm golden light"

---

## 4. Estilo Visual

- **Flat minimalist editorial illustration.** Sem volume excessivo, sem 3D.
- **Sem fotorrealismo.** Nunca.
- **Sem rostos de cartoon.** Nunca.
- **Sem texto/palavras nas imagens geradas por IA.** O texto e adicionado em pos-producao como overlay.
- **Mood contemplativo.** Quieto, introspectivo.
- **Formas simples e limpas.** Paleta limitada e muted.

---

## 5. Fundo

- Sempre navy escuro (`#1A1A2E`).
- **"O momento antes da madrugada."** Nunca dia pleno, nunca noite total.
- Profundo, quieto, seguro.
- Progressao ao longo dos modulos do curso: modulos 1-2 mais escuro, modulos 7-8 quase amanhecer (mas o amanhecer nunca chega — o amanhecer e da aluna).

---

## 6. Tipografia nos Videos

| Propriedade | Valor |
|---|---|
| Fontes | Playfair Display, Cormorant Garamond (serifadas elegantes) |
| Cor do texto | Creme `#F5F0E6` sobre fundo escuro |
| Alinhamento | Centrado |
| Maiusculas | Nunca all-caps |
| Sombra | Text-shadow suave |
| Animacao | Fade suave in/out |

---

## 7. Transicoes

- **Zero cortes bruscos.** Tudo dissolve. Tudo respira.
- Dissolve lento entre cenas.
- Ecra escuro com respiracao entre sub-aulas.
- **Proibido:** corte seco, wipe, zoom brusco.

---

## 8. Animacao

- **Motor:** Runway Gen-4.
- Movimento cinematico subtil.
- Silhuetas que "respiram" (movimento lento de inspiracao/expiracao).
- Particulas douradas flutuantes.
- **Sem movimento rapido.** Sem camera shake. Tudo lento e intencional.

---

## 9. Musica de Fundo

- **Duas camadas de musica:**
  - **Instrumental (Suno API)** — por baixo da narracao. `make_instrumental: true`. Volume a ~12%. Textura, nao melodia — quase inaudivel.
  - **Loranne (music.seteveus.space)** — cenas SEM narracao (abertura, fecho, transicoes). Musica com vocais intimistas, organic-electronic. 54 albuns, 1200+ faixas.
- NUNCA sobrepor vocais da Loranne com narracao — duas vozes em simultaneo nao funciona.
- Silencio intencional entre seccoes.
- CTA nos videos: "ouve a faixa completa em music.seteveus.space"

### Ecossistema de dominios (para CTAs e links)

| Dominio | O que e | Quando usar no CTA |
|---------|---------|---------------------|
| `escola.seteveus.space` | Escola — 20 cursos, modulos, cadernos | CTA principal dos videos YouTube |
| `seteveus.space` | Site principal — livro interactivo "Os 7 Veus do Despertar" | Quando referir o livro/universo |
| `music.seteveus.space` | Musica original da Loranne — 1200+ faixas | Quando usar musica nos videos |
- Voz: clone ElevenLabs da Vivianne.

### 9.1 ElevenLabs v3 — Audio Tags (parenteses retos)

O modelo `eleven_v3` usa tags em parenteses retos directamente no texto da narracao.
NAO usa SSML. NAO usar `...` para pausas (cria hesitacao indesejada).

**Pausas:**
- `[short pause]` — micro-pausa (~0.5s)
- `[pause]` — pausa media (~1s)
- `[long pause]` — pausa longa (~2s)

**Emocao/Tom:**
- `[calm]` — tom calmo, centrado
- `[thoughtful]` — tom reflexivo, contemplativo
- `[whispers]` — sussurro
- `[sighs]` — suspiro

**Enfase:**
- MAIUSCULAS = enfase (ex: "NAO e sobre dinheiro")
- `...` = hesitacao/peso natural (usar com moderacao)

**Parametrizacao recomendada:**
- `model_id: "eleven_v3"`
- `language_code: "pt"`
- `stability: 0.35` (mais baixo = mais expressivo e espontaneo; 0.5+ soa a leitura)
- `similarity_boost: 0.70` (0.9 era demasiado rigido, suprimia variacao natural)
- Modo "Creative" ou "Natural" na UI (nao "Stable")

**Exemplo de narracao formatada:**
```
[calm] Imagina isto. [short pause] Alguem te pede algo... e por dentro, sentes um NAO. [pause] Mas o que sai da tua boca — e sim. [long pause] [thoughtful] Porque e que isso acontece?
```

---

## 10. O Que NUNCA Usar

- Fotorrealismo
- Rostos de cartoon
- Cores vivas, neon ou saturadas
- Cortes rapidos / fast cuts
- Stock footage
- Texto "baked" nas imagens geradas por IA (texto e sempre overlay em pos-producao)
- Features de genero nas silhuetas (sem seios, sem barba, sem cabelo definido)
- Camera shake ou movimento brusco
- Wipes ou transicoes bruscas

---

## 11. STYLE Prompt (exacto do codigo)

```
cinematic digital painting, atmospheric, dark navy blue background (#1A1A2E), human figures as anonymous silhouettes in warm terracotta (#C4745A) with soft golden (#D4A853) rim light glow — no face no features no gender markers, volumetric lighting, depth of field, painterly brushstrokes, warm gold and terracotta accent colors, muted rich palette, contemplative cinematic mood, dramatic chiaroscuro, 16:9 widescreen composition, no photorealism, no cartoon, no text, no words, no letters
```

Este prompt e concatenado automaticamente a cada `visualNote` pela funcao `buildPrompt()`.

---

## 12. MOTION Prompts (exactos do codigo)

### v1

| Tipo de cena | Prompt de movimento |
|---|---|
| `abertura` | `slow cinematic camera drift downward, golden particles floating` |
| `pergunta` | `silhouette breathing slowly, golden light pulsing gently` |
| `situacao` | `slow camera tracking, environment subtly alive` |
| `revelacao` | `mirrors uncovering, veils lifting in slow motion` |
| `gesto` | `hand extending, golden particles gathering in palm` |
| `frase_final` | `very slow zoom into darkness` |
| `cta` | `gentle wind, floating golden particles, warm light expanding` |
| `fecho` | `slow dissolve upward into navy sky` |

### v2

| Tipo de cena | Prompt de movimento |
|---|---|
| `trailer` | `slow cinematic sequence, veils lifting, silhouette emerging, golden light` |
| `gancho` | `silhouette breathing slowly, golden light pulsing gently` |
| `reconhecimento` | `slow camera tracking, environment subtly alive` |
| `framework` | `didactic animation, diagrams appearing, slow reveal` |
| `exemplo` | `narrative scene, warm lighting, dissolve transitions` |
| `exercicio` | `hand on chest, golden glow growing, calm` |
| `reframe` | `very slow zoom, text appearing in warm light` |

Fallback (se o tipo nao existir): `slow cinematic movement`.

---

## 13. Territorios Visuais por Curso

Cada curso tem um territorio metaforico com paleta propria. A silhueta e as regras base mantem-se; o que muda e o ambiente.

| Curso | Territorio | Cor dominante | Transformacao visual |
|---|---|---|---|
| Ouro Proprio | Casa dos Espelhos Dourados | Ambar | Espelhos cobertos → espelhos limpos |
| Sangue e Seda | Arvore das Raizes Visiveis | Vermelho escuro, seda | Raizes enterradas → raizes visiveis |
| O Silencio que Grita | Caverna dos Ecos Mudos | Cinza-azulado, branco fantasma | Silencio pesado → ecos dourados |
| Antes do Ninho | O Ninho que Pesa | Ocre quente, branco ovo | Ninho que engole → ninho com espaco |
| O Fio Invisivel | Lago dos Reflexos Partilhados | Azul-prata, fios dourados | Superficie opaca → transparente |
| Pele Nua | O Corpo-Paisagem | Terracota rosado | Paisagem desconhecida → habitada |
| O Peso e o Chao | Caminho de Pedras | Cinza pedra | Curvada sob peso → de pe, leve |
| Brasa Viva | O Vulcao Adormecido | Vermelho-fogo, negro lava | Vulcao selado → lava controlada |
| A Fome | — | Terracota | — |
| A Coroa Escondida | — | Dourado escuro | — |
| Depois do Fogo | O Campo Queimado | Cinza carvao, laranja brasa, verde broto | Destruicao → vida nova |
| Olhos Abertos | Encruzilhada Infinita | Azul nevoeiro, branco | Nevoeiro total → primeiro passo |
| Flores no Escuro | Jardim Subterraneo | Azul profundo, bioluminescentes | — |
| Estacoes Partidas | — | Cinza, dourado | — |
| Maos Cansadas | Oficina Infinita | Bronze, castanho quente | Oficina frenetica → ritmo proprio |
| A Arte da Inteireza | Ponte entre Duas Margens | Violeta, agua | Sem ponte → ponte completa |
| Limite Sagrado | Muralha que Nasce do Chao | Dourado luminoso | Sem limite → muralha de luz |
| Voz de Dentro | Sala do Eco | Violeta escuro, dourado eco | Silencio → voz livre |
| O Espelho do Outro | Galeria dos Reflexos Vivos | Verde-esmeralda, dourado | Espelhos do outro → espelhos de si |
| A Teia | Bosque dos Fios Entrelacados | Verde-musgo, dourado fio | Fios que prendem → teia que sustenta |

Para as paletas hex exactas de cada territorio, consultar `territory-themes.ts`.

---

## Resumo Rapido (checklist de producao)

- [ ] Fundo navy `#1A1A2E` em todas as cenas
- [ ] Silhueta terracota `#C4745A`, sem rosto, gender-neutral
- [ ] Progressao luminosa: escuro no inicio → radiante no fim
- [ ] Contorno dourado `#D4A853` cresce ao longo do video
- [ ] STYLE prompt concatenado a cada visualNote
- [ ] Sem texto nas imagens IA — texto e overlay
- [ ] Transicoes: dissolve lento, sem cortes
- [ ] Musica instrumental a ~12% do volume da narracao
- [ ] Tipografia serifada, creme, centrada, sem all-caps
- [ ] Animacao Runway Gen-4, movimento subtil e lento
