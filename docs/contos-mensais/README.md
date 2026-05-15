# Contos Mensais · Escola dos Véus

Terceira linha de conteúdo para as redes. Conto serializado em 30 capítulos por mês.

**Objetivo de conversão:** crescimento de seguidores nas redes (não cliques externos). Cada short é otimizado para retenção, saves e shares dentro da plataforma. O link `seteveus.space` aparece apenas em 4 posts-âncora por mês (cap 1, 15, 29, 30) e na bio — o resto puxa engagement sem fuga.

## Mês 1 · Junho 2026 · "Trinta Manhãs"

Slideshow editorial sem voz humana — 3 imagens Midjourney em fade + texto cinético + faixa Ancient Ground (Loranne instrumental). ~25 segundos por short.

### Ficheiros

| Ficheiro | Para quê |
|---|---|
| `MES-01-JUNHO-2026-BIBLIA.md` | Premissa, voz, personagem, mapa de véus, arco, template do short, regras de copy, métricas. **Começar aqui.** |
| `MES-01-JUNHO-2026-GUIOES.md` | Fonte literária dos 30 capítulos — texto-base, imagem-chave, frase-âncora. *Não é o que se publica*; a copy canónica está no CSV. |
| `MES-01-JUNHO-2026-SLIDESHOW.md` | Produção visual e sonora: 90 prompts Midjourney + atribuição das 8 faixas Ancient Ground (1 por véu) + painéis cinéticos com timings. Único ficheiro para a equipa de produção. **Gerado** — não editar à mão; alterar `tools/contos-mensais/content.py` e correr `generate-slideshow-md.py`. |
| `MES-01-JUNHO-2026-METRICOOL.csv` | 120 posts (4 plataformas × 30 dias) prontos para importar no Metricool. **Gerado** — `tools/contos-mensais/generate-metricool-csv.py`. |

### Fluxo de produção (1 vez antes de 2026-06-01)

1. **Imagens (90).** Gerar 30 × 3 stills no Midjourney v6 usando os prompts em `MES-01-JUNHO-2026-SLIDESHOW.md` (`--ar 9:16 --style raw --stylize 200`). Guardar como `assets/trinta-manhas/imagens/cap-NN-{1,2,3}.jpg`.
2. **Música.** Sem produção — as 8 faixas Ancient Ground já estão em Supabase. Ouvir as atribuições em `MES-01-JUNHO-2026-SLIDESHOW.md` §"Trilhas Ancient Ground"; trocar números em `content.py:AG_TRACKS_BY_VEU` se alguma faixa não encaixar com o véu. O renderer puxa do URL público automaticamente (ou usa cópia local `assets/trinta-manhas/musica/veu-{nome}.mp3` se existir).
3. **Render em batch:**
   ```bash
   bash tools/contos-mensais/render-batch.sh                 # todos os 30
   bash tools/contos-mensais/render-batch.sh 1 7             # caps 1-7
   bash tools/contos-mensais/render-batch.sh --dry-run       # imprime FFmpeg
   ```
   Output em `renders/trinta-manhas/trinta-manhas-cap-NN.mp4`. ~25s, 1080×1920, 5-8MB.
4. **Copy.** `python3 tools/contos-mensais/generate-metricool-csv.py` regenera o CSV.
5. **Agendamento.** Importar CSV no Metricool, anexar vídeos da Biblioteca. Atualizar bio das 4 contas: `Trinta Manhãs · conto diário · 07:30 / seteveus.space`.

### Fonts opcionais

O renderer usa Liberation Serif Italic + Liberation Sans Regular por defeito. Para a identidade visual definitiva (Cormorant Garamond Italic na frase-âncora; Inter Regular nas linhas de cartão):

```bash
FONT_SERIF=/path/to/CormorantGaramond-Italic.ttf \
FONT_SANS=/path/to/Inter-Regular.ttf \
  bash tools/contos-mensais/render-batch.sh
```

### Estratégia de link

| Caps | Última linha |
|---|---|
| 1, 15, 29 | `Continua amanhã. seteveus.space` |
| 30 | `Recomeça amanhã. seteveus.space` |
| 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 | `Continua amanhã.` *(sem URL)* |

CTAs internos extra (saves/shares sem fugir da plataforma):
- Cap 7 (domingo do 1.º ciclo): `guarda esta`
- Cap 14 (domingo do 2.º ciclo): `envia a quem precisa`
- Cap 21 (domingo do 3.º ciclo): `vê desde o cap 1`

### Agendamento no Metricool

CSV no formato `date,time,network,text,link,media` (column `link` vazio em 26 dos 30 dias).

1. Metricool → Planeamento → Importar
2. Carregar `MES-01-JUNHO-2026-METRICOOL.csv`
3. Mapear: `date`→Data, `time`→Hora, `network`→Rede social, `text`→Texto, `media`→Anexar de Biblioteca
4. Pré-visualizar e confirmar

Plano sem bulk upload: abrir o CSV, copiar `text` linha-a-linha, anexar o vídeo de `renders/trinta-manhas/`.

### Métrica de sucesso

Foco: **crescimento de seguidores**. Sinais que alimentam o algoritmo a empurrar para não-seguidores:

- **Completion rate** ≥70% (sinal #1)
- **Saves** ≥3% das views
- **Shares** ≥2% das views
- **Profile visits** ≥1% das views
- **Follow rate** ≥10% das profile-visits
- **Novos seguidores líquidos / semana** crescendo

Se ao fim do 1.º ciclo (7 dias) o completion estiver <50%, encurtar para 18s. Se completion bom mas follow baixo, fortalecer a frase-âncora.

Tráfego para `seteveus.space` (Plausible) é secundário — útil só para confirmar que os 4 posts-âncora puxam.

### Regenerar ficheiros derivados

```bash
# Após editar content.py (prompts MJ, frases-âncora, prompts AG):
python3 tools/contos-mensais/generate-slideshow-md.py

# Após editar generate-metricool-csv.py (copy, hashtags, mapping):
python3 tools/contos-mensais/generate-metricool-csv.py
```

## Próximos meses (esboço)

- **Julho 2026 · "Trinta Noites"** — espelho de Junho. Mesma protagonista, vista pelas noites.
- **Agosto 2026 · "Trinta Janelas"** — outras pessoas vistas das janelas. Sai do "eu" para o "outros".
- **Setembro 2026 · "Trinta Cartas"** — formato epistolar. Cada capítulo é uma carta curta.

Cada mês mantém: 30 caps, 7 véus em rotação, mesma identidade visual e sonora, hashtag-série única, link `seteveus.space` em 4 posts-âncora + bio.
