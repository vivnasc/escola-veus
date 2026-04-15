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
| **Imagens contemplativas** | Flux + LoRA `veus_figure` | ❌ por gerar em batch |
| **Música ambiente a condizer** | Suno API (instrumental) | ❌ por gerar |
| **Texto em formas aleatórias** | Highlight overlay (só em momentos-chave, não o script todo) | ❌ por definir visualmente |
| Legendas (accessibility) | Whisper ou manual | ❌ |
| Thumbnail | Flux + texto | ❌ |
| Título/descrição YouTube (SEO) | Manual ou GPT | ❌ |
| Tags YouTube | Manual | ❌ |

**Pipeline técnico necessário:**

1. Para cada hook, identificar 2-4 "momentos-destaque" do script (as frases que ficam).
2. Gerar 4-8 imagens contemplativas (Flux + LoRA) cobrindo a duração do áudio.
3. Gerar uma faixa Suno instrumental com tom a condizer (lento, meditativo, acústico).
4. Gerar prompts Runway (10s cada) para animação subtil das imagens — Vivianne processa **fora do app** em runway.app.
5. Gerar ficheiro que o **CapCut** consiga importar, com:
   - Timeline de áudio + imagens/clips animados + música
   - Markers nos momentos-destaque para ela colocar texto em formas aleatórias
6. Ela abre no CapCut, ajusta, exporta, publica no YouTube.

### 3.2. Vídeos das Aulas (curso — 168 aulas, em crescimento)

**Formato:** Mais simples que YouTube. Slides estáticos com música ambiente. Produto pago para alunas.

**Componentes:**

| Componente | Fonte | Estado |
|---|---|---|
| Áudio narração | ElevenLabs | 🟡 em curso |
| **Slides (imagens estáticas)** | Flux + LoRA, 2-4 por aula | ❌ |
| **Música ambiente** | Suno (ou Loranne) — 1 faixa por módulo | ❌ |
| Legendas opcionais | SRT | ❌ |
| Sem highlights de texto | (diferente de YouTube) | — |

**Pipeline:** mais leve que YouTube. Apenas slides + áudio + música de fundo. Sem Runway, sem animação.

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

### 4.4. Export para CapCut

CapCut aceita:
- `.xml` (Final Cut Pro XML) — melhor opção
- Ou estrutura de pastas com markdown/json a guiar ela manualmente

**Proposta:** gerar um ZIP por vídeo com:
```
hook-01/
  audio.mp3
  musica.mp3
  imagens/
    scene-01.png, scene-02.png, ...
  clips-runway/        (ela põe aqui depois de processar no Runway)
  markers.json         (timestamps dos highlights com texto)
  README.md            (instruções de montagem no CapCut)
```

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

### Sprint 2 — Primeiro vídeo YouTube completo (1 semana)
1. Escolher 1 hook Nomear para piloto.
2. Gerar 4-6 imagens Flux + LoRA (prompts do app).
3. Gerar 1 faixa Suno (ou escolher da Loranne).
4. Gerar prompts Runway, processar no runway.app (5 clips × 10s = 50 créditos).
5. Exportar pacote para CapCut.
6. Vivianne monta no CapCut com os highlights de texto.
7. Publicar. Medir resposta.

### Sprint 3 — Pipeline escalável (2 semanas)
1. Construir `/admin/video-pipeline` (página unificadora).
2. Automatizar geração de imagens + música em batch.
3. Automatizar export para CapCut.
4. Testar em 5 hooks de uma vez.

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
