# Escola dos Véus — Pipelines de Vídeo

Dois pipelines distintos numa única ferramenta CLI.

| Pipeline | Input | Output | Uso |
|----------|-------|--------|-----|
| **Cursos** | Scripts Markdown | Slides animados + Suno → MP4 | 80+ aulas, conteúdo educativo |
| **YouTube** | Clips Runway + Script de texto | Clips + texto overlay + Suno → MP4 | Funil, conteúdo contemplativo |

---

# PIPELINE 1 — CURSOS (Slides + Suno)

## Objectivo
Sistema semi-automático que transforma scripts de aulas em vídeos MP4 prontos para upload.
Cada vídeo = slides animados (estilo editorial escuro) + música contemplativa (Suno).
Sem voz. Sem avatar. Sem dependências de plataformas externas pagas.

---

## Arquitectura

```
scripts/        → Markdown com o conteúdo de cada aula
    ↓
[parser]        → Parte o script em slides (título, corpo, tipo)
    ↓
slides.json     → Estrutura de dados dos slides para revisão
    ↓
[gerador]       → Renderiza slides como frames/vídeo (HTML→vídeo ou Python)
    ↓
[montagem]      → Junta slides animados + track Suno → MP4 final
    ↓
output/         → Vídeo pronto para upload
```

---

## 1. Formato dos Scripts (input)

Cada aula é um ficheiro Markdown. Os scripts já existem no repo GitHub da Escola dos Véus.

Estrutura esperada por ficheiro:
```markdown
---
curso: "Sangue e Seda"
modulo: 3
aula: 2
titulo: "O corpo lembra o que a mente esquece"
duracao_alvo: 8  # minutos
musica: "contemplativa-mod3.mp3"  # track Suno (opcional, pode ser atribuída depois)
---

# O corpo lembra o que a mente esquece

A memória somática guarda registos que precedem a linguagem.

---

Tensão, postura, ritmo respiratório — o corpo arquiva tudo.

---

Quando a mente diz "já passou", o corpo responde com um nó na garganta, uma contracção no peito, um aperto nas mãos.

---

Não é fraqueza. É fidelidade.
O corpo não mente. O corpo não esquece.

---

## Exercício

Fecha os olhos.
Respira fundo.
Pergunta ao teu corpo: o que guardas que eu ainda não ouvi?
```

Regras:
- `---` (separador horizontal) marca a transição entre slides
- `# Título` → slide de título (tipo: title)
- `## Exercício` ou `## Reflexão` → slide de tipo especial (exercício/reflexão)
- Texto normal → slide de conteúdo (tipo: content)
- Cada slide deve conter pouco texto — frases curtas, impacto máximo

---

## 2. Parser (script → slides.json)

Input: ficheiro Markdown
Output: JSON com array de slides

```json
{
  "curso": "Sangue e Seda",
  "modulo": 3,
  "aula": 2,
  "titulo": "O corpo lembra o que a mente esquece",
  "duracao_alvo": 8,
  "musica": "contemplativa-mod3.mp3",
  "slides": [
    {
      "tipo": "title",
      "texto": "O corpo lembra o que a mente esquece",
      "subtexto": "Módulo 3 · Aula 2",
      "duracao": 6
    },
    {
      "tipo": "content",
      "texto": "A memória somática guarda registos que precedem a linguagem.",
      "duracao": 8
    },
    {
      "tipo": "content",
      "texto": "Tensão, postura, ritmo respiratório — o corpo arquiva tudo.",
      "duracao": 7
    },
    {
      "tipo": "content",
      "texto": "Quando a mente diz \"já passou\", o corpo responde com um nó na garganta, uma contracção no peito, um aperto nas mãos.",
      "duracao": 10
    },
    {
      "tipo": "content",
      "texto": "Não é fraqueza. É fidelidade.\nO corpo não mente. O corpo não esquece.",
      "duracao": 10
    },
    {
      "tipo": "exercise",
      "texto": "Fecha os olhos.\nRespira fundo.\nPergunta ao teu corpo: o que guardas que eu ainda não ouvi?",
      "duracao": 15
    },
    {
      "tipo": "end",
      "texto": "Escola dos Véus",
      "subtexto": "seteveus.space",
      "duracao": 5
    }
  ]
}
```

Regra de duração automática: ~1 segundo por 10 caracteres, mínimo 5s, máximo 15s.
A duração total dos slides deve aproximar-se da `duracao_alvo` (ajustar proporcionalmente).

---

## 3. Revisão (step humano)

O sistema gera o `slides.json` e **para aqui**.
Vivianne revê:
- Ordem dos slides
- Texto de cada slide (edita directamente no JSON ou numa UI simples)
- Duração por slide (ajusta se necessário)
- Atribui a track Suno se ainda não tiver

Só depois de aprovado avança para renderização.

**Opção de UI de revisão**: criar uma página HTML local que carrega o `slides.json`, mostra preview visual de cada slide no estilo final, permite editar texto/duração/ordem, e exporta o JSON actualizado.

---

## 4. Design Visual dos Slides

### Estilo: Editorial Escuro (Escola dos Véus)

Paleta:
- Fundo: `#0d0d0d` (negro quase puro)
- Texto principal: `#f0ece6` (creme claro)
- Accent 1: `#E94560` (coral — usado em labels e linhas)
- Accent 2: `#533483` (roxo — usado em gradientes subtis)
- Texto secundário: `#6a6460` (cinza quente)

Tipografia:
- Títulos: DM Serif Display (serifada, elegante)
- Corpo: Nunito (sans-serif, legível)
- Labels: Nunito, uppercase, letter-spacing: 2px

### Tipos de slide

**Title slide:**
- Label pequeno topo: "Módulo X · Aula Y" em coral, uppercase, 9px
- Título grande centrado: DM Serif Display, 48px, cor creme
- Linha gradient coral→roxo (40px largura, 2px altura)
- Fade-in suave (1s)

**Content slide:**
- Texto centrado vertical e horizontal
- DM Serif Display para frases curtas impactantes (≤ 2 linhas)
- Nunito para texto mais longo (> 2 linhas)
- Tamanho: 32-40px para frases curtas, 24-28px para texto longo
- Fade-in palavra a palavra ou linha a linha (efeito typewriter suave)
- Margem lateral generosa (15% cada lado)

**Exercise slide:**
- Ícone ou símbolo subtil no topo (círculo, ponto, ou símbolo dos véus)
- Label "Exercício" ou "Reflexão" em coral
- Texto em Nunito, 24px, espaçamento entre linhas generoso
- Aparecimento linha a linha com pausa entre cada

**End slide:**
- Logo ou nome "Escola dos Véus" em DM Serif Display
- URL seteveus.space em Nunito, tamanho pequeno
- Fade-out para negro

### Transições entre slides
- Fade to black (0.5s out, 0.5s in) — nunca cortes secos
- 0.5s de negro entre slides (breathing room)

### Resolução
- 1920×1080 (YouTube landscape)
- Para Shorts: 1080×1920 (gerar variante vertical com layout adaptado)

---

## 5. Renderização (slides → vídeo)

### Opção recomendada: HTML + Puppeteer + FFmpeg

1. Gera uma página HTML por slide com as animações CSS
2. Puppeteer captura cada slide como vídeo (ou sequência de frames)
3. FFmpeg concatena todos os slides num único vídeo

Alternativa: Python + Pillow/MoviePy para gerar frames directamente.

### Processo:
```bash
# 1. Gerar HTML de cada slide
node generate-slides.js slides.json

# 2. Capturar cada slide como vídeo
node capture-slides.js slides/

# 3. Concatenar + adicionar música
ffmpeg -f concat -i slides-list.txt -i musica.mp3 \
  -c:v libx264 -c:a aac -shortest \
  -vf "fade=in:0:30,fade=out:st=DURACAO:d=2" \
  output/sangue-e-seda-m3-a2.mp4
```

---

## 6. Música (Suno)

- Cada módulo ou curso tem uma track contemplativa gerada no Suno
- A track deve ser mais longa que o vídeo (loop se necessário)
- FFmpeg usa `-shortest` para cortar a música no fim do vídeo
- Fade-in de 2s no início, fade-out de 3s no fim
- Volume: baixo o suficiente para não competir com a leitura (~-15dB)

Organização:
```
musica/
  sangue-e-seda/
    contemplativa-mod1.mp3
    contemplativa-mod2.mp3
    contemplativa-mod3.mp3
  depois-do-fogo/
    contemplativa-mod1.mp3
    ...
```

---

## 7. Output

```
output/
  sangue-e-seda/
    m3-a2-o-corpo-lembra.mp4      # YouTube landscape
    m3-a2-o-corpo-lembra-short.mp4 # YouTube Short (se aplicável)
    m3-a2-o-corpo-lembra-thumb.png # Thumbnail
```

Thumbnail: gerado automaticamente a partir do title slide (screenshot estático).

---

## 8. Workflow Completo

```
1. Vivianne escreve/revê script em Markdown
2. CLI: `escola-veus parse aula.md` → gera slides.json
3. CLI: `escola-veus preview` → abre preview HTML para revisão
4. Vivianne revê e aprova (edita se necessário)
5. CLI: `escola-veus render slides.json --musica contemplativa-mod3.mp3`
6. Output: MP4 pronto para upload
```

---

## 9. Stack Técnica

- **Node.js** — parser Markdown + gerador HTML
- **Puppeteer** — captura de slides como vídeo/frames
- **FFmpeg** — montagem final (concatenação + áudio)
- **Fontes**: DM Serif Display + Nunito (Google Fonts, carregadas localmente)

Dependências mínimas, tudo local, sem APIs externas, sem custos recorrentes.

---

## 10. Extensões Futuras (não implementar agora)

- [ ] Batch mode: processar todas as aulas de um curso de uma vez
- [ ] Variante Short automática (recortar slides-chave para 15s vertical)
- [ ] Dashboard de progresso (quantas aulas prontas por curso)
- [ ] Integração com upload automático ao YouTube via API
- [ ] Adicionar narração pontual (frases curtas) se Vivianne decidir no futuro

---
---

# PIPELINE 2 — YOUTUBE / FUNIL (Runway + Texto Overlay + Suno)

## Objectivo
Transformar clips visuais gerados manualmente no Runway (via apps, sem API) em vídeos contemplativos com texto overlay elegante e música Suno. Para o funil YouTube — vídeos de 6-10 min e Shorts de 15s.

---

## Arquitectura

```
clips/              → Clips exportados do Runway (sem áudio)
    ↓
script.md           → Frases/textos a sobrepor nos clips + timings
    ↓
[parser]            → Gera timeline.json (clip + texto + timing)
    ↓
[revisão]           → Preview HTML para Vivianne aprovar
    ↓
[render]            → FFmpeg: concatena clips + overlay texto + música Suno
    ↓
output/             → MP4 final pronto para YouTube
```

---

## 1. Organização dos Clips (input)

Vivianne exporta clips do Runway para uma pasta organizada por vídeo:

```
clips/
  despertar-ep01/
    cena-01-floresta.mp4
    cena-02-mulher-rio.mp4
    cena-03-amanhecer.mp4
    cena-04-mãos-terra.mp4
```

Regras:
- Nomear por ordem: `cena-01-descricao.mp4`, `cena-02-descricao.mp4`
- Qualquer resolução aceite, pipeline normaliza para 1920×1080
- Sem áudio (ou áudio será ignorado/removido)

---

## 2. Script de Texto Overlay (input)

Ficheiro Markdown com as frases que aparecem sobre os clips:

```markdown
---
titulo: "Despertar — Episódio 1"
musica: "suno/contemplativa-despertar.mp3"
---

@cena-01 [0:02-0:08]
E se tudo o que sabes sobre ti
já não te servir?

@cena-01 [0:12-0:18]
Há uma versão tua que ainda não nasceu.

@cena-02 [0:03-0:10]
O rio não luta contra as pedras.
Contorna. Encontra caminho.

@cena-03 [0:02-0:14]
Acordar não é um momento.
É uma decisão repetida
todos os dias.

@cena-04 [0:05-0:12]
Toca a terra.
Sente o que está debaixo
do que pensas sentir.
```

Formato:
- `@cena-XX` — referência ao clip
- `[inicio-fim]` — quando o texto aparece dentro daquele clip (segundos)
- Texto livre abaixo — o que aparece no ecrã
- Linhas separadas = linhas separadas no ecrã (aparecem juntas ou uma a uma)

---

## 3. Parser (script → timeline.json)

```json
{
  "titulo": "Despertar — Episódio 1",
  "musica": "suno/contemplativa-despertar.mp3",
  "clips": [
    {
      "ficheiro": "cena-01-floresta.mp4",
      "duracao_original": 20,
      "textos": [
        {
          "inicio": 2,
          "fim": 8,
          "linhas": ["E se tudo o que sabes sobre ti", "já não te servir?"],
          "animacao": "fade"
        },
        {
          "inicio": 12,
          "fim": 18,
          "linhas": ["Há uma versão tua que ainda não nasceu."],
          "animacao": "fade"
        }
      ]
    },
    {
      "ficheiro": "cena-02-mulher-rio.mp4",
      "duracao_original": 16,
      "textos": [
        {
          "inicio": 3,
          "fim": 10,
          "linhas": ["O rio não luta contra as pedras.", "Contorna. Encontra caminho."],
          "animacao": "fade"
        }
      ]
    }
  ]
}
```

---

## 4. Design do Texto Overlay

### Estilo: Contemplativo Flutuante

O texto deve parecer que **respira** — aparece suavemente, vive sobre a imagem, e dissolve-se.

**Tipografia:**
- Font principal: DM Serif Display (serifada, elegante) — para frases curtas/impacto
- Font secundária: Nunito (sans-serif) — para frases mais longas
- Regra: ≤ 2 linhas → DM Serif Display, 40-48px. > 2 linhas → Nunito, 28-32px

**Cor do texto:**
- Branco creme `#f0ece6` com sombra suave para legibilidade sobre qualquer fundo
- Text shadow: `0 2px 20px rgba(0,0,0,0.7)` — difusa, nunca um contorno duro
- Alternativa: semi-transparent dark overlay atrás do texto (pill shape, `rgba(0,0,0,0.3)`, blur backdrop)

**Posicionamento:**
- Centro vertical, centro horizontal (default)
- Margem lateral: 15% cada lado (texto nunca toca as bordas)
- Para Shorts (vertical): mesma lógica mas terço inferior

**Animações de entrada/saída:**
- **Fade** (default): opacity 0→1 em 0.8s, permanece, opacity 1→0 em 0.8s
- **Rise**: fade + translate de 20px abaixo para posição final (0.8s ease-out)
- **Typewriter**: cada linha aparece sequencialmente com 0.3s entre linhas, fade conjunto no fim
- Nunca: slide lateral, bounce, zoom, rotate — nada agressivo

**Entre textos no mesmo clip:**
- Mínimo 1s de "silêncio visual" (sem texto) entre blocos de texto
- O vídeo respira entre frases

**Linha accent (opcional):**
- Linha fina gradient coral→roxo (40px × 2px) abaixo do texto
- Aparece com o texto, desaparece com o texto
- Só em frases de impacto máximo, não em todas

---

## 5. Renderização

### FFmpeg pipeline:

```bash
# 1. Normalizar todos os clips para 1920x1080, 30fps
for clip in clips/*.mp4; do
  ffmpeg -i "$clip" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" -r 30 -an "normalized/$(basename $clip)"
done

# 2. Concatenar clips normalizados
ffmpeg -f concat -safe 0 -i clips-list.txt -c copy concatenated.mp4

# 3. Aplicar texto overlay com filtro drawtext + fade
# (gerado dinamicamente a partir do timeline.json)
ffmpeg -i concatenated.mp4 \
  -vf "drawtext=fontfile=fonts/DMSerifDisplay.ttf:text='E se tudo o que sabes sobre ti':fontcolor=0xf0ece6:fontsize=44:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(between(t,2,2.8),((t-2)/0.8),if(between(t,2.8,7.2),1,if(between(t,7.2,8),((8-t)/0.8),0)))'" \
  -c:a copy overlay.mp4

# 4. Adicionar música Suno
ffmpeg -i overlay.mp4 -i musica.mp3 \
  -filter_complex "[1:a]volume=-15dB,afade=t=in:d=2,afade=t=out:st=DURACAO-3:d=3[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -shortest \
  output/despertar-ep01.mp4
```

### Alternativa mais limpa: HTML overlay + Puppeteer

Para animações de texto mais sofisticadas (typewriter, rise, múltiplas linhas):
1. Renderiza o clip como fundo num `<video>` dentro de HTML
2. Overlay de texto com CSS animations
3. Puppeteer captura o resultado como vídeo
4. FFmpeg adiciona música

Esta opção dá mais controlo sobre as animações mas é mais pesada computacionalmente.

**Recomendação: começar com FFmpeg drawtext (rápido, funcional). Se a qualidade do texto não satisfizer, migrar para HTML+Puppeteer.**

---

## 6. Workflow Completo (Pipeline 2)

```
1. Vivianne gera clips no Runway (apps, manual)
2. Exporta clips para pasta clips/nome-video/
3. Escreve script de texto overlay em Markdown
4. CLI: `escola-veus yt parse script.md` → gera timeline.json
5. CLI: `escola-veus yt preview` → abre preview HTML com clips + texto
6. Vivianne revê e aprova
7. CLI: `escola-veus yt render timeline.json --musica contemplativa.mp3`
8. Output: MP4 pronto para upload
```

---

## 7. Comandos CLI Unificados

```bash
# PIPELINE 1 — CURSOS
escola-veus curso parse aula.md              # Script → slides.json
escola-veus curso preview                     # Preview HTML para revisão
escola-veus curso render slides.json          # Render → MP4

# PIPELINE 2 — YOUTUBE
escola-veus yt parse script.md               # Script → timeline.json
escola-veus yt preview                        # Preview HTML com clips + texto
escola-veus yt render timeline.json           # Render → MP4

# GERAL
escola-veus batch curso sangue-e-seda/       # Batch: todas as aulas de um curso
escola-veus batch yt youtube/despertar/       # Batch: todos os eps de uma série
```

---

## 8. Geração de Música Suno (referência)

Para cada vídeo, Vivianne gera uma track no Suno com prompts tipo:

**Para cursos (contemplativo, fundo):**
```
ambient contemplative piano, minimal, introspective, 
warm low frequencies, slow tempo 60bpm, 
no vocals, meditation background, 10 minutes
```

**Para YouTube (cinematográfico, emocional):**
```
cinematic ambient, emotional strings, 
ethereal pads, slow build, contemplative, 
no vocals, film score feel, 8 minutes
```

Organização:
```
musica/
  cursos/
    sangue-e-seda-mod1.mp3
    sangue-e-seda-mod2.mp3
  youtube/
    despertar-ep01.mp3
    despertar-ep02.mp3
```
