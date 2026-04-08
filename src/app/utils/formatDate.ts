const DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const MONTHS = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

/**
 * Format a date string to "Ma 21 Mrt" or "Ma 21 Mrt 09:15" (with time if present).
 * Returns "Af te stemmen" for null/undefined values.
 */
export function formatDate(d: string | null | undefined): string {
  if (!d) return "Af te stemmen";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const hasTime = d.includes("T") || d.includes(":");
    const timeStr = hasTime && (date.getHours() || date.getMinutes())
      ? `, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
      : "";
    return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}${timeStr}`;
  } catch {
    return d;
  }
}

/**
 * Format a date relative to now: "Vandaag, 10:00", "Morgen, 10:00", "Gisteren, 10:00",
 * or fallback to "Ma 21 Mrt, 10:00".
 */
export function formatDateRelative(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    if (diffDays === 0) return `Vandaag, ${timeStr}`;
    if (diffDays === 1) return `Morgen, ${timeStr}`;
    if (diffDays === -1) return `Gisteren, ${timeStr}`;
    return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}, ${timeStr}`;
  } catch {
    return d;
  }
}

/**
 * Format a date without weekday: "21 Mrt" (short) — used for compact displays.
 */
export function formatDateShort(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  } catch {
    return d;
  }
}
