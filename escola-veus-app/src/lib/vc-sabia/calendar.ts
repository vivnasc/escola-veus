/**
 * Contexto de calendario para o picker de frases vc-sabia.
 *
 * Mapeia uma data (Y/M/D) num conjunto de marcadores ("abertura de mes",
 * "encerramento de mes", "primeiro dia do ano", etc.) e devolve a ordem
 * preferida de temas para esse dia. O picker usa esta ordem como vies:
 * tenta primeiro escolher uma frase de um tema preferido nao usado; se
 * nao houver, cai para o cursor normal.
 *
 * Mantido determinista (sem aleatoriedade) para o preview ser reproduzivel.
 */

export type CalendarContext = {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  daysInMonth: number;
  dayOfYear: number;
  daysInYear: number;
  weekday: number; // 0=domingo
  markers: CalendarMarker[];
};

export type CalendarMarker =
  | "first-day-of-year"
  | "last-day-of-year"
  | "first-day-of-month"
  | "last-day-of-month"
  | "mid-month"
  | "first-monday-of-month"
  | "sunday"
  | "winter-solstice-window"
  | "summer-solstice-window"
  | "spring-equinox-window"
  | "autumn-equinox-window"
  | "regular";

const THEME_OPENING = [
  "florescer-no-tempo-certo",
  "sonhar-com-raizes",
  "confianca-no-caminho",
  "presenca-leve",
] as const;

const THEME_CLOSING = [
  "inteireza",
  "autoperdao",
  "gratidao",
  "beleza-de-existir",
] as const;

const THEME_REST = [
  "suavidade-e-descanso",
  "corpo-como-casa",
  "presenca-leve",
] as const;

const THEME_CELEBRATION = [
  "alegria-simples",
  "beleza-de-existir",
  "gratidao",
] as const;

function daysInMonthOf(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function dayOfYearOf(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const here = Date.UTC(year, month - 1, day);
  return Math.floor((here - start) / 86_400_000) + 1;
}

function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function calendarContextFor(
  year: number,
  month: number,
  day: number
): CalendarContext {
  const dim = daysInMonthOf(year, month);
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const markers: CalendarMarker[] = [];

  if (month === 1 && day === 1) markers.push("first-day-of-year");
  if (month === 12 && day === 31) markers.push("last-day-of-year");
  if (day === 1) markers.push("first-day-of-month");
  if (day === dim) markers.push("last-day-of-month");
  if (day >= 14 && day <= 16) markers.push("mid-month");
  if (dow === 1 && day <= 7) markers.push("first-monday-of-month");
  if (dow === 0) markers.push("sunday");

  // janelas de 3 dias em torno dos solsticios/equinocios (PT, hemisferio norte)
  const inWindow = (m: number, d: number) =>
    month === m && Math.abs(day - d) <= 1;
  if (inWindow(12, 21)) markers.push("winter-solstice-window");
  if (inWindow(6, 21)) markers.push("summer-solstice-window");
  if (inWindow(3, 20)) markers.push("spring-equinox-window");
  if (inWindow(9, 22)) markers.push("autumn-equinox-window");

  if (markers.length === 0) markers.push("regular");

  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    dayOfMonth: day,
    daysInMonth: dim,
    dayOfYear: dayOfYearOf(year, month, day),
    daysInYear: isLeap(year) ? 366 : 365,
    weekday: dow,
    markers,
  };
}

/**
 * Ordem preferida de temas para um dado contexto. O picker tenta pegar
 * uma frase nao-usada com tema da primeira posicao; se falhar, segue
 * para a proxima; se todos falharem, cai para cursor normal.
 *
 * Devolve sempre array nao-vazio (a ultima posicao e sempre "any" = qualquer).
 */
export function preferredThemesFor(ctx: CalendarContext): string[] {
  const acc: string[] = [];
  const push = (themes: readonly string[]) => {
    for (const t of themes) if (!acc.includes(t)) acc.push(t);
  };

  if (ctx.markers.includes("first-day-of-year")) push(THEME_OPENING);
  if (ctx.markers.includes("last-day-of-year")) push(THEME_CLOSING);
  if (ctx.markers.includes("first-day-of-month")) push(THEME_OPENING);
  if (ctx.markers.includes("last-day-of-month")) push(THEME_CLOSING);
  if (
    ctx.markers.includes("spring-equinox-window") ||
    ctx.markers.includes("summer-solstice-window")
  )
    push(THEME_CELEBRATION);
  if (
    ctx.markers.includes("autumn-equinox-window") ||
    ctx.markers.includes("winter-solstice-window")
  )
    push(THEME_CLOSING);
  if (ctx.markers.includes("sunday")) push(THEME_REST);
  if (ctx.markers.includes("mid-month")) push(["inteireza", "confianca-no-caminho"]);

  return acc;
}

/** String curta humana-legivel para mostrar na UI / passar ao Claude. */
export function calendarLabel(ctx: CalendarContext): string {
  const parts: string[] = [];
  if (ctx.markers.includes("first-day-of-year")) parts.push("1.º dia do ano");
  else if (ctx.markers.includes("last-day-of-year")) parts.push("último dia do ano");
  else if (ctx.markers.includes("first-day-of-month")) parts.push("abertura de mês");
  else if (ctx.markers.includes("last-day-of-month")) parts.push("encerramento de mês");
  else if (ctx.markers.includes("mid-month")) parts.push("meio do mês");

  if (ctx.markers.includes("winter-solstice-window")) parts.push("solstício de inverno");
  if (ctx.markers.includes("summer-solstice-window")) parts.push("solstício de verão");
  if (ctx.markers.includes("spring-equinox-window")) parts.push("equinócio da primavera");
  if (ctx.markers.includes("autumn-equinox-window")) parts.push("equinócio de outono");
  if (ctx.markers.includes("sunday")) parts.push("domingo");

  return parts.join(" · ");
}
