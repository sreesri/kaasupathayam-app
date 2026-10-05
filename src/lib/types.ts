// Mirrors kaasupathayam-backend/src/app/schemas.py. Money arrives as decimal strings.
export type Scope = 'me' | 'household';
export type Role = 'owner' | 'member';
export type AccountType = 'bank' | 'credit_card' | 'cash' | 'wallet';
export type CategoryKind = 'income' | 'expense';
export type TxnType = 'income' | 'expense' | 'transfer';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  email: string;
  name: string;
  household_id: string | null;
  role: Role | null;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role | null;
}

export interface Household {
  id: string;
  name: string;
  currency: string;
  invite_code: string;
  members: Member[];
}

export interface Account {
  id: string;
  owner_id: string;
  name: string;
  type: AccountType;
  opening_balance: string;
  credit_limit: string | null;
  archived: boolean;
  balance: string;
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  archived: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TxnType;
  amount: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  occurred_on: string;
  note: string | null;
  recurring_id: string | null;
}

export interface TransactionInput {
  type: TxnType;
  amount: string;
  account_id: string;
  to_account_id?: string | null;
  category_id?: string | null;
  occurred_on: string;
  note?: string | null;
}

export interface BudgetStatus {
  id: string;
  category_id: string;
  user_id: string | null;
  amount: string;
  spent: string;
  remaining: string;
}

export interface Recurring {
  id: string;
  user_id: string;
  type: TxnType;
  amount: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  note: string | null;
  frequency: Frequency;
  interval: number;
  start_date: string;
  end_date: string | null;
  next_date: string | null;
  active: boolean;
}

export interface Summary {
  start: string;
  end: string;
  income: string;
  expense: string;
  net: string;
  by_category: { category_id: string | null; type: TxnType; total: string }[];
  by_member: { user_id: string; income: string; expense: string }[];
}

export interface TrendPoint {
  month: string;
  income: string;
  expense: string;
}
