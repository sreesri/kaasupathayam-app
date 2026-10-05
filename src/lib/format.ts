const pad = (n: number) => String(n).padStart(2, '0');

/** Local-date ISO string (YYYY-MM-DD); toISOString() would shift to UTC. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const today = () => toISODate(new Date());
export const currentMonth = () => today().slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  return { start: `${month}-01`, end: toISODate(new Date(y, m, 0)) };
}

export function monthLabel(month: string, style: 'long' | 'short' = 'long'): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: style,
    year: style === 'long' ? 'numeric' : undefined,
  });
}

export function dateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 && date.getDate() === d;
}

export function money(amount: string | number, currency: string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export const ACCOUNT_TYPE_LABEL = {
  bank: 'Bank account',
  credit_card: 'Credit card',
  cash: 'Cash',
  wallet: 'Wallet / UPI',
} as const;
