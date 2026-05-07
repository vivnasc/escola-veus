/**
 * Helper que devolve os hooks YouTube de cada curso, preferindo os títulos
 * reais que existem em `nomear-scripts.ts` (gravados no ElevenLabs e
 * publicados) e caindo nos hooks fictícios de `courses.ts` apenas quando o
 * curso ainda não tem scripts gravados.
 *
 * Os hooks que estão hardcoded em courses.ts foram concebidos antes de a
 * narrativa real existir e em muitos casos não batem com os 3 vídeos que
 * estão de facto no YouTube. Esta camada resolve o mismatch sem termos de
 * editar 20 arrays inline em courses.ts.
 *
 * Filtra hooks com prefixo "M<num>." porque esses são as gravações de aula
 * (módulos), não os ganchos curtos que vão para o YouTube. Só os scripts
 * sem esse prefixo entram nos hooks promocionais.
 */

import { NOMEAR_PRESETS } from "@/data/nomear-scripts";
import type { CourseData, YouTubeHook } from "@/types/course";

const DEFAULT_DURATION_MIN = 6;

function isModuleScript(titulo: string): boolean {
  // "M1.A — ...", "M10.B — ...", etc.
  return /^M\d+\.[A-Za-z]/.test(titulo.trim());
}

let cache: Map<string, YouTubeHook[]> | null = null;

function buildIndex(): Map<string, YouTubeHook[]> {
  const map = new Map<string, YouTubeHook[]>();
  for (const preset of NOMEAR_PRESETS) {
    for (const s of preset.scripts) {
      if (!s.curso || isModuleScript(s.titulo)) continue;
      const list = map.get(s.curso) ?? [];
      list.push({ title: s.titulo, durationMin: DEFAULT_DURATION_MIN });
      map.set(s.curso, list);
    }
  }
  return map;
}

export function getYoutubeHooksForCourse(course: CourseData): YouTubeHook[] {
  if (!cache) cache = buildIndex();
  const real = cache.get(course.slug);
  if (real && real.length > 0) {
    // Retorna até 3 hooks reais (preserva ordem original do nomear-scripts)
    return real.slice(0, 3);
  }
  return course.youtubeHooks ?? [];
}
