export function getIsoWeek(date = new Date()) {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNumber = target.getUTCDay() || 7;

  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));

  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
}

export function getIsoWeekYear(date = new Date()) {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNumber = target.getUTCDay() || 7;

  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  return target.getUTCFullYear();
}

const INTERNAL_DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDayName(date = new Date()) {
  return INTERNAL_DAY_NAMES[date.getDay()];
}

export function formatDayName(date = new Date()) {
  return new Intl.DateTimeFormat("fr-CH", {
    weekday: "long",
  }).format(date);
}

export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatFullDate(date = new Date()) {
  return new Intl.DateTimeFormat("fr-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
