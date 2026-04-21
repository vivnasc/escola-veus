# Padrão técnico — Dashboard de Estado por Item

Receita para dar a cada pipeline (Funil, Aulas, Ancient Ground, ...) um dashboard que mostre, **por cada item de produção**, onde está cada recurso (áudio gerado? imagens? clips? vídeo final? legenda? thumbnail?). Evita que a Vivianne se perca entre 100+ episódios.

**Implementação de referência:** `/api/admin/funil/status` + `/admin/producao/funil` (commit `ab95688`). Usa-se isto como template.

---

## Anatomia

Dois ficheiros principais:

```
escola-veus-app/src/app/api/admin/<track>/status/route.ts   ← endpoint
escola-veus-app/src/app/admin/producao/<track>/page.tsx     ← UI com Pills
```

Mais dependências opcionais:
- `src/data/<track>-scripts.ts` (fonte de verdade dos items) — para Aulas usa `nomear-scripts.ts` filtrado por prefix `curso-`
- `src/data/<track>-prompts.seed.json` (se o pipeline gera imagens)

---

## Endpoint `status/route.ts` — Template

```ts
import { NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts"; // ou equivalente

export const dynamic = "force-dynamic";

async function listAll(supabase: any, path: string): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list(path, { limit: 1000, offset });
    if (error || !data || data.length === 0) break;
    for (const f of data) if (f.name) out.push(f.name);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

function titleToSlug(title: string): string {
  return (title || "audio")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET() {
  // 1. Ler todos os items (scripts/episódios/aulas)
  const allItems = extractItemsFromPreset(...);

  // 2. Listar folders Supabase relevantes em paralelo
  const supabase = createClient(...);
  const [audios, videos, thumbs, ...] = await Promise.all([
    listAll(supabase, "youtube"),
    listAll(supabase, "youtube/funil-videos"),
    listAll(supabase, "youtube/thumbnails"),
    // ...
  ]);

  // 3. Para cada item, verificar por prefix match se os recursos existem
  const episodes = allItems.map((item) => {
    const slug = titleToSlug(item.titulo);
    return {
      id: item.id,
      status: {
        audio: audios.some((a) => a.endsWith(".mp3") && a.startsWith(`${slug}-`)),
        video: videos.some((v) => v.endsWith(".mp4") && v.startsWith(`${slug}-`)),
        // ...
      },
    };
  });

  return NextResponse.json({ episodes });
}
```

**Convenção de naming no Supabase** (crítica para o match funcionar):
- Áudios: `<title-slug>-<timestamp>.mp3`
- Vídeos finais: `<title-slug>-<timestamp>.mp4` ou `<epKey>-<timestamp>.mp4`
- Thumbnails: `<epKey>-<timestamp>.png`
- SRT: `<epKey>-<timestamp>.srt`
- Imagens: `<promptId>/horizontal/<promptId>-h-NN.png`
- Clips: `<promptId>-h-NN.mp4`

Se um novo endpoint de geração usar outro padrão, ou a lista no status falha ou precisamos ajustar.

---

## UI — Componente `Pill`

Reutilizável. Três estados visuais:

```tsx
function Pill({
  label, value, ok, partial, loading,
}: {
  label: string;
  value: string;
  ok?: boolean;      // verde dourado
  partial?: boolean; // coral (parcialmente feito)
  loading?: boolean; // cinza pulsante
}) {
  let cls = "bg-escola-border text-escola-creme-50";
  if (loading) cls = "bg-escola-border text-escola-creme-50 animate-pulse";
  else if (ok) cls = "bg-escola-dourado/10 text-escola-dourado";
  else if (partial) cls = "bg-escola-terracota/10 text-escola-terracota";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cls}`}>
      <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
```

Uso típico por item:

```tsx
<Pill label="áudio" ok={!!st?.audio} value={st?.audio ? "✓" : "×"} loading={loading && !st} />
<Pill label="imagens" ok={st?.imagesCount >= total} partial={st?.imagesCount > 0 && st?.imagesCount < total}
      value={`${st?.imagesCount ?? 0}/${total}`} />
```

---

## Integração na UI

Na página do track (`/admin/producao/<track>/page.tsx`):

```tsx
const [statusMap, setStatusMap] = useState<Map<string, Status> | null>(null);

useEffect(() => {
  fetch("/api/admin/<track>/status", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      const m = new Map();
      for (const e of d.episodes) m.set(e.id, e.status);
      setStatusMap(m);
    });
}, []);
```

Renderiza uma linha por item com as Pills.

---

## Checklist para adicionar dashboard a um pipeline novo

1. [ ] Garantir convenção de naming no Supabase (uploader usa title-slug ou epKey consistente)
2. [ ] Criar `src/app/api/admin/<track>/status/route.ts` seguindo o template
3. [ ] Definir quais recursos verificar (audio? images? clips? video? srt? thumbnail?)
4. [ ] Na página `/admin/producao/<track>/page.tsx`:
   - [ ] `useEffect` que busca status no mount
   - [ ] Estado `Map<id, status>` para lookup rápido
   - [ ] Renderizar Pills por item dentro da lista existente
5. [ ] Copiar o componente `Pill` do `funil/page.tsx` (linha ~190) ou extrair para `components/admin/Pill.tsx`
6. [ ] Testar com a Supabase real para verificar que os prefixos batem

---

## Performance

O endpoint `funil/status` lista 5 folders top-level + N sub-folders (um por promptId com imagens). Com 200 prompts + 200 folders de imagens = ~400 listings paralelos. Demora ~2-4s numa resposta fria, ~1s com cache quente do Supabase. Aceitável.

Se crescer muito (1000+ items), considerar:
- **Cache in-memory** na função serverless (por 60s)
- **Tabela Supabase dedicada** `production_status` actualizada por triggers (webhooks de upload) em vez de listar folders todas as vezes

Para já, listar é suficiente.

---

## Troubleshooting

**"Não aparecem os que já gerei"** — provavelmente o prefix esperado não bate com o que o uploader escreveu.
- Abrir DevTools → Network → ver resposta do `/status`
- Verificar no Supabase como se chama o ficheiro real
- Ajustar o match no endpoint (ex: título vs id do script)

**"Demora demasiado a carregar"** — muitos subfolders de imagens. Só listar os que começam por `nomear-` ou `curso-` respectivamente. Já implementado no funil, ver linha "imageFolders.filter".
