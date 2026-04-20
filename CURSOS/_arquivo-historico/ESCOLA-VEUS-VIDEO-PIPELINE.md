# Escola dos Véus — Pipeline de Vídeo (Slides + Música Suno)

## Objectivo
Sistema semi-automático que transforma scripts de aulas em vídeos MP4 prontos para YouTube.
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
