# Roadmap — Pipeline de Vídeo YouTube (Escola dos Véus)

**Objectivo:** Criar uma máquina self-service para gerar vídeos YouTube sem depender de programador.

**Resultado final:** Vivianne abre o admin, escolhe tema, clica gerar, sai vídeo pronto.

---

## O QUE JÁ EXISTE

| # | Componente | Estado | Onde |
|---|-----------|--------|------|
| 1 | 83 prompts de natureza (África/Moçambique) | ✅ Pronto | `src/data/thinkdiffusion-prompts.json` |
| 2 | 50 vídeos planeados com categorias | ✅ Pronto | `src/data/video-plan.json` |
| 3 | 100 faixas de música (ancient-ground) | ✅ Pronto | Supabase `audios/albums/ancient-ground/` |
| 4 | API proxy ThinkDiffusion | ✅ Pronto | `/api/admin/thinkdiffusion/generate` |
| 5 | API salvar imagem Supabase | ✅ Pronto | `/api/admin/thinkdiffusion/save-image` |
| 6 | API batch Runway (imagem→clip) | ✅ Pronto | `/api/admin/youtube/generate-clips` |
| 7 | API render Shotstack (clips+música→MP4) | ✅ Pronto | `/api/admin/youtube/render` |
| 8 | Página ThinkDiffusion (gerar imagens) | ⚠️ 80% | `/admin/thinkdiffusion` |
| 9 | Página Montagem (juntar clips+música) | ⚠️ 80% | `/admin/youtube-montagem` |
| 10 | Página listar música | ✅ Pronto | `/api/admin/music/list-album` |

---

## O QUE FALTA (por ordem)

### FASE 1 — Biblioteca de Imagens (PRIORIDADE MÁXIMA)

**Objectivo:** Gerar e organizar centenas de imagens por tema no Supabase.

| Passo | O que | Detalhe |
|-------|-------|---------|
| 1.1 | Definir temas finais | 12 temas natureza + novos temas cursos (globais, sem pessoas) |
| 1.2 | Expandir prompts | Dos 83 actuais para ~150 (natureza + cursos) |
| 1.3 | Testar página ThinkDiffusion | Ligar ao ThinkDiffusion, gerar 1 imagem de teste |
| 1.4 | Gerar biblioteca completa | ~1500 imagens (150 prompts × 10 variações) |
| 1.5 | Organizar no Supabase | Pastas por tema: `youtube/images/mar/`, `youtube/images/espelho/`, etc. |

**Temas das imagens (2 colecções):**

COLECÇÃO A — Natureza (África/Moçambique):
- mar, praia, rio, ceu, chuva, savana, flora, nevoeiro, fogo, terra, noite, caminho

COLECÇÃO B — Cursos (global, sem pessoas, abstracto):
- espelho (reflexo, identidade)
- porta (fronteiras, limites, passagens)
- agua (fluxo, emoção, ciclos)
- luz (despertar, esperança, clareza)
- tecido (corpo, cobertura, revelação)
- objecto (velas, livros, chaves, correntes)
- tempo (relógios, estações, fases)
- raiz (herança, família, profundidade)
- fragmento (vidro partido, mosaico, peças)
- vazio (espaços vazios, cadeiras, quartos)

**Resultado:** ~1500 imagens no Supabase, organizadas, reutilizáveis para sempre.

---

### FASE 2 — Clips Runway

**Objectivo:** Transformar imagens em clips de vídeo via API.

| Passo | O que | Detalhe |
|-------|-------|---------|
| 2.1 | Escolher imagens (por tema/vídeo) | Na página, seleccionar quais imagens animar |
| 2.2 | Gerar clips batch (Runway API) | Botão "Gerar clips" → submete ao Runway → poll → Supabase |
| 2.3 | Galeria de clips | Ver clips gerados, por tema, com preview |

**Créditos:** 1,800 disponíveis = 36 clips de 10s. Comprar mais conforme necessário.

**Resultado:** Biblioteca de clips no Supabase, organizados por tema.

---

### FASE 3 — Montagem de Vídeos Longos

**Objectivo:** Juntar clips + música → MP4 para YouTube.

| Passo | O que | Detalhe |
|-------|-------|---------|
| 3.1 | Escolher clips por tema | Filtrar clips do Supabase por tema |
| 3.2 | Escolher par de música | Dropdown com 50 pares ancient-ground |
| 3.3 | Preview no browser | Ver sequência de clips + ouvir música |
| 3.4 | Render MP4 (Shotstack) | Clica "Gerar" → MP4 no Supabase |
| 3.5 | Download/publicar | Link directo para o vídeo final |

**Resultado:** Vídeos longos prontos para YouTube, gerados em minutos.

---

### FASE 4 — Prompts dos Cursos (Colecção B)

**Objectivo:** Criar prompts globais/abstractos para vídeos YouTube dos cursos.

| Passo | O que | Detalhe |
|-------|-------|---------|
| 4.1 | Ler 122 scripts YouTube | Mapear temas emocionais |
| 4.2 | Criar ~70 prompts (Colecção B) | Globais, sem pessoas, abstractos |
| 4.3 | Adicionar ao thinkdiffusion-prompts.json | Novos temas: espelho, porta, luz, etc. |
| 4.4 | Gerar imagens (Colecção B) | Mesmo processo da Fase 1 |

---

## SEQUÊNCIA DE TRABALHO

```
AGORA  → Fase 1.1-1.3 (testar geração de 1 imagem)
HOJE   → Fase 1.4 (gerar biblioteca natureza)
AMANHÃ → Fase 2 (clips Runway)
DEPOIS → Fase 3 (montagem vídeos longos)
FUTURO → Fase 4 (prompts cursos)
```

---

## CUSTOS

| Recurso | Saldo | O que compra |
|---------|-------|-------------|
| ThinkDiffusion | $34 | ~6000 imagens (sobra muito) |
| Runway API | 1,800 cr | 36 clips de 10s |
| Shotstack | Configurado | ~$1-2 por vídeo longo |
| Supabase | Ilimitado | Storage para tudo |
| Suno | Configurado | Música extra (se precisar) |

---

## REGRAS

1. Imagens organizadas por TEMA no Supabase (não por vídeo)
2. Clips são peças reutilizáveis — servem para Shorts, longos, posts
3. Cada tema = uma pasta no Supabase
4. Música = pares do ancient-ground (A+B fazem loop)
5. Tudo self-service: Vivianne faz tudo sem programador
6. Natureza = África/Moçambique. Cursos = global, sem pessoas, sem estereótipos
