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

**Formato:** Vídeo contemplativo curto (60-90s), publicação ~2× semana.

**Componentes:**

| Componente | Fonte | Estado |
|---|---|---|
| Áudio narração | ElevenLabs (via `/admin/audio-bulk`) | 🟡 em curso |
| **Clips de vídeo contemplativos** | Runway Gen-4 **text-to-video** — Vivianne processa no runway.app, app só gera os prompts | ❌ |
| **Música ambiente a condizer** | Suno API (instrumental) | ❌ por gerar |
| **Texto em formas aleatórias** | Highlight overlay (só em momentos-chave, não o script todo) | ❌ por definir visualmente |
| Legendas (accessibility) | Whisper ou manual | ❌ |
| Thumbnail | Frame do Runway + texto | ❌ |
| Título/descrição YouTube (SEO) | Manual ou GPT | ❌ |
| Tags YouTube | Manual | ❌ |

**NÃO se geram imagens.** Runway faz text-to-video directo. O LoRA `veus_figure` fica só para thumbnails estáticas (se for preciso) e para continuidade de identidade se a Vivianne decidir depois usar image-to-video em casos específicos.

**Pipeline técnico necessário:**

1. Para cada hook/script, o app gera uma **lista de prompts Runway text-to-video** — um por clip de 10s, cobrindo a duração do áudio (60-90s = 6-9 clips).
2. Cada prompt é afinado ao tom nomeador: contemplativo, feminino, sem rosto visível, luz dourada suave, movimento lento. Mantém coerência visual com o LoRA/estética da escola (ver `IDENTIDADE-VISUAL-VIDEOS.md`).
3. Vivianne copia cada prompt, cola no runway.app, processa, descarrega os MP4s.
4. Vivianne carrega os MP4s de volta no editor interno do app.
5. App gera também uma faixa Suno instrumental com tom a condizer.
6. Para cada hook, identificar 2-4 "momentos-destaque" do script (frases que ficam).
7. **Editar tudo no editor interno do app** (ver secção 4.4) — áudio + clips Runway + música + texto overlay nos destaques.
8. Renderizar o vídeo final **dentro do app** e publicar directamente no YouTube.

### 3.2. Vídeos das Aulas (curso — 168 aulas, em crescimento)

**Formato:** Mais simples que YouTube. Visual contemplativo + música ambiente. Produto pago para alunas.

**Componentes:**

| Componente | Fonte | Estado |
|---|---|---|
| Áudio narração | ElevenLabs | 🟡 em curso |
| **Clips de vídeo curtos** | Runway text-to-video (2-3 clips por aula, em loop/fade) OU 1 clip longo contemplativo | ❌ |
| **Música ambiente** | Suno (ou Loranne) — 1 faixa por módulo | ❌ |
| Legendas opcionais | SRT | ❌ |
| Sem highlights de texto | (diferente de YouTube) | — |

**Pipeline:** mais leve que YouTube. Áudio + 2-3 clips Runway suaves + música de fundo. Sem texto overlay. Sem cortes bruscos.

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

### Conteúdo auxiliar dos cursos (alunas pagantes)

- ❌ **Manuais PDF** por curso (1/20 feito — Ouro Próprio draft)
- ❌ **Cadernos de exercícios** por módulo (8/160 feitos — Ouro Próprio draft)
- ❌ **Guias de acompanhamento** semanais
- ❌ **Check-ins** por aula (perguntas para a aluna responder)

### Marketing / captação

- ❌ **Thumbnails** dos vídeos YouTube (cada hook precisa)
- ❌ **Títulos + descrições SEO** para YouTube
- ❌ **Tags YouTube** por vídeo
- ❌ **Emails automáticos** para subscritoras (Sequence: welcome → primeiro curso grátis → upgrade)
- ❌ **Posts Instagram** derivados dos scripts Nomear
- ❌ **Landing pages** por curso
- ❌ **Testemunhos** de alunas

### Monetização

- ❌ **Stripe** ou outro gateway — como recebem as subscrições?
- ❌ **Preços** definidos por curso e por plano (mensal/anual)
- ❌ **Cupons/códigos promocionais**
- ❌ **Upsell** (depois de YouTube → curso pago)

### Legal / técnico

- ❌ **Direitos autorais** — confirmar licença comercial Suno (se der problema, usar Loranne ou biblioteca própria)
- ❌ **Termos e condições** + política de privacidade
- ❌ **RGPD** — consentimento, armazenamento de dados
- ❌ **Backup automático** Supabase (ter cópia dos áudios num segundo storage)
- ❌ **Domínio e SSL** em todos os subdomínios

### Qualidade

- ❌ **Ouvir amostra** de áudio de cada curso antes de publicar (minutos de investimento, horas de vergonha poupadas)
- ❌ **Testar fluxo** de aluna nova, do YouTube à conclusão do primeiro módulo

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
