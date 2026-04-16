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

## 3. O que falta — Pipeline completo por tipo de output

### 3.1. Vídeos YouTube (série Nomear — 122 hooks)

**Formato:** Vídeo contemplativo curto (60-90s), publicação ~2× semana. Horizontal 16:9 + versão Shorts 9:16.

**Estética:** **NATUREZA** (não figuras humanas). Text-to-video funciona bem para natureza — Vivianne já validou com Shorts TikTok.

| Componente | Fonte | Estado |
|---|---|---|
| Áudio narração | ElevenLabs (via `/admin/audio-bulk`) | 🟡 em curso |
| **Clips de natureza** | Runway Gen-4 **text-to-video** (plano ilimitado) — Vivianne processa no runway.app | ❌ |
| **Música ambiente** | Suno API (instrumental) | ❌ por gerar |
| **Texto em formas aleatórias** | Highlight overlay (só nos 2-4 momentos-destaque) | ❌ |
| Legendas | Whisper ou manual | ❌ |
| **Thumbnail** | Frame de Runway (nature) + texto sobreposto | ❌ |
| Título/descrição SEO | Manual ou GPT | ❌ |
| Tags YouTube | Manual | ❌ |
| **Intro/outro bumper** | 2-3s com logo da escola + signature sound | ❌ |

**NÃO se usa LoRA. NÃO se gera figura humana. Só natureza.**

**Pipeline técnico:**

1. Para cada hook, o app gera uma **lista de prompts Runway text-to-video de natureza**, mapeados ao tema do hook.
   - Ex: hook sobre perda → vento em ramos secos, folhas a cair, luz crepuscular
   - Ex: hook sobre raiva → fogo lento, brasas, água a ferver em câmara lenta
   - Ex: hook sobre descanso → água parada, nevoeiro em floresta, nuvens em movimento lento
2. Vivianne cola cada prompt em runway.app, processa, descarrega MP4s, carrega-os no editor interno.
3. App gera faixa Suno a condizer com o mood (ambient, lento, sem bateria).
4. Vivianne marca 2-4 momentos-destaque, escreve texto em formas aleatórias.
5. Render no editor interno → MP4.
6. Publica no YouTube (horizontal) + versão Shorts (vertical, 9:16, corte dos melhores 15-45s).

**Biblioteca de prompts de natureza (a construir):**

Banco de ~30 motivos organizados por mood:
- **Água:** rio lento, gotas em pedra, chuva em janela, mar calmo ao crepúsculo, nevoeiro sobre lago
- **Fogo:** vela a tremer, brasas, fogo lento em madeira, cinzas a voar
- **Vento:** campo de trigo, folhas a girar, bandeira em poste, véus ao vento
- **Luz:** raios entre árvores, amanhecer, luz dourada em parede, reflexos em água
- **Terra:** areia a escorrer, musgo em pedra, raízes, folhas húmidas
- **Céu:** nuvens lentas, chuva a começar, pôr-do-sol, estrelas em time-lapse
- **Flora:** flor a abrir em time-lapse, ramo seco, campo de ervas altas, rosas murchas

Cada hook mapeia para 6-9 destes motivos (um por clip de 10s).

### 3.2. Vídeos das Aulas (curso — 168 aulas)

**Formato:** **Slideshow visual** seguindo o sistema de territórios definido em `course-guidelines.ts`.

**NÃO são fotos stock. NÃO são imagens genéricas.** Cada curso tem um **território visual** (`TERRITORY_GUIDES`) com cor, progressão, silhueta e céu próprios.

**Secções de cada aula** (definidas em `SCRIPT_STRUCTURE`):
1. Abertura (10-15s): céu desce ao território, título creme, sem voz
2. Pergunta inicial (15-30s): gancho emocional
3. Situação humana (120-180s): cenário real reconhecível
4. Revelação do padrão (120-180s): o que está por baixo
5. Gesto de consciência (60-120s): algo concreto e praticável
6. Frase final (15-30s): a frase que fica
7. Fecho (10-15s): território dissolve, logo Sete Véus, silêncio

**Visual:**
- Céu azul-marinho profundo (#1A1A2E) — nunca dia pleno, nunca noite total
- Silhueta terracota (#C4745A) com brilho dourado (#C9A96E) — sem rosto, sem raça, sem idade
- Progressão por módulo: M1-M2 mais escuro → M7-M8 quase amanhecer
- Tipografia: Playfair Display ou Cormorant Garamond, creme (#F5F0E6), fade in/out
- Transições: dissolve lento SEMPRE. Nunca corte seco, nunca wipe, nunca zoom brusco
- Música: ambiente subtil, quase inaudível — textura, não melodia. Silêncio intencional entre secções

| Componente | Fonte | Estado |
|---|---|---|
| Áudio narração | ElevenLabs | 🟡 em curso |
| **Slides do território** | Gerados conforme `TERRITORY_GUIDES` + `VISUAL_GUIDELINES` | ❌ |
| **Música ambiente** | Suno Pro API (instrumental, quase inaudível) | ❌ código API avariado |
| Transições dissolve | Render no editor interno | ❌ |
| Tipografia creme | Overlay animado (fade) | ❌ |

**Hosting:** Na **Escola dos Véus App** — produto pago, auth + monetização já configurados.

### 3.2.1. Suno API — estado actual

- **Plano:** Suno Pro (licença comercial ✅)
- **Uso:** gerar músicas instrumentais + músicas da Loranne
- **Problema:** código de integração API avariado (retornava 404). **Precisa de fix.**
- **Endpoint existente:** `/api/admin/courses/generate-music/route.ts`
- **Acção próxima sessão:** debuggar API Suno, verificar endpoints actuais, restabelecer integração

### 3.3. Shorts (YouTube/Instagram/TikTok)

Extraídos dos vídeos grandes ou escritos à parte.

- 15-60s verticais
- Uma frase-destaque forte
- 1-2 imagens contemplativas
- Legenda grande no ecrã
- Call to action: "Curso completo em seteveus.space"

**Estado:** ❌ pipeline por desenhar.

---

## 4. O que falta tecnicamente

### 4.1. Pipeline unificador (a construir)

Uma página nova, ex: `/admin/video-pipeline`, que:

1. Lista todos os scripts (YouTube + aulas).
2. Para cada um, mostra estado de:
   - Áudio (já existe, via bulk-audio)
   - Imagens (gerar em batch)
   - Música Suno (gerar em batch)
   - Prompts Runway (exportar lista para ela usar externamente)
   - Highlights (ela marca manualmente 2-4 frases por script)
3. Gera ficheiro exportável para CapCut (ver 4.4).

### 4.2. Suno API — geração de música

Já está configurado no projecto (`SUNO_API_KEY`, `SUNO_API_URL`), mas status: "API retorna 404".

**Acção:** verificar endpoint actual Suno. Se continua partido, alternativas:
- Suno externo (copy/paste URL gerado no site da Suno)
- AIVA, Mubert, Soundraw — APIs alternativas
- Biblioteca da Loranne (1200+ faixas em `music.seteveus.space`)

**Prompts Suno por tipo:**
- YouTube contemplativo: "ambient pt-pt feminine, slow piano, acoustic guitar, 60bpm, warm, contemplative, no drums, no vocals"
- Aulas ambiente: "very minimal ambient pad, drone, 40bpm, meditative, imperceptible"

### 4.3. Runway — prompts para processamento externo

Ela processa no runway.app directamente (fora do app).

O app precisa de **gerar os prompts** e apresentá-los numa lista exportável (CSV ou UI para copy/paste), não submeter automaticamente.

**Estrutura do prompt Runway:**
- Imagem base (upload URL)
- Motion prompt: movimento subtil, contemplativo (zoom lento, sopro, luz a mudar)
- Duração: 10s

Já existe `buildMotionPrompt()` no código — reutilizar.

### 4.4. Editor de vídeo interno (o "CapCut" do app)

**Vivianne NÃO usa CapCut nem qualquer editor externo.**
O próprio app tem de ter um editor interno com as funcionalidades que ela precisa.

**Rota proposta:** `/admin/editor/[video-id]`

**Funcionalidades mínimas:**

1. **Timeline multi-pista** (drag & drop)
   - Pista 1: Áudio narração (só uma, vinda do bulk-audio)
   - Pista 2: Música ambiente (Suno — volume reduzido, loop se preciso)
   - Pista 3: Imagens/Clips vídeo (Flux estático + clips Runway carregados pela Vivianne)
   - Pista 4: Texto overlay (só nos momentos-destaque; formas aleatórias animadas)
   - Pista 5: Legendas (opcional)

2. **Controles por clip**
   - Duração, trim (in/out)
   - Transições simples (cross-fade, fade-in/out)
   - Posição X/Y, escala, rotação (para o texto em formas)
   - Volume por pista
   - Key-frames básicos (zoom lento numa imagem, por exemplo)

3. **Highlights de texto (ESPECIAL da escola)**
   - A Vivianne marca 2-4 momentos no áudio onde aparece texto.
   - O texto aparece em forma aleatória (círculo, blob orgânico, rectângulo solto, linha manuscrita).
   - Animação: fade-in, staywag 2-3s, fade-out.
   - Tipografia: serif Escola (Cormorant ou similar).
   - Cor: dourado (#D4A853) ou creme sobre fundo escuro.
   - **Esta é a assinatura visual da escola.** Desenvolver biblioteca de ~8-12 shapes aleatórios.

4. **Preview em tempo real**
   - Player HTML5 que mostra a composição actual.
   - Scrub pela timeline.
   - Zoom da timeline (para edição fina de timing).

5. **Renderização**
   - Backend: Shotstack API (já configurado, falta `SHOTSTACK_ENV=v1` no Vercel).
   - Ou: FFmpeg via servidor próprio (Vercel Functions com limites, ou VPS externo).
   - Ou: Remotion (React-based, render no browser ou Lambda).
   - Output: MP4 1920×1080 (horizontal YouTube) ou 1080×1920 (vertical Shorts).

6. **Publicação directa YouTube** (opcional futuro)
   - YouTube Data API — upload + metadata.
   - Se não der, download do MP4 e upload manual.

**Stack técnica sugerida:**

- Frontend do editor: **Remotion** (https://remotion.dev) — React-based, timeline, preview em browser, render no servidor.
  Alternativa: **Editly**, **Motion Canvas**, ou timeline custom com Canvas API.
- Backend render: **Shotstack** (cloud, $) ou **Remotion Lambda** (AWS, $) ou **FFmpeg self-hosted**.
- State: Zustand ou Redux para o estado da timeline.
- Storage: Supabase (já existe) para guardar projectos (JSON) + assets.

**Modelo de dados (simplificado):**

```typescript
type VideoProject = {
  id: string;
  scriptId: string;              // "a-chama-m1a" ou "nomear-serie-1-hook-1"
  format: "youtube-horizontal" | "shorts-vertical" | "aula-horizontal";
  tracks: {
    audio: { url: string; start: number; end: number }[];
    music: { url: string; start: number; end: number; volume: number }[];
    visual: { url: string; type: "image" | "video"; start: number; duration: number; effects: Effect[] }[];
    text: { content: string; shape: "circle" | "blob" | "rect" | "line"; start: number; duration: number; pos: {x,y}; animation: string }[];
    subtitles?: { srtUrl: string }[];
  };
  duration: number;
  renderStatus: "draft" | "rendering" | "ready" | "error";
  renderUrl?: string;
};
```

**Primeiro MVP do editor (ordem):**

1. Página que lista os scripts (prontos vs por editar).
2. Clicar num script → abre o editor com timeline pré-preenchida:
   - Áudio já do bulk-audio
   - Música placeholder (ela clica "Gerar música Suno")
   - Imagens placeholder (ela clica "Gerar imagens Flux" — 4-6 auto)
   - Sem texto overlay inicial
3. Ela arrasta, ajusta durações, marca os destaques, escreve o texto, escolhe a forma.
4. "Pré-visualizar" → preview HTML5.
5. "Renderizar" → Shotstack/Remotion → MP4.
6. "Descarregar" ou "Publicar no YouTube".

### 4.5. Áudios — gerar os que faltam

Vivianne está a gerar manualmente via `/admin/audio-bulk`. ~112/290 gerados.

**Alertas detectados nos screenshots:**
- Um áudio deu erro `quota_exceeded` (créditos ElevenLabs a esgotar).

**Acções:**
- Terminar geração dos pendentes enquanto há créditos.
- Depois dos créditos expirarem: recarregar conta quando fizer sentido, ou contratar plano maior.

---

## 5. O que provavelmente esqueceste (lista para decidir)

### Assinatura visual consistente (SEM LoRA)

Sem LoRA e sem Flux, a identidade visual tem de vir de:
- ❌ **Paleta de cor fixa** em TODOS os overlays/thumbnails (navy `#1A1A2E`, dourado `#D4A853`, terracota `#C4745A`, creme)
- ❌ **Tipografia única** (serif Cormorant ou similar — já definida em `IDENTIDADE-VISUAL-VIDEOS.md`)
- ❌ **Intro/outro bumper** de 2-3s com logo "Escola dos Véus" + signature sound (repetido em todos os vídeos)
- ❌ **Biblioteca de 8-12 shapes aleatórios** para texto overlay (círculo, blob, linha manuscrita, rectângulo solto) — assinatura única da escola
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
