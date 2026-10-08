import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './api';
import type {
  Account,
  AccountType,
  Category,
  CategoryKind,
  Household,
  Scope,
  Summary,
  Transaction,
  TransactionInput,
  TrendPoint,
} from './types';

// --- reads ---

export const useHousehold = () =>
  useQuery({ queryKey: ['household'], queryFn: () => api<Household>('/households/current') });

export const useAccounts = (scope: Scope = 'me', includeArchived = false) =>
  useQuery({
    queryKey: ['accounts', scope, includeArchived],
    queryFn: () =>
      api<Account[]>('/accounts', { query: { scope, include_archived: includeArchived } }),
  });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => api<Category[]>('/categories') });

export interface TransactionFilters {
  scope: Scope;
  start?: string;
  end?: string;
  member_id?: string;
  account_id?: string;
  limit?: number;
}

export const useTransactions = (filters: TransactionFilters) =>
  useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api<Transaction[]>('/transactions', { query: { ...filters } }),
  });

export const useTransaction = (id: string | undefined) =>
  useQuery({
    queryKey: ['transaction', id],
    queryFn: () => api<Transaction>(`/transactions/${id}`),
    enabled: !!id,
  });

export const useSummary = (scope: Scope, start: string, end: string) =>
  useQuery({
    queryKey: ['summary', scope, start, end],
    queryFn: () => api<Summary>('/reports/summary', { query: { scope, start, end } }),
  });

export const useTrend = (scope: Scope, months = 6) =>
  useQuery({
    queryKey: ['trend', scope, months],
    queryFn: () => api<TrendPoint[]>('/reports/trend', { query: { scope, months } }),
  });

// --- writes ---

/** Balances and reports all derive from transactions, so any write refreshes everything. */
function useWrite<TArgs, TResult = unknown>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries() });
}

export const useCreateTransaction = () =>
  useWrite((body: TransactionInput) => api<Transaction>('/transactions', { method: 'POST', body }));

export const useUpdateTransaction = () =>
  useWrite(({ id, ...body }: Partial<TransactionInput> & { id: string }) =>
    api<Transaction>(`/transactions/${id}`, { method: 'PATCH', body }),
  );

export const useDeleteTransaction = () =>
  useWrite((id: string) => api(`/transactions/${id}`, { method: 'DELETE' }));

export const useCreateAccount = () =>
  useWrite(
    (body: {
      name: string;
      type: AccountType;
      opening_balance: string;
      credit_limit?: string | null;
    }) => api<Account>('/accounts', { method: 'POST', body }),
  );

export const useUpdateAccount = () =>
  useWrite(
    ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      opening_balance?: string;
      credit_limit?: string | null;
      archived?: boolean;
    }) => api<Account>(`/accounts/${id}`, { method: 'PATCH', body }),
  );

/** Fails with 409 when the account has transactions; archive those instead. */
export const useDeleteAccount = () =>
  useWrite((id: string) => api(`/accounts/${id}`, { method: 'DELETE' }));

export const useCreateCategory = () =>
  useWrite((body: { name: string; kind: CategoryKind }) =>
    api<Category>('/categories', { method: 'POST', body }),
  );

export const useCreateHousehold = () =>
  useWrite((body: { name: string; currency: string }) =>
    api<Household>('/households', { method: 'POST', body }),
  );

export const useJoinHousehold = () =>
  useWrite((invite_code: string) =>
    api<Household>('/households/join', { method: 'POST', body: { invite_code } }),
  );

export const useRegenerateInvite = () =>
  useWrite(() => api<Household>('/households/current/invite-code', { method: 'POST' }));

// --- lookups ---

/** id → item maps so lists can render names for the ids transactions carry. */
export function useLookups() {
  const household = useHousehold();
  const accounts = useAccounts('household');
  const categories = useCategories();
  return {
    currency: household.data?.currency ?? 'INR',
    member: (id: string) => household.data?.members.find((m) => m.id === id),
    account: (id: string | null) => accounts.data?.find((a) => a.id === id),
    category: (id: string | null) => categories.data?.find((c) => c.id === id),
  };
}
