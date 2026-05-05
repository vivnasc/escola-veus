import { getCourseBySlug } from "@/data/courses";

/**
 * Helpers para navegar entre sub-aulas dentro da preview admin.
 * Usado em /admin/producao/aulas/preview/[slug]/[m]/[sub]/page.tsx.
 */

export type SubAulaCoord = {
  slug: string;
  module: number;
  sub: string; // a, b, c
};

export type SubAulaEntry = SubAulaCoord & {
  title: string;
  moduleTitle: string;
  label: string; // ex: "M1·A — O medo de olhar"
};

/** Lista ordenada de todas as sub-aulas do curso (M1·A → M8·C). */
export function listAllSubAulas(slug: string): SubAulaEntry[] {
  const course = getCourseBySlug(slug);
  if (!course) return [];
  const out: SubAulaEntry[] = [];
  for (const mod of course.modules) {
    for (const sl of mod.subLessons) {
      out.push({
        slug,
        module: mod.number,
        sub: sl.letter.toLowerCase(),
        title: sl.title,
        moduleTitle: mod.title,
        label: `M${mod.number}·${sl.letter} — ${sl.title}`,
      });
    }
  }
  return out;
}

export function findSubAulaIndex(slug: string, module: number, sub: string): number {
  const list = listAllSubAulas(slug);
  return list.findIndex((s) => s.module === module && s.sub === sub.toLowerCase());
}

export function getPrevSubAula(slug: string, module: number, sub: string): SubAulaEntry | null {
  const list = listAllSubAulas(slug);
  const idx = findSubAulaIndex(slug, module, sub);
  if (idx <= 0) return null;
  return list[idx - 1];
}

export function getNextSubAula(slug: string, module: number, sub: string): SubAulaEntry | null {
  const list = listAllSubAulas(slug);
  const idx = findSubAulaIndex(slug, module, sub);
  if (idx < 0 || idx >= list.length - 1) return null;
  return list[idx + 1];
}

export function subAulaHref(entry: SubAulaCoord): string {
  return `/admin/producao/aulas/preview/${entry.slug}/${entry.module}/${entry.sub.toLowerCase()}`;
}
