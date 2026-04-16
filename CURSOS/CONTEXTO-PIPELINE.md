# Escola dos Véus — Contexto e Pipeline Completo

**Última actualização:** 2026-04-15
**Actualizado por:** Claude Code

> Este ficheiro é o mapa completo do projecto: o que está feito, o que falta, e como tudo se liga.
> Ler no início de cada sessão nova, junto com `PRODUCAO-STATUS.md`.

---

## 1. O que é a Escola dos Véus

Plataforma de 20 cursos online em português europeu para mulheres, sobre auto-conhecimento.

Três domínios:
- `escola.seteveus.space` — Escola (20 cursos, módulos, cadernos)
- `seteveus.space` — Site principal + livro interactivo "Os 7 Véus do Despertar"
- `music.seteveus.space` — Música original da Loranne (1200+ faixas)

**Público:** mulheres adultas, pt-PT.
**Tom:** nomeador (contemplativo, acolhedor, reconhecedor — NUNCA didáctico, NUNCA coach, NUNCA espiritual).

---

## 2. O que já está feito (Abril 2026)

### Conteúdo escrito
- ✅ **122 scripts YouTube Nomear** (24 séries) — `nomear-scripts.ts`
- ✅ **7 cursos completos** (168 aulas) — revistos por subagente + fixes aplicados:
  1. Ouro Próprio
  2. Limite Sagrado
  3. Sangue e Seda
  4. O Silêncio que Grita
  5. Pele Nua
  6. A Fome
  7. A Chama

### Tecnologia
- ✅ **Bulk audio system** (`/admin/audio-bulk`) — gera áudios ElevenLabs em massa, upload Supabase, sync para evitar regenerar
- ✅ **LoRA treinado** (trigger `veus_figure`) — identidade visual consistente
- ✅ **Admin completo** — produção de vídeos, LoRA, alunas, conteúdo, analytics
- ✅ **APIs** — todas prontas (áudio, imagem, animação, legendas, música, render)
- ✅ **Identidade visual** — Conceito A: O Véu e o Corpo (`IDENTIDADE-VISUAL-VIDEOS.md`)

### Áudios (em curso)
- 🟡 Geração em massa — ~112/290 áudios gerados no Supabase
- Voz actual: `UnchUh06d8TYP17TuqgU` (criada pela Vivianne, pt-PT com africano)
- Pasta Supabase: `course-assets/<curso-slug>/` e `course-assets/youtube/`

---

## 3. Pipelines de Vídeo — REFERÊNCIA DEFINITIVA

**O documento definitivo dos pipelines está em:**
`/ESCOLA-VEUS-VIDEO-PIPELINE REVISTO.md` (raiz do repo, branch main)

**LER ESSE FICHEIRO ANTES DE TOCAR EM QUALQUER COISA DE VÍDEO.**

Resumo ultra-curto (ler o doc completo para detalhes):

### Pipeline 1 — Cursos (Slides + Suno)

- Input: scripts Markdown → parser → slides.json → review → render
- Visual: **editorial escuro** (`#0d0d0d`, creme `#f0ece6`, coral `#E94560`, roxo `#533483`)
- Tipografia: **DM Serif Display** (títulos) + **Nunito** (corpo)
- **SEM voz** no vídeo — só slides animados + música Suno contemplativa
- **SEM silhuetas, SEM territórios, SEM LoRA, SEM Flux**
- Transições: fade to black (0.5s)
- Stack: Node.js + Puppeteer + FFmpeg (CLI local, sem APIs externas)
- CLI: `escola-veus curso parse/preview/render`

### Pipeline 2 — YouTube / Funil (Runway + Texto + Suno)

- Input: clips Runway (gerados manualmente no app) + script markdown com `@cena` + timings
- Texto overlay: **contemplativo flutuante** (fade/rise/typewriter) — DM Serif Display + Nunito
- Música: Suno (cinematográfico, emocional)
- **SEM voz** — clips + texto + música
- Stack: FFmpeg drawtext (ou HTML+Puppeteer para animações melhores)
- CLI: `escola-veus yt parse/preview/render`

### O que NÃO se usa

- ❌ Silhuetas terracota / territórios visuais / Mundo dos Véus — **abolido**
- ❌ LoRA `veus_figure` — **abolido**
- ❌ Loranne — não nas imagens/vídeos
- ❌ Shotstack / Remotion — substituído por FFmpeg + Puppeteer
- ❌ Editor web interno tipo CapCut — é **CLI**
- ❌ Paleta navy/terracota/dourado — substituída por negro/creme/coral/roxo
- ❌ `VISUAL_GUIDELINES` e `TERRITORY_GUIDES` em `course-guidelines.ts` — **desactualizados, não seguir**

Extraídos dos vídeos grandes ou escritos à parte.

- 15-60s verticais
- Uma frase-destaque forte
- 1-2 imagens contemplativas
- Legenda grande no ecrã
- Call to action: "Curso completo em seteveus.space"

**Estado:** ❌ pipeline por desenhar.

---

## 4. O que falta tecnicamente

### 4.1. CLI `escola-veus` (a construir)

Ferramenta CLI conforme definido em `ESCOLA-VEUS-VIDEO-PIPELINE REVISTO.md`.

**Stack:** Node.js + Puppeteer + FFmpeg (local, sem APIs externas para render).

**Comandos:**
```bash
escola-veus curso parse aula.md       # Script → slides.json
escola-veus curso preview             # Preview HTML
escola-veus curso render slides.json  # Render → MP4
escola-veus yt parse script.md        # Script → timeline.json  
escola-veus yt preview                # Preview HTML
escola-veus yt render timeline.json   # Render → MP4
escola-veus batch curso sangue-e-seda/ # Batch
```

### 4.2. Suno API — fix urgente

- ✅ Suno Pro activo (licença comercial)
- ❌ **Código de integração avariado** (`generate-music/route.ts` retorna 404) — FIX PRIORITÁRIO
- Vivianne já usa a API para gerar músicas da Loranne — o código é que está partido
- Precisa de debuggar endpoints actuais e restabelecer integração

### 4.3. Áudios — gerar os que faltam

~112/290 gerados via `/admin/audio-bulk`. Créditos ElevenLabs a esgotar (um áudio deu `quota_exceeded`).

---

## 5. O que provavelmente esqueceste (lista para decidir)

### Paleta visual actualizada

Paleta do pipeline de vídeo (definida no doc revisto):
- Fundo: `#0d0d0d` (negro quase puro)
- Texto: `#f0ece6` (creme claro)
- Accent 1: `#E94560` (coral)
- Accent 2: `#533483` (roxo)
- Texto secundário: `#6a6460` (cinza quente)
- ❌ **Filtro/LUT** em pós-produção para unificar clips Runway (ligeiro warm tone dourado)

### Hosting das aulas pagas

✅ **Resolvido.** As aulas pagas ficam na Escola dos Véus App (Supabase + auth + monetização já configurados).

### YouTube algorithm essentials

- ❌ **Primeiros 3 segundos** são decisivos — hook visual forte + frase-gancho
- ❌ **End cards** (últimos 20s do vídeo) com links para outros vídeos + subscribe
- ❌ **Cards** durante o vídeo (popups pequenos) para cross-link
- ❌ **Playlist organization** — séries Nomear agrupadas, uma playlist por curso
- ❌ **Pinned comment** em cada vídeo com CTA + link para seteveus.space
- ❌ **Consistent upload schedule** — YouTube favorece 2× semana fixo
- ❌ **Shorts vs long-form** — estratégia diferente; Shorts captam, long-form convertem

### Música / Suno

- ✅ **Suno Pro activo** (licença comercial confirmada)
- ❌ **API Suno avariada no código** (`generate-music/route.ts` retorna 404) — fix prioritário
- ❌ **Volume mix** — música a 10-15% em aulas, 15-25% em hooks YouTube
- ❌ **Ducking automático** — música baixa quando voz fala (opcional mas polido)

### Subtítulos / Legendas

- ❌ **Burned-in** (queimados na imagem) ou `.srt` como CC do YouTube?
- ❌ **Estilo** — font serif escola, dourado, tamanho, posição (ex: terço inferior centrado)
- ❌ **Whisper API** para gerar SRT automaticamente a partir do áudio ElevenLabs
- ❌ **Timing por palavra** (word-level, estilo TikTok moderno) vs por linha

### Thumbnails

- ❌ **Template único** para a escola (frame Runway + barra dourada + texto + logo)
- ❌ **A/B test** dos thumbnails (YouTube Studio permite)
- ❌ **Texto legível em mobile** (tamanho mínimo 80px)
- ❌ **Contraste alto** — cores da escola ajudam

### Monetização

✅ **Já configurado na Escola dos Véus App.** YouTube AdSense NÃO é objectivo.
- ❌ **Afiliados** — programa para alunas que trouxerem outras (futuro)

### Conteúdo auxiliar

- ❌ **Manuais PDF** (1/20 feito)
- ❌ **Cadernos de exercícios** (8/160 feitos)
- ❌ **Check-ins por aula** (questionário curto)
- ❌ **Certificados de conclusão** (PDF gerado auto)

### Comunidade / retenção

- ❌ **Newsletter** — Mailchimp/Substack/ConvertKit
- ❌ **Grupo privado** para alunas — Telegram, Discord, ou comunidade Circle
- ❌ **Sessões ao vivo** mensais — Zoom/YouTube Live
- ❌ **Q&A** em formato de vídeo ou post

### Legal

- ❌ **Termos e condições** + política de privacidade (RGPD)
- ❌ **Política de reembolso** — 14 dias por lei na UE
- ❌ **Copyright** — declarar que tudo é original/licenciado
- ❌ **Disclaimer** — "este material não substitui acompanhamento psicológico/médico"

### Qualidade / teste

- ❌ **Ouvir 1-2 áudios de cada curso** antes de publicar
- ❌ **Testar fluxo aluna nova** de ponta a ponta
- ❌ **Beta test** com 3-5 mulheres antes do lançamento público
- ❌ **Feedback loop** — como recolher opinião das alunas

### Backup / disaster recovery

- ❌ **Backup Supabase** — cópia semanal dos áudios/vídeos num storage alternativo (Cloudflare R2, Backblaze B2)
- ❌ **Backup do código** — já existe via GitHub
- ❌ **Backup dos scripts** — já em git

---

## 6. Ordem sugerida de ataque (prioridade)

### Sprint 1 — Acabar o que está em curso (dias)
1. Terminar geração dos áudios pendentes (Vivianne faz).
2. Ouvir 1-2 áudios de cada curso para confirmar qualidade da voz.
3. Se voz oscila pt-pt/pt-br em algum áudio, regenerar esse.

### Sprint 2 — Primeiro vídeo YouTube completo (1-2 semanas)
1. Construir MVP do editor interno (`/admin/editor/[id]`) — ver 4.4.
2. Escolher 1 hook Nomear para piloto.
3. Gerar 4-6 imagens Flux + LoRA (prompts do app).
4. Gerar 1 faixa Suno (ou escolher da Loranne).
5. Gerar prompts Runway, Vivianne processa no runway.app (5 clips × 10s = 50 créditos), carrega os MP4s de volta para o editor.
6. Vivianne edita no editor interno: timeline, highlights de texto em formas aleatórias, ajustes.
7. Render (Shotstack ou Remotion) → MP4.
8. Download + upload YouTube (manual ou API).

### Sprint 3 — Pipeline escalável (2-3 semanas)
1. Geração em batch de imagens + música Suno para todos os hooks (backend).
2. Pre-popular editor com assets prontos (Vivianne só monta).
3. Biblioteca de shapes para texto overlay (8-12 variações).
4. Templates por tipo de vídeo (YouTube horizontal / Shorts vertical / Aula horizontal).

### Sprint 4 — Aulas dos cursos (vídeos pagos) (2-3 semanas)
1. Pipeline mais simples (só slides + áudio + música ambiente).
2. Template por módulo (8 módulos × 3 sub-aulas).
3. Gerar em batch 168 vídeos.

### Sprint 5 — Escrever os 13 cursos restantes (conforme necessidade)
Só quando houver necessidade editorial — não por pressa. Manter qualidade do registo nomeador.

### Sprint 6 — Marketing + monetização
- Thumbnails
- Landing pages
- Stripe
- Emails automáticos

---

## 7. Checklist rápida para nova sessão Claude Code

```
[ ] Ler PRODUCAO-STATUS.md
[ ] Ler este ficheiro (CONTEXTO-PIPELINE.md)
[ ] Ler IDENTIDADE-VISUAL-VIDEOS.md se vais trabalhar em vídeo
[ ] Verificar branch actual (claude/fix-runway-generation-3rYIF)
[ ] Perguntar à Vivianne o que precisa nesta sessão
[ ] No fim da sessão, actualizar estes MDs + commit + push
```

---

## 8. Contactos / recursos críticos

- **ElevenLabs:** api key no Vercel. Voz `UnchUh06d8TYP17TuqgU`. Créditos a esgotar periodicamente.
- **Supabase:** bucket `course-assets`. Pastas por curso + `youtube/`.
- **Runway:** api.dev.runwayml.com. Gen-4 Turbo. ~$0.50/clip. Vivianne processa externamente.
- **fal.ai:** Flux + LoRA `veus_figure`. Rápido e barato.
- **Suno:** API com problemas (404). Alternativa: URLs externos ou Loranne.
- **Shotstack:** `SHOTSTACK_ENV=v1` falta no Vercel. Substituído pelo fluxo CapCut-local.
- **Vercel:** branch `main` auto-deploy. Previews por PR.

---

**Fim do documento.**
