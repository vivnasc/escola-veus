# Pipeline VC Sabia + Hoje, em Mim — para replicar noutro repo

Mapa completo das duas produções "irmãs" (manhã radiante + noite contemplativa). Cada uma tem ~120 frases, biblioteca de prompts MJ, calendário de 6 meses, render via GitHub Actions, e import direto no Metricool.

---

## 1. Storage Supabase (course-assets bucket)

**URL base:** `https://tdytdamtfillqyklgrmb.supabase.co`

| Path | Conteúdo | Acesso |
|---|---|---|
| `vc-sabia-motions/` | MP4s 9:16 (manhãs) | público |
| `vc-sabia-audios/<mood>/` | MP3s por mood (`birds_dawn`, `stream`, `wind`, `rain`, `silence`) | público |
| `vc-sabia-renders/` | MP4 finais por dia | público |
| `vc-sabia-batches/<batchId>.json` | metadados do batch (jobs, frases, motions) | público |
| `vc-sabia-meta/motion-tags.json` | `{ tags: {name→mood}, categories: {name→categoria} }` | público |
| `vc-sabia-meta/active-audios.json` | mood → URL áudio activo | público |
| `vc-sabia-meta/design-settings.json` | overlay design global | público |
| `vc-sabia-meta/phrases-overrides.json` | overrides do seed em runtime | público |
| `hoje-em-mim-motions/<id>.mp4` | MP4s 9:16 (noites) | público |
| `hoje-em-mim-audios/<mood>/` | MP3s 12s por mood noturno (10 moods) | público |
| `hoje-em-mim-renders/<day>/<file>.mp4` | MP4 finais por dia | público |
| `render-jobs/<jobId>.json` | manifest de cada render | público |
| `render-jobs/<jobId>-result.json` | status + progresso | público |

**URLs públicas** seguem `https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/course-assets/<path>`

---

## 2. Arquitectura comum às duas produções

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js admin (/admin/producao/{vc-sabia|hoje-em-mim})    │
│  ─ tabs: Bulk · Preview · Frases · Motions · Áudios ·       │
│         Prompts MJ · Design                                  │
└─────────────────────────────────────────────────────────────┘
            │ POST /api/admin/<prod>/bulk-month/preview
            │ devolve plano dia-a-dia (frase + motion + áudio)
            ▼
┌─────────────────────────────────────────────────────────────┐
│  Picker server-side                                          │
│  1. Carrega seed phrases + history + motion-tags (categorias) │
│  2. Para cada dia: keyword-match frase → categoria visual    │
│  3. Pool de motions: shuffled + family-spaced + unused-first │
│  4. Frases: avoid pool (seed+history) + dedup normalizado    │
└─────────────────────────────────────────────────────────────┘
            │ POST /api/admin/<prod>/render-submit
            │ grava manifest por dia + batch metadata
            ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions workflow (render-<prod>.yml)                 │
│  ─ chama tools/render-<prod>/render.mjs                      │
│  ─ download motion + audio + compõe overlay PNG              │
│  ─ ffmpeg combina + upload MP4 final para Supabase           │
│  ─ actualiza <jobId>-result.json (queued→running→done)       │
└─────────────────────────────────────────────────────────────┘
            │ POST /api/admin/<prod>/bulk-package
            ▼
┌─────────────────────────────────────────────────────────────┐
│  ZIP final: mp4/seg.mp4 ... mp4/dom.mp4 + metricool.csv     │
│  + whatsapp-status.txt (vc-sabia)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura de ficheiros para replicar

### Por produção (substituir `vc-sabia` por `hoje-em-mim` conforme):

```
escola-veus-app/src/
├── data/
│   ├── vc-sabia-frases.seed.json      # ~117 frases padrão "Sabias que..."
│   ├── vc-sabia-motions.seed.json     # 28 categorias × 8 variantes (= 224 prompts MJ)
│   ├── hoje-em-mim-frases.seed.json   # 7 frases/dia da semana + especiais
│   └── hoje-em-mim-mj-prompts.ts      # 30 categorias × 6 variantes (= 180 prompts MJ)
│
├── lib/vc-sabia/
│   ├── phrases.ts                  # loadMergedFrases (seed + Supabase overrides)
│   ├── dedupe.ts                   # normalizePhraseForDedup, buildAvoidSet
│   ├── parse-claude-json.ts        # parser robusto (code fences, trailing commas)
│   ├── calendar.ts                 # markers + tema preferences
│   ├── audio.ts                    # MORNING_MOODS (birds_dawn, stream, wind, rain, silence)
│   ├── captions.ts                 # IG + TikTok captions com hashtags Moçambique
│   ├── design.ts                   # VcSabiaDesign type (fontSize, cardY, colors)
│   ├── midjourney.ts               # buildMjPrompt(theme, mood, variant)
│   ├── motions-library.ts          # CATEGORIES + buildMotionPrompt + dailyRotation
│   ├── phrase-motion-match.ts      # matchCategoryForPhrase (keyword + tema fallback)
│   ├── pairing.ts                  # planMotionSequence (seeded shuffle + family spacing)
│   ├── usage-history.ts            # loadUsageHistory (todos os batches passados)
│   └── metricool-csv.ts            # CSV exporter (formato Metricool)
│
├── lib/hoje-em-mim/                # paralelo, com:
│   ├── themes.ts                   # 6 paletas overlay (cobre/indigo noturno)
│   └── ... (mesma estrutura)
│
├── app/api/admin/vc-sabia/
│   ├── bulk-month/preview/route.ts # gera plano com keyword match + shuffle
│   ├── bulk-month/route.ts         # submete batch
│   ├── render-submit/route.ts      # cria manifests + dispatch GH Actions
│   ├── render-update/route.ts      # swap motion / editar texto / fonte / cardY
│   ├── render-retry/route.ts       # re-dispatch sem alterações
│   ├── render-cancel/route.ts      # cancela workflow
│   ├── render-status/route.ts      # poll do result.json
│   ├── bulk-status/route.ts        # status agregado do batch
│   ├── bulk-package/route.ts       # ZIP final + CSV
│   ├── bulk-list/route.ts          # batches passados
│   ├── bulk-delete/route.ts        # apaga batch + assets
│   ├── motions/route.ts            # lista motions sorted DESC
│   ├── motions/signed-url/route.ts # upload directo Supabase (até 50MB)
│   ├── motions/auto-tag/route.ts   # Claude vision → mood + categoria visual
│   ├── motion-tags/route.ts        # GET/POST motion-tags.json
│   ├── phrase/generate/route.ts    # Claude → 1 frase nova (dedup + retry)
│   ├── phrase/batch-generate/route.ts # Claude → N frases com calendário context
│   ├── phrases/route.ts            # GET/POST phrases-overrides.json
│   ├── audios/route.ts             # lista áudios por mood
│   ├── audio/generate/route.ts     # ElevenLabs SFX → upload Supabase
│   ├── active-audios/route.ts      # mood → URL activo
│   ├── design-settings/route.ts    # GET/POST design global
│   └── usage-history/route.ts      # frases + motions usados em batches
│
└── components/vc-sabia/
    ├── BulkMonthPanel.tsx          # painel produção mensal (5000+ linhas)
    ├── PreviewPanel.tsx            # tabs + variantes A/B/C
    ├── MotionLibrary.tsx           # grid de motions + auto-tag + upload XHR
    ├── AudioLibrary.tsx            # áudios por mood + active picker
    ├── PhrasesPanel.tsx            # rever/editar/adicionar frases ao seed
    ├── PromptsLibrary.tsx          # browse 224 prompts MJ + calendário
    ├── DesignSettingsPanel.tsx     # editor de design global
    └── ManualDownloadPanel.tsx     # download manual fora do plano
```

### Tools (renderer + scripts standalone):

```
tools/
├── render-vc-sabia/
│   ├── render.mjs                  # FFmpeg + canvas overlay PNG
│   └── package.json
├── render-hoje-em-mim/
│   └── (paralelo)
├── vc-sabia/
│   ├── generate-metricool-csv.py   # CSV import
│   └── generate-motions-library.py # MOTIONS-LIBRARY.md + CALENDARIO-IMAGENS-6MESES.md
└── hoje-em-mim/
    └── (paralelo)
```

### GitHub Actions:

```
.github/workflows/
├── render-vc-sabia.yml             # trigger: workflow_dispatch + jobId input
└── render-hoje-em-mim.yml
```

---

## 4. Padrões fundamentais

### Frases (seed)
Cada frase no padrão **"`<Imagem natureza>`. Tu também (sabes). Confia `<prep>` `<algo interior>`."**

Exemplo VC Sabia (manhã): `"O lótus nasce na lama e não se suja. Tu também. Confia na tua pureza."`
Exemplo Hoje em Mim (noite): `"Hoje, o que me sustenta é o silêncio das paredes."`

**Proibido em VC Sabia:** imperativos ("Trata-te", "Procura", "Hoje, faz...") porque não conjugam com "Sabias que..."

### Categorias visuais (motions-seed)
```json
{
  "name": "Lótus na água",
  "tema": "autoamor",
  "mood": "silence",
  "atmosphere": "purity rising through what holds us",
  "subjects": ["8 prompts MJ específicos"],
  "keywords": ["lotus", "lirio-de-agua", "nenufar"]
}
```

### Matching frase → motion (server)
1. **Keyword match:** primeira categoria cuja `keyword` aparece no texto da frase
2. **Tema fallback:** categoria com mesmo `tema` da frase, menos usada
3. **Último recurso:** primeira categoria

### Motion picker (server)
1. Carrega motions sorted `created_at DESC`
2. Split em **não-usados** + já-usados
3. Cada grupo **shuffled** (Fisher-Yates determinista, `seed = year*100+month`)
4. Para cada dia: tenta motion com categoria igual à da frase → fallback pool geral
5. **Family spacing:** evita mesma família de motion em dias adjacentes (extrai prefixo do filename)

### Avoid pool (frase generator)
- Seed completo (todas as frases já escritas)
- Textos de batches passados (`phraseText` em todos os jobs)
- Frases extras do cliente
- Normalização: NFD + lowercase + strip pontuação/acentos
- Auto-retry até 3× se Claude devolver duplicados

### Auto-tag motions (Claude vision)
1. Browser extrai 1.º frame de cada motion via canvas
2. POST batch para `/motions/auto-tag` → Claude classifica:
   - **mood** (birds_dawn / stream / wind / rain / silence)
   - **categoria visual** (uma das 28/30)
3. Server grava em `motion-tags.json`
4. Salta motions já classificados (não gasta créditos)

### Captions
- **IG:** "Sabias que..." + frase + assinatura + 11 hashtags base (Moçambique/Maputo)
- **TikTok:** mesma + `#fyp #foryou` (sem o `シ` japonês)
- **WhatsApp Status:** mensagem curta sem hashtags

### Hashtags VC Sabia (manhã)
`#viviannedossantos #seteveus #escoladosveus #manhãs #despertar #consciencia #espiritualidade #moçambique #maputo`

### Design overlay
- Card "vidro fosco transparente" + moldura dourada + cantos
- Tipografia: Cormorant Garamond italic (frase) + Inter caps (kicker)
- Override per-job: `manifest.design = { phraseSize, kickerSize, cardY }`

---

## 5. Variáveis de ambiente necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=https://<projecto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<chave-secreta>
ANTHROPIC_API_KEY=<sk-ant-...>
ELEVENLABS_API_KEY=<chave>                # áudios SFX
GITHUB_REPO_OWNER=<owner>
GITHUB_REPO_NAME=<repo>
GITHUB_DISPATCH_TOKEN=<pat-com-actions:write>
GITHUB_DISPATCH_REF=main
```

---

## 6. Diferenças VC Sabia × Hoje, em Mim

| Aspecto | VC Sabia (manhã) | Hoje, em Mim (noite) |
|---|---|---|
| **Tom** | Radiante, esperançoso | Contemplativo, íntimo |
| **Paleta** | Cream + gold + honey | Cobre + indigo + cream |
| **Categorias visuais** | 28 × 8 = 224 prompts | 30 × 6 = 180 prompts |
| **Moods áudio** | 5 (birds_dawn, stream, wind, rain, silence) | 10 (grilos, lareira, chuva, lua, coruja, tigela…) |
| **Frases padrão** | "Sabias que… `<natureza>`. Tu também. Confia…" | 7 weekday rituals (olha hoje, agradeço, solto, aprendi, celebro, corpo, escolho) |
| **Especiais** | Markers de calendário (abertura, encerramento, solstícios) | `fim_mes`, `inicio_mes`, `fim_ano`, `inicio_ano` |
| **Horário** | 10:00 IG / 10:30 TikTok (Maputo) | Noite |
| **Render engine** | FFmpeg + canvas | FFmpeg + SVG overlay |

---

## 7. Docs gerados (output dos scripts)

### VC Sabia
- `docs/vc-sabia/CALENDARIO-IMAGENS-6MESES.md` — 184 dias (Jul-Dez 2026) com frase + prompt MJ por dia
- `docs/vc-sabia/MOTIONS-LIBRARY.md` — 224 prompts agrupados por 28 categorias
- `docs/vc-sabia/VC-SABIA-METRICOOL.csv` — 234 linhas (117 × IG+TikTok) prontas a importar

### Hoje, em Mim
- `docs/hoje-em-mim/CALENDARIO-IMAGENS-6MESES.md` — 180 dias
- `docs/hoje-em-mim/JUNHO-2026-PROMPTS.md` — 30 prompts MJ inéditos para Junho

---

## 8. Para replicar noutro repo

1. **Setup Supabase:**
   - Bucket `course-assets` público
   - Pastas para motions, audios, renders, meta, batches

2. **Copiar estrutura:**
   - `escola-veus-app/src/{data,lib,components,app/api/admin}/<producao>/`
   - `tools/render-<producao>/`, `tools/<producao>/`
   - `.github/workflows/render-<producao>.yml`

3. **Adaptar seeds:**
   - `<producao>-frases.seed.json` — frases na voz da produção
   - `<producao>-motions.seed.json` — 25-30 categorias × 6-8 variantes
   - `lib/<producao>/audio.ts` — moods próprios

4. **Trocar referências:**
   - URLs Supabase + IDs nas variáveis env
   - Owner/repo no dispatch GitHub
   - Hashtags base (mercado local)

5. **Workflow render:**
   - `tools/render-<producao>/render.mjs` faz a composição
   - Lê manifest de `course-assets/render-jobs/<jobId>.json`
   - Escreve resultado em `course-assets/<producao>-renders/`

6. **Tabs admin:** Bulk · Preview · Frases · Motions · Áudios · Prompts MJ · Design (componentes paralelos)

---

## 9. Pipeline mínimo (sem render automático)

Se só precisas das frases + prompts (sem o pipeline FFmpeg completo):

```
1. Seed frases JSON           (já tens padrão "Sabias que...")
2. Seed motions/categorias JSON (já tens 28 × 8)
3. tools/<prod>/generate-motions-library.py
   → docs/<prod>/MOTIONS-LIBRARY.md + CALENDARIO-IMAGENS-6MESES.md
4. tools/<prod>/generate-metricool-csv.py
   → docs/<prod>/<PROD>-METRICOOL.csv
5. Importas o CSV no Metricool, anexas vídeos manualmente
```

Os 200 prompts MJ ficam num doc markdown que copias 1 por dia para o Midjourney.
