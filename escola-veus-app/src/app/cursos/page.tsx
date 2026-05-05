import Link from "next/link";
import { COURSES, getCourseBySlug } from "@/data/courses";
import { COURSE_CATEGORIES } from "@/data/course-categories";

/**
 * Cores por territorio — cada curso tem a sua cor.
 * Baseado na PALETA_MESTRE e nos territorios definidos.
 */
const COURSE_COLORS: Record<string, { accent: string; glow: string; bg: string }> = {
  // Herancas
  "ouro-proprio": { accent: "#C9A96E", glow: "shadow-[0_0_30px_rgba(201,169,110,0.15)]", bg: "from-[#C9A96E]/12 to-[#C9A96E]/3" },
  "sangue-e-seda": { accent: "#A0344A", glow: "shadow-[0_0_30px_rgba(160,52,74,0.15)]", bg: "from-[#A0344A]/12 to-[#A0344A]/3" },
  "o-silencio-que-grita": { accent: "#7E8EA6", glow: "shadow-[0_0_30px_rgba(126,142,166,0.15)]", bg: "from-[#7E8EA6]/12 to-[#7E8EA6]/3" },
  "a-mulher-antes-de-mae": { accent: "#D4896F", glow: "shadow-[0_0_30px_rgba(212,137,111,0.15)]", bg: "from-[#D4896F]/12 to-[#D4896F]/3" },
  "o-fio-invisivel": { accent: "#5A8C6E", glow: "shadow-[0_0_30px_rgba(90,140,110,0.15)]", bg: "from-[#5A8C6E]/12 to-[#5A8C6E]/3" },
  // Materia
  "pele-nua": { accent: "#C4745A", glow: "shadow-[0_0_30px_rgba(196,116,90,0.15)]", bg: "from-[#C4745A]/12 to-[#C4745A]/3" },
  "o-peso-e-o-chao": { accent: "#8B8B8B", glow: "shadow-[0_0_30px_rgba(139,139,139,0.15)]", bg: "from-[#8B8B8B]/12 to-[#8B8B8B]/3" },
  "a-chama": { accent: "#D4533B", glow: "shadow-[0_0_30px_rgba(212,83,59,0.15)]", bg: "from-[#D4533B]/12 to-[#D4533B]/3" },
  "a-fome": { accent: "#C4745A", glow: "shadow-[0_0_30px_rgba(196,116,90,0.15)]", bg: "from-[#C4745A]/12 to-[#C4745A]/3" },
  "a-coroa-escondida": { accent: "#9B6FCF", glow: "shadow-[0_0_30px_rgba(155,111,207,0.15)]", bg: "from-[#9B6FCF]/12 to-[#9B6FCF]/3" },
  // Ciclos
  "depois-do-fogo": { accent: "#7A8C3E", glow: "shadow-[0_0_30px_rgba(122,140,62,0.15)]", bg: "from-[#7A8C3E]/12 to-[#7A8C3E]/3" },
  "olhos-abertos": { accent: "#7EAEC4", glow: "shadow-[0_0_30px_rgba(126,174,196,0.15)]", bg: "from-[#7EAEC4]/12 to-[#7EAEC4]/3" },
  "flores-no-escuro": { accent: "#4A7A9B", glow: "shadow-[0_0_30px_rgba(74,122,155,0.15)]", bg: "from-[#4A7A9B]/12 to-[#4A7A9B]/3" },
  "o-relogio-partido": { accent: "#B8B0A0", glow: "shadow-[0_0_30px_rgba(184,176,160,0.15)]", bg: "from-[#B8B0A0]/12 to-[#B8B0A0]/3" },
  "o-oficio-de-ser": { accent: "#A0744A", glow: "shadow-[0_0_30px_rgba(160,116,74,0.15)]", bg: "from-[#A0744A]/12 to-[#A0744A]/3" },
  // Fronteiras
  "a-arte-da-inteireza": { accent: "#7A6AAE", glow: "shadow-[0_0_30px_rgba(122,106,174,0.15)]", bg: "from-[#7A6AAE]/12 to-[#7A6AAE]/3" },
  "limite-sagrado": { accent: "#D4A853", glow: "shadow-[0_0_30px_rgba(212,168,83,0.15)]", bg: "from-[#D4A853]/12 to-[#D4A853]/3" },
  "voz-de-dentro": { accent: "#6D28D9", glow: "shadow-[0_0_30px_rgba(109,40,217,0.15)]", bg: "from-[#6D28D9]/12 to-[#6D28D9]/3" },
  "o-espelho-do-outro": { accent: "#3D8B5E", glow: "shadow-[0_0_30px_rgba(61,139,94,0.15)]", bg: "from-[#3D8B5E]/12 to-[#3D8B5E]/3" },
  "a-teia": { accent: "#5A7A3E", glow: "shadow-[0_0_30px_rgba(90,122,62,0.15)]", bg: "from-[#5A7A3E]/12 to-[#5A7A3E]/3" },
};

function getColors(slug: string) {
  return COURSE_COLORS[slug] || { accent: "#C9A96E", glow: "", bg: "from-white/5 to-white/2" };
}

/** O primeiro curso — destaque especial */
const FEATURED_SLUG = "ouro-proprio";

export default function CursosPage() {
  const featured = getCourseBySlug(FEATURED_SLUG);
  const featuredColors = getColors(FEATURED_SLUG);

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-32">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-semibold text-escola-creme">
          Cursos
        </h1>
        <p className="mt-2 text-sm text-escola-creme-50 leading-relaxed">
          Cada curso é um território. Uma zona da tua vida que precisas de
          atravessar com mais clareza.
        </p>
      </div>

      {/* Featured course */}
      {featured && (
        <section className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-escola-dourado/60 mb-3">
            Começa aqui
          </p>
          <Link
            href={`/cursos/${FEATURED_SLUG}`}
            className={`block rounded-2xl border border-[${featuredColors.accent}]/30 bg-gradient-to-br ${featuredColors.bg} p-6 transition-all hover:border-[${featuredColors.accent}]/50 ${featuredColors.glow}`}
          >
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ backgroundColor: featuredColors.accent }}
            />
            <h2
              className="font-serif text-2xl font-semibold mb-1"
              style={{ color: featuredColors.accent }}
            >
              {featured.title}
            </h2>
            <p className="text-sm text-escola-creme/70 mb-3">
              {featured.subtitle}
            </p>
            <p className="text-xs text-escola-creme-50 leading-relaxed">
              {featured.diferencial}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-escola-creme-50">
                {featured.modules.length} módulos
              </span>
              <span className="text-escola-creme-50/30">~</span>
              <span
                className="text-xs font-medium"
                style={{ color: featuredColors.accent }}
              >
                Disponível
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* All categories */}
      {COURSE_CATEGORIES.map((category) => (
        <section key={category.slug} className="mb-10">
          <div className="mb-5">
            <h2 className="font-serif text-xl font-medium text-escola-creme">
              {category.title}
            </h2>
            <p className="text-xs text-escola-creme-50 mt-0.5">
              {category.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {category.courses.map((courseSlug) => {
              const course = getCourseBySlug(courseSlug);
              if (!course) return null;

              const colors = getColors(courseSlug);
              const isFeatured = courseSlug === FEATURED_SLUG;

              return (
                <Link
                  key={course.slug}
                  href={`/cursos/${course.slug}`}
                  className={`group block rounded-xl border border-white/[0.06] bg-gradient-to-r ${colors.bg} p-4 transition-all hover:border-white/[0.12] hover:${colors.glow}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Color bar */}
                    <div
                      className="w-1 h-10 rounded-full mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-[17px] font-medium text-escola-creme group-hover:text-white transition-colors">
                        {course.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-escola-creme-50">
                        {course.subtitle}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-escola-creme-50/50">
                          {course.modules.length} módulos
                        </span>
                        {isFeatured && (
                          <>
                            <span className="text-escola-creme-50/20">~</span>
                            <span
                              className="text-[10px] font-medium"
                              style={{ color: colors.accent }}
                            >
                              Disponível
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Arrow */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4 text-escola-creme-50/20 group-hover:text-escola-creme-50/50 transition-all group-hover:translate-x-0.5 mt-1 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {/* Footer */}
      <div className="text-center pt-6">
        <p className="text-[10px] text-escola-creme-50/30 tracking-wider">
          Escola dos Veus ~ Ve o que estava invisivel.
        </p>
      </div>
    </div>
  );
}
