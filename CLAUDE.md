# CLAUDE.md — preferências de workflow

## Workflow de PRs (autonomia)

Para tarefas normais de feature/fix nesta repo, faz o ciclo completo
sem pedir confirmação no fim:

1. Branch — desenvolve em `claude/<descritivo>` (ou na branch indicada
   pela sessão).
2. Commits — granulares, mensagens em PT, foco no "porquê".
3. Push — `git push -u origin <branch>`.
4. PR — abre contra `main` via `mcp__github__create_pull_request` com
   título curto e body (resumo + commits + como testar).
5. Merge — `mcp__github__merge_pull_request` com `merge_method: "squash"`
   (padrão do repo). Não esperes confirmação.

**Excepções — para estas, pede sempre autorização antes:**

- Migrations de BD ou alterações de schema Supabase
- Apagar dados (storage, tabelas, ficheiros media já em uso)
- Mexer em segredos / env vars / `.env*`
- Force-push, rebase de branches partilhadas
- Mudanças em CI/CD (`.github/workflows/`, `vercel.json`)
- Mexer em código de pagamentos / auth / RLS policies

## Estilo de código

- Sem travessões em código, comentários, captions, prompts. É um
  tique de IA — banido em todo o repo.
- Comentários só quando explicam o PORQUÊ. Nada de "WHAT" óbvio.
- Sem emojis a não ser que eu peça explicitamente.
- Production-first: testa o golden path antes de reportar feito.

## Localização

PT-PT / PT-MZ (não PT-BR). Moçambique é o mercado primário; quando
houver hashtags geográficas ou referências de cultura, usa Moçambique
em vez de Portugal/Brasil.
