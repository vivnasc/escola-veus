# Imagens reaproveitáveis para `viviannepag`

Inventário dos assets verticais (9:16) no projecto escola-veus que podem
ser reusados no novo Supabase do `viviannepag`. Inclui:
- Imagens MJ do funil YouTube (Nomear)
- Imagens MJ do hoje-em-mim
- Motion videos (MP4) do hoje-em-mim
- Fundos MJ por slide do carrossel
- Motions vc-sabia

---

## Bucket de origem

**Projecto:** escola-veus Supabase
**Bucket:** `course-assets` (público)
**Acesso:** as URLs `storage/v1/object/public/...` são acessíveis sem auth

## Folders relevantes (vertical 9:16)

| Folder | Conteúdo | Formato | Uso na origem |
|---|---|---|---|
| `hoje-em-mim-images/` | imagens MJ contemplativas noite | JPG/PNG 1080×1920 | input para Runway → motions |
| `hoje-em-mim-motions/` | clips Runway gen4 turbo | MP4 720×1280, 10s | fundos dos shorts hoje-em-mim |
| `youtube/clips/` | clips do funil Nomear | MP4 vertical | scenes dos vídeos curtos YouTube |
| `carrossel-veus/fundos/` | fundos MJ por slide | JPG 1080×1920 | atrás do scrim nos slides |
| `vc-sabia/motions/` | motions VC Sabia | MP4 vertical | fundos shorts manhã |
| `course-images/` | thumbnails/capas de cursos | variado | UI da escola |

## URL patterns

Cada ficheiro tem URL pública no formato:

```
https://<SUPABASE_URL>/storage/v1/object/public/course-assets/<folder>/<filename>
```

Exemplo: `https://abc123.supabase.co/storage/v1/object/public/course-assets/hoje-em-mim-images/mj-01-vela-stucco.jpg`

## Como obter a lista completa de ficheiros

A outra sessão (no `viviannepag`) corre o script `dump-existing-assets.mjs`
com as credenciais do Supabase ANTIGO (escola-veus). Não precisa do
service-role; mas listing precisa de auth, então usa o `SUPABASE_SERVICE_ROLE_KEY`
do projecto antigo.

```bash
# Numa sessão com acesso ao Supabase antigo (preferível na outra
# sessão Claude Code do viviannepag se ela conseguir ler env vars
# do .env do projecto antigo)
SUPABASE_URL=https://OLDPROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
node migration/files/dump-existing-assets.mjs > assets.json

# Resultado: JSON com todos os ficheiros + URLs em cada folder
cat assets.json | jq 'keys'
# → ["hoje-em-mim-images", "hoje-em-mim-motions", "youtube/clips", ...]
cat assets.json | jq '.["hoje-em-mim-images"] | length'
# → N (número de imagens)
```

## Estratégias de reaproveitamento

### Opção A — Referência directa (mais simples)

O `viviannepag` Supabase NÃO armazena cópia. Os campos `videoUrl`,
`fundo`, `motionUrl` etc. apontam para as URLs antigas do escola-veus
Supabase. Funciona porque essas URLs são públicas.

**Vantagens:** instantâneo, sem trabalho de migração de dados.
**Desvantagens:** dependência do projecto antigo ficar online; se o
escola-veus Supabase for desligado, as referências quebram.

### Opção B — Mirror (mais robusto)

Script descarrega cada ficheiro da URL antiga e re-upload no Supabase
novo do `viviannepag` mantendo a mesma estrutura de folders.

```javascript
// Esqueleto. A outra sessão pode escrever isto completo.
import { createClient } from "@supabase/supabase-js";
const OLD = createClient(OLD_URL, OLD_KEY);
const NEW = createClient(NEW_URL, NEW_KEY);

const assets = JSON.parse(await readFile("assets.json"));
for (const [folder, files] of Object.entries(assets)) {
  for (const f of files) {
    const res = await fetch(f.url);
    const buf = await res.arrayBuffer();
    await NEW.storage.from("course-assets").upload(
      `${folder}/${f.name}`,
      new Uint8Array(buf),
      { contentType: res.headers.get("content-type"), upsert: true }
    );
  }
}
```

**Vantagens:** controlo total; pode desligar o escola-veus antigo.
**Desvantagens:** tempo (transferir N GB), custo de bandwidth Supabase.

### Opção C — Híbrido

Migrar só os assets que vão ser USADOS activamente no `viviannepag`
(critério: imagens MJ usadas em coleções de carrossel actuais, motions
do hoje-em-mim que correspondem aos shorts publicados). Resto fica
referenciado.

Forma de fazer: queries no projecto antigo para encontrar URLs
referenciadas no JSON `dias` das `carousel_collections` activas, ou no
`renderJobs` dos shorts publicados, e migrar só essas.

## Notas práticas

1. **Carrossel-veus/fundos/** segue convenção de nome `veu-{dia}-slide-{N}.jpg`.
   Se quiseres preservar os fundos das coleções existentes, importa também
   as linhas da tabela `carousel_collections` (que têm `dias[].slides[].fundo`
   apontando para URLs).

2. **Os motions hoje-em-mim** estão também referenciados no ficheiro
   `escola-veus-app/src/data/hoje-em-mim-mj-prompts.ts` por `id` —
   esse é o ground truth do que existe. Cruzar com `dump-existing-assets.mjs`
   para garantir que nada falta.

3. **Permissões:** o bucket `course-assets` é público no escola-veus.
   No `viviannepag` Supabase novo, criar com mesma policy (public read).

4. **CDN cache:** as URLs públicas do Supabase têm cache CDN de
   3600s por defeito. Para forçar refresh (após re-upload), anexar
   `?updated=<timestamp>` à URL.

---

## Resumo executivo para a outra sessão

1. Lê este documento + `dump-existing-assets.mjs`
2. Pede à Vivianne as credenciais do Supabase ANTIGO (URL + service_role)
3. Corre o script → gera `assets.json` com lista completa
4. Decide A/B/C conforme volume e dependências
5. Implementa a estratégia escolhida

Se for Opção A: zero código, só referência.
Se for Opção B: copy-loop com retry (~10-30 min consoante volume).
Se for Opção C: query DB + filter no copy-loop.
