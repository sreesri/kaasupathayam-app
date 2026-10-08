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

export function money(amount: string | number, currency: string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** The currency's symbol on its own, e.g. "₹". */
export function moneySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat(undefined, { style: 'currency', currency })
      .formatToParts(0)
      .find((x) => x.type === 'currency');
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

/** Whole currency units, for headline numbers where paise are noise. */
export function moneyShort(amount: string | number, currency: string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value)}`;
  }
}

export const ACCOUNT_TYPE_LABEL = {
  bank: 'Bank account',
  credit_card: 'Credit card',
  cash: 'Cash',
  wallet: 'Wallet / UPI',
} as const;

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Today · Wed, 8 Oct 2026" style label for date fields. */
export function longDateLabel(iso: string): string {
  const full = fromISODate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const yesterday = toISODate(new Date(Date.now() - 86_400_000));
  const prefix = iso === today() ? 'Today · ' : iso === yesterday ? 'Yesterday · ' : '';
  return prefix + full;
}
