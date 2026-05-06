// Calcula data+hora de publicação para um post da semana.
//
// Convenção ISO 8601 — semana N começa na segunda-feira da semana N do ano corrente.
// Fuso default Maputo (CAT, UTC+2). Sem DST.

import brandConfigMod from "../../../src/data/weekly-social/brand-config.ts";
const { TIMEZONE, DAY_ORDER } = brandConfigMod;

/** Converte número ISO de semana para o lunes (Mon) dessa semana, no ano dado. */
export function isoWeekToMonday(year, week) {
  // Algoritmo: 4 jan está sempre na semana 1. Conta a partir daí.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // dom=0 → 7
  const week1Mon = new Date(jan4);
  week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const target = new Date(week1Mon);
  target.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7);
  return target;
}

/** Adiciona dayIndex dias (0=mon, 6=sun) à data base. */
export function dateForDay(monday, dayIndex) {
  const d = new Date(monday);
  d.setUTCDate(monday.getUTCDate() + dayIndex);
  return d;
}

/** Formata "YYYY-MM-DD" da data UTC. */
export function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Retorna { date: "YYYY-MM-DD", time: "HH:MM" } para um post. */
export function scheduleFor(year, weekNumber, dayKey, timeHHMM) {
  const monday = isoWeekToMonday(year, weekNumber);
  const dayIdx = DAY_ORDER.indexOf(dayKey);
  if (dayIdx < 0) throw new Error(`dia inválido: ${dayKey}`);
  const d = dateForDay(monday, dayIdx);
  return {
    date: formatDate(d),
    time: timeHHMM,
    timezone: TIMEZONE,
  };
}

/** Ano corrente — o orquestrador assume sempre o ano em curso. */
export function currentYear() {
  return new Date().getUTCFullYear();
}
