/**
 * Types for the Sete Véus course platform (seteveus.space)
 */

export type CourseSlug =
  | "ouro-proprio"
  | "sangue-e-seda"
  | "a-arte-da-inteireza"
  | "depois-do-fogo"
  | "olhos-abertos"
  | "pele-nua"
  | "limite-sagrado"
  | "flores-no-escuro"
  | "o-peso-e-o-chao"
  | "voz-de-dentro"
  | "o-fio-invisivel"
  | "o-espelho-do-outro"
  | "o-silencio-que-grita"
  | "a-teia"
  | "a-chama"
  | "a-mulher-antes-de-mae"
  | "o-oficio-de-ser"
  | "o-relogio-partido"
  | "a-coroa-escondida"
  | "a-fome";

export type SubLesson = {
  letter: string; // "A", "B", "C"
  title: string;
  description: string;
};

export type CourseModule = {
  number: number;
  title: string;
  description: string;
  subLessons: SubLesson[];
  workbook: string | null;
};

export type YouTubeHook = {
  title: string;
  durationMin: number;
};

export type CourseData = {
  slug: CourseSlug;
  number: number;
  title: string;
  subtitle: string;
  arcoEmocional: string;
  diferencial: string;
  modules: CourseModule[];
  youtubeHooks: YouTubeHook[];
};

export type CourseMeta = {
  slug: CourseSlug;
  number: number;
  title: string;
  subtitle: string;
  arcoEmocional: string;
  diferencial: string;
  moduleCount: number;
  totalSubLessons: number;
  youtubeHookCount: number;
};

export type CategorySlug = "materia" | "herancas" | "ciclos" | "fronteiras";

export type CourseCategory = {
  slug: CategorySlug;
  title: string;
  subtitle: string;
  courses: CourseSlug[];
};

export type LessonStatus = "not_started" | "in_progress" | "completed";

export type LessonProgress = {
  lessonId: string;
  status: LessonStatus;
  completedAt: string | null;
  lastPositionSec: number;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseSlug: string;
  stripePaymentId: string | null;
  enrolledAt: string;
  completedAt: string | null;
  certificateUrl: string | null;
  certificateCode: string | null;
};
