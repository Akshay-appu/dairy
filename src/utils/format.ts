// Manual formatters instead of Intl.NumberFormat: Hermes' bundled ICU data for
// locale-aware currency grouping (en-IN lakh/crore grouping) varies by build,
// so we don't depend on it for a number that farmers need to read correctly.

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  const sign = amount < 0 ? '-' : '';
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, decimal] = fixed.split('.');
  let grouped = whole;
  if (whole.length > 3) {
    const last3 = whole.slice(-3);
    const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    grouped = `${rest},${last3}`;
  }
  return `${sign}₹${grouped}.${decimal}`;
}

export function parseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) return null;
  return value;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateString(value: string): boolean {
  const match = DATE_RE.exec(value.trim());
  if (!match) return false;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.getFullYear() === Number(y) && date.getMonth() === Number(m) - 1 && date.getDate() === Number(d);
}

export function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function currentLocalTimeHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const TIME_HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeHHMM(value: string): boolean {
  return TIME_HHMM_RE.test(value.trim());
}

export function formatDisplayTime12h(hhmm: string): string {
  const trimmed = hhmm.trim();
  const match = TIME_HHMM_RE.exec(trimmed);
  if (!match) return trimmed;
  const hours24 = Number(match[1]);
  const minutes = match[2];
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
}

export function isLowLightHour(): boolean {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 20;
}

export function formatShortDate(value: string, locale: string): string {
  const date = isValidDateString(value) ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export function formatLongDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
