# Plano: Experiencia de Aprendizado Fluida com Presenca

## Principio
A aluna entra num territorio. Nao navega uma lista.
Cada ecra deve responder: "Onde estou? O que fiz? Para onde vou?"

---

## Fase 1 — Presenca da aluna (o essencial)

### 1.1 Dashboard da aluna (refazer `/`)
A home deixa de ser lista de cursos. Passa a ser o ponto de presenca.

**Se nao tem curso:**
- Frase de boas-vindas + convite
- Categorias com 1 curso destaque por categoria
- Link "Ver todos os cursos"

**Se tem curso em progresso:**
- Card principal: "Continuar — [Nome do curso], Modulo X, Sub-aula Y"
- Barra de progresso visual (modulos completados / 8)
- Frase do territorio (do arcoEmocional)
- Abaixo: outros cursos em progresso (se houver)
- Link discreto "Explorar mais cursos"

**Dados:** Nova tabela `course_progress` no Supabase:
```
id, user_id, course_slug, current_module, current_sublesson,
modules_completed (int[]), started_at, last_activity_at, completed_at
```

### 1.2 Pagina do curso com progresso (`/cursos/[slug]`)
- Manter arco emocional no topo
- Cada modulo mostra estado: bloqueado / em progresso / completo
- Modulo 1 sempre aberto. Modulo N abre quando N-1 completo
- Indicador visual: circulo vazio → meio → cheio
- "Continuar" no modulo actual

### 1.3 Experiencia de aula (`/cursos/[slug]/[modulo]/[subaula]`)
Nova rota. Cada sub-aula e um ecra proprio (nao lista tudo no modulo).

**Estrutura do ecra:**
1. **Abertura** — Frase curta contextual (titulo da sub-aula + "Modulo X de 8")
2. **Video** — Player (placeholder agora, mas com estrutura real aspect-ratio)
3. **Texto de apoio** — Descricao da sub-aula expandida
4. **Pausa** — "Antes de avancares..." (micro-reflexao, 1 pergunta)
5. **Botao "Completar e continuar →"** — Marca como feito, avanca para proxima sub-aula
6. **Navegacao** — Setas discretas prev/next

**Fluxo:** A → B → C → Caderno → Modulo completo

### 1.4 Momento do caderno (`/cursos/[slug]/[modulo]/caderno`)
Depois da ultima sub-aula, antes de fechar o modulo:
- Titulo do caderno de exercicios
- Botao de download do PDF (quando disponivel)
- Espaco de reflexao livre (journal_entries reutilizado)
- Botao "Completar modulo"

### 1.5 Ritual de conclusao de modulo
Ao completar todas sub-aulas + caderno:
- Ecra dedicado: "Modulo X — Completo"
- Frase de fecho (pode ser a descricao do proximo modulo como teaser)
- Barra de progresso actualizada
- "Continuar para Modulo X+1" ou "Descansar" (volta ao dashboard)

### 1.6 Conclusao do curso
Ao completar modulo 8:
- Ecra de celebracao: "Atravessaste este territorio."
- Frase do arco emocional completa
- Certificado (placeholder — texto + data)
- Convite gentil para proximo curso da categoria

---

## Fase 2 — Profundidade (reflexao e ritual)

### 2.1 Diario por modulo
Reutilizar `journal_entries` do site principal:
- `chapter_slug` = `escola-{courseSlug}-mod-{number}`
- Componente de escrita com auto-save (adaptar ReflectionJournal.tsx)
- Acessivel no caderno e revisitavel na conta

### 2.2 Micro-reflexoes por sub-aula
Cada sub-aula tem 1 pergunta de reflexao (campo novo no CourseData ou hardcoded inicial).
Guardada em `journal_entries` com slug `escola-{courseSlug}-mod-{number}-{letter}`.

### 2.3 Frases de abertura/fecho
Adicionar ao CourseData:
```typescript
type CourseModule = {
  ...existing,
  fraseAbertura?: string;  // "Neste modulo vais..."
  fraseFecho?: string;     // "O que viste aqui..."
};
```
Usadas nos rituais de entrada e conclusao.

---

## Fase 3 — Admin com substancia

### 3.1 Lista de alunas (`/admin/alunas`)
- Tabela: email, cursos activos, ultimo acesso, progresso
- Click → detalhe da aluna (todos cursos, todos modulos, diario)

### 3.2 Alertas no dashboard
- Novas subscricoes (ultimas 48h)
- Alunas paradas ha +7 dias
- Modulos completados hoje

### 3.3 Gestao de conteudo real
- Upload de videos para Supabase Storage
- Upload de PDFs (cadernos)
- Toggle publicado/rascunho por modulo

---

## Fase 4 — Polimento

### 4.1 Eliminar duplicacao /cursos vs /
- `/` = dashboard da aluna (presenca)
- `/cursos` = catalogo (exploracao)

### 4.2 Transicoes
- Fade suave entre sub-aulas
- Loading states com frases (nao spinners)

### 4.3 Certificado real
- Geracao de PDF ou imagem
- Armazenado no Supabase
- Partilhavel

---

## Ordem de implementacao

| Prioridade | Item | Estimativa |
|-----------|------|-----------|
| 1 | Tabela course_progress + hook useProgress | Pequeno |
| 2 | Rota /cursos/[slug]/[modulo]/[subaula] (experiencia de aula) | Medio |
| 3 | Rota /cursos/[slug]/[modulo]/caderno | Pequeno |
| 4 | Dashboard da aluna (refazer /) | Medio |
| 5 | Progresso visual na pagina do curso | Pequeno |
| 6 | Desbloqueio sequencial de modulos | Pequeno |
| 7 | Ritual de conclusao (modulo + curso) | Pequeno |
| 8 | Diario/reflexao integrado | Medio |
| 9 | Admin — lista de alunas | Medio |
| 10 | Admin — alertas | Pequeno |
| 11 | Admin — upload real | Medio |
| 12 | Certificado | Medio |

**Fases 1-2 transformam a app.** Fases 3-4 completam-na.
