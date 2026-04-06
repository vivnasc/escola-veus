import type { CourseCategory } from "@/types/course";

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    slug: "materia",
    title: "Matéria",
    subtitle: "O que vive no corpo",
    courses: [
      "pele-nua",
      "o-peso-e-o-chao",
      "a-chama",
      "a-fome",
      "a-coroa-escondida",
    ],
  },
  {
    slug: "herancas",
    title: "Heranças",
    subtitle: "O que veio antes de ti",
    courses: [
      "ouro-proprio",
      "sangue-e-seda",
      "o-silencio-que-grita",
      "a-mulher-antes-de-mae",
      "o-fio-invisivel",
    ],
  },
  {
    slug: "ciclos",
    title: "Ciclos",
    subtitle: "As passagens da vida",
    courses: [
      "depois-do-fogo",
      "olhos-abertos",
      "flores-no-escuro",
      "o-relogio-partido",
      "o-oficio-de-ser",
    ],
  },
  {
    slug: "fronteiras",
    title: "Fronteiras",
    subtitle: "Onde tu acabas e o outro começa",
    courses: [
      "a-arte-da-inteireza",
      "limite-sagrado",
      "voz-de-dentro",
      "o-espelho-do-outro",
      "a-teia",
    ],
  },
];

export function getCategoryForCourse(
  courseSlug: string
): CourseCategory | undefined {
  return COURSE_CATEGORIES.find((cat) => cat.courses.includes(courseSlug as any));
}

export function getCategoryBySlug(
  slug: string
): CourseCategory | undefined {
  return COURSE_CATEGORIES.find((cat) => cat.slug === slug);
}
