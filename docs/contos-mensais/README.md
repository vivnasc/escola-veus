# Contos Mensais · Escola dos Véus

Terceira linha de conteúdo para as redes — sem marketing, só com link da escola.

## Mês 1 · Junho 2026 · "Trinta Manhãs"

Um conto serializado em 30 capítulos diários. Cada dia da semana é um véu. O conto fecha-se a 30 de Junho.

### Ficheiros

| Ficheiro | O que é |
|---|---|
| `MES-01-JUNHO-2026-BIBLIA.md` | Premissa, voz, personagem, mapa semanal de véus, arco em 3 atos, template de short, plataformas e horários, regras de copy. **Começar por aqui.** |
| `MES-01-JUNHO-2026-GUIOES.md` | Os 30 capítulos — logline, narração (~75 palavras), imagem-chave, música, frase-âncora e copy pronta a publicar em IG / TikTok / YouTube Shorts / Facebook. |
| `MES-01-JUNHO-2026-METRICOOL.csv` | 120 posts (4 plataformas × 30 dias) prontos para importar no Metricool. Gerado por `tools/contos-mensais/generate-metricool-csv.py`. |

### Fluxo de produção (1 vez antes de 2026-06-01)

1. **Gravar narrações** — 30 capítulos × ~30s ≈ 16 min de áudio. Recomendado fazer em 3 sessões de 10. Sair em `assets/trinta-manhas/narracao/cap-NN.wav`.
2. **Gerar SRTs** — uma por capítulo, a partir do texto da narração. Sair em `assets/trinta-manhas/srt/cap-NN.srt`. Pode usar o pipeline Loranne existente ou alinhamento manual.
3. **Escolher vídeo base** — clip Ancient Ground por capítulo (cenário coerente com o território visual indicado nos guiões). Sair em `assets/trinta-manhas/base/cap-NN.mp4`.
4. **Cortar tracks Loranne** — 2-3 tracks por véu, instrumental, cortadas para a duração. Sair em `assets/trinta-manhas/musica/cap-NN.mp3`.
5. **Render em batch:**
   ```bash
   bash tools/contos-mensais/render-batch.sh
   # ou um intervalo:
   bash tools/contos-mensais/render-batch.sh 1 7
   ```
   Output em `renders/trinta-manhas/trinta-manhas-cap-NN.mp4`.

### Agendamento no Metricool

O CSV gerado segue o formato genérico `date,time,network,text,link,media`.

**Opção A · Importação direta (planos com Bulk Upload):**
1. Metricool → Planeamento → Importar
2. Carregar `MES-01-JUNHO-2026-METRICOOL.csv`
3. Mapear colunas: `date` → Data, `time` → Hora, `network` → Rede social, `text` → Texto, `media` → Anexar de Biblioteca
4. Pré-visualizar e confirmar

**Opção B · Copy & paste manual (planos básicos):**
1. Abrir o CSV no Numbers / Excel / Google Sheets
2. Para cada linha, copiar `text` e colar no agendador do Metricool com a data/hora indicadas
3. Anexar o vídeo de `renders/trinta-manhas/` pelo nome em `media`

### Regenerar o CSV

Para alterar copy, horários, ou adicionar plataformas, editar `tools/contos-mensais/generate-metricool-csv.py` e correr:

```bash
python3 tools/contos-mensais/generate-metricool-csv.py
```

### Métrica de sucesso

Sem objetivo de conversão. Sinais a vigiar (Plausible / Instagram Insights / TikTok Analytics):

- **% de followers que vê >5 capítulos** (retenção da série)
- **Save rate** (sinal de literatura)
- **Comentários narrativos** (quem comenta com versos próprios)
- **Tráfego direto a seteveus.space em Junho vs Maio**

Se >30% dos followers virem >10 capítulos, replicar a fórmula para Julho.

## Próximos meses (esboço)

- **Julho 2026 · "Trinta Noites"** — espelho de Junho. Mesma protagonista, mesmas horas, vista pelas noites.
- **Agosto 2026 · "Trinta Janelas"** — outras pessoas vistas das janelas. Sai do "eu" para o "outros".
- **Setembro 2026 · "Trinta Cartas"** — formato epistolar. Cada capítulo é uma carta curta.

Cada mês mantém:
- 30 capítulos / 30 dias
- 1 véu por dia da semana em rotação
- Mesmo template visual e sonoro
- Hashtag-série única por mês
- Link único: `seteveus.space`
