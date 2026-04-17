# Vídeos YouTube — Conceito Completo

**Última actualização:** 2026-04-17

---

## DOIS TIPOS DE VÍDEOS YOUTUBE

### TIPO 1 — Natureza Moçambique (Ancient Ground)
**Canal:** Ancient Ground / Escola dos Véus
**Objectivo:** Vídeos ambiente contemplativos que elevam Moçambique
**Formato:** 10 min de clips únicos (sem repetição)
**Conteúdo:** Paisagens realistas de Moçambique — oceano, praias, rios, savana, céu, flora
**Música:** Loranne — álbum "Ancient Ground" (100 faixas, pares A+B em loop)
**Imagens:** ThinkDiffusion (SDXL RealVisXL/UltraReal) → Runway Gen-4 Turbo → clips 10s
**Organização:** 50 vídeos planeados em `video-plan.json`, 12 categorias de natureza

**Este projecto ELEVA MOÇAMBIQUE:**
- Todas as imagens são de paisagens moçambicanas
- Oceano Índico, Bazaruto, Tofo, Inhambane, Gorongosa
- Savana africana, baobás, mangais, rios tropicais
- Títulos e descrições devem sempre mencionar Moçambique
- Hashtags: #Mozambique #IndianOcean #AfricanNature #Moçambique

---

### TIPO 2 — Vídeos dos Cursos (Colecção B)
**Canal:** Escola dos Véus
**Objectivo:** Vídeos YouTube que acompanham os 122 scripts Nomear
**Formato:** Por definir (1 min? 5 min?)
**Conteúdo:** Imagens abstractas/simbólicas que reflectem a mensagem emocional de cada script

**REGRAS VISUAIS DA COLECÇÃO B:**
- **GLOBAL** — nada especificamente africano
- **SEM PESSOAS** — nem mãos, nem silhuetas, nem rostos, nada
- **SEM ESTEREÓTIPOS** — nada que reduza ou exotize África
- **ABSTRACTO/SIMBÓLICO** — objectos, texturas, luz, espaços

**10 TEMAS VISUAIS DA COLECÇÃO B:**

| Tema | Cursos associados | Exemplos visuais |
|------|-------------------|------------------|
| **Espelho** | Pele Nua, O Espelho do Outro | Espelho embaciado, reflexo em água, vidro |
| **Porta** | Limite Sagrado, A Coroa Escondida | Porta fechada, porta entreaberta, limiar |
| **Água** | Sangue e Seda, A Fome | Água a correr, gotas, superfície líquida |
| **Luz** | Olhos Abertos, Voz de Dentro | Luz pela fresta, raios, sombra e luz |
| **Tecido** | Sangue e Seda, Pele Nua | Seda ondulando, tecido ao vento, véu |
| **Objecto** | Ouro Próprio, A Chama | Vela acesa, livro aberto, chave, corrente |
| **Tempo** | O Relógio Partido | Relógio, ampulheta, estações, fases da lua |
| **Raiz** | O Fio Invisível, A Mulher Antes de Mãe | Raízes de árvore, tronco antigo, terra |
| **Fragmento** | A Arte da Inteireza, Depois do Fogo | Vidro partido, mosaico, peças soltas |
| **Vazio** | O Silêncio que Grita, A Fome | Cadeira vazia, quarto escuro, mesa abandonada |

**Mapeamento por curso (20 cursos × temas):**

| Curso | Temas visuais |
|-------|---------------|
| Ouro Próprio | objecto, vazio, porta |
| Limite Sagrado | porta, fragmento, raiz |
| Sangue e Seda | água, tecido, espelho |
| O Silêncio que Grita | vazio, porta, luz |
| Pele Nua | espelho, tecido, luz |
| A Fome | vazio, água, objecto |
| A Chama | objecto (vela/fogo), luz, tecido |
| Voz de Dentro | luz, espelho, água |
| A Mulher Antes de Mãe | raiz, espelho, vazio |
| O Peso e o Chão | raiz, terra, fragmento |
| Depois do Fogo | fragmento, luz, objecto |
| A Teia | raiz, tecido, água |
| A Coroa Escondida | porta, luz, objecto |
| O Fio Invisível | raiz, tecido, tempo |
| A Arte da Inteireza | fragmento, espelho, luz |
| O Espelho do Outro | espelho, água, porta |
| Olhos Abertos | luz, porta, vazio |
| Flores no Escuro | luz, raiz, água |
| O Relógio Partido | tempo, fragmento, vazio |
| O Ofício de Ser | raiz, luz, porta |

**ESTADO:** Prompts por criar. Vivianne aprovou a filosofia visual.

---

## PIPELINE COMPLETO (actualizado 2026-04-17)

### Imagens
- **Motor:** ThinkDiffusion (SDXL, checkpoint UltraReal ou RealVisXL)
- **Créditos:** ~$32 restantes ($0.79/hr QUICK, $1.99/hr ULTRA)
- **Prompts:** 107 prompts em `thinkdiffusion-prompts.json` (15 mar + 15 praia + 15 rio + restantes)
- **Formato:** 1920×1080 (horizontal) + 1080×1920 (vertical)
- **Upload:** Página `/admin/thinkdiffusion` → arrasta por prompt → Supabase
- **Organização:** `course-assets/youtube/images/{promptId}/{horizontal|vertical}/`

### Clips
- **Motor:** Runway API Gen-4 Turbo (10s, 5 cr/s = 50 cr/clip)
- **Créditos:** 800 restantes. Limite diário ~50 clips
- **Motion prompts:** Editáveis por imagem na página. Template MD para bulk
- **Geração:** Botão "Gerar clip" por imagem ou "GERAR TODOS" (5s entre cada)
- **TaskIds:** Guardados no Supabase ANTES de polling (nunca se perdem)
- **Recuperação:** `/api/admin/thinkdiffusion/complete-tasks` verifica pendentes
- **Organização:** `course-assets/youtube/clips/{nome}.mp4`

### Música
- **Álbum:** Ancient Ground (Loranne) — 100 faixas
- **Formato:** Pares A+B em loop (faixa-01+02, 03+04, etc.)
- **Localização:** Supabase `audios/albums/ancient-ground/`
- **Público:** URLs directos sem autenticação

### Montagem
- **Página:** `/admin/youtube-montagem`
- **Carrega clips do Supabase automaticamente**
- **Thumbnails com hover-to-play**
- **Render:** Shotstack API (clips + música → MP4)
- **Output:** `course-assets/youtube/videos/`

---

## O QUE EXISTE NO SUPABASE (17 Abril 2026)

```
course-assets/
  youtube/
    images/
      mar-01-golden/horizontal/   (4 imagens)
      mar-01-golden/vertical/     (4 imagens)
      mar-02-aerial/...
      mar-03-wave/...
      ... (8 prompts × 4H + 4V = ~64 imagens)
      mar-09-amanhecer-rosa/...   (novos prompts, por gerar)
      ...
    clips/
      mar-01-golden-hour-h-01.mp4
      mar-02-aerial-bazaruto-h-01.mp4
      ... (~32 clips horizontais)
    tasks/
      {taskId}.json               (taskIds guardados para recuperação)
    videos/
      (vazio — por renderizar)
```

---

## DECISÕES FIRMES

1. ThinkDiffusion para imagens (NÃO fal.ai)
2. Sem compressão de imagens (PNG original)
3. Clips seguem sequência dos prompts (NÃO baralhar)
4. Horizontal = vídeos longos, Vertical = Shorts
5. TaskIds SEMPRE guardados no Supabase
6. 5s de pausa entre submissões Runway batch
7. Motion prompts editáveis pela Vivianne
8. Colecção B: global, sem pessoas, sem estereótipos
9. O projecto ELEVA MOÇAMBIQUE — reflectir em títulos, descrições, hashtags
10. Música: Ancient Ground (Loranne), pares em loop
