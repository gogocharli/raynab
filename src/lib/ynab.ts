import { preferences, showToast, ToastStyle } from '@raycast/api';
import useSWR from 'swr';
import * as ynab from 'ynab';
import { displayError, isYnabError } from './errors';
import dayjs from 'dayjs';

const client = new ynab.API(preferences.apiToken.value as string);

async function fetchBudgets() {
  try {
    const budgetsResponse = await client.budgets.getBudgets();
    const budgets = budgetsResponse.data.budgets;

    const allBudgets: BudgetSummary[] = budgets.map(({ id, name, last_modified_on }) => {
      return { id, name, last_modified_on };
    });

    return allBudgets;
  } catch (error) {
    if (isYnabError(error)) {
      displayError(error, 'Failed to fetch budgets');
    }

    if (error instanceof Error) {
      showToast(ToastStyle.Failure, 'Something went wrong', error.message);
    }

    throw error;
  }
}

async function fetchBudget(selectedBudgetId: string) {
  try {
    const budgetResponse = await client.budgets.getBudgetById(selectedBudgetId);
    const { categories, accounts, payees } = budgetResponse.data.budget;

    return { categories, accounts, payees };
  } catch (error) {
    if (isYnabError(error)) {
      displayError(error, 'Failed to fetch budget');
    }

    if (error instanceof Error) {
      showToast(ToastStyle.Failure, 'Something went wrong', error.message);
    }

    throw error;
  }
}

async function fetchCategoryGroups(selectedBudgetId: string) {
  try {
    const categoriesResponse = await client.categories.getCategories(selectedBudgetId);
    const categoryGroups = categoriesResponse.data.category_groups;
    return categoryGroups;
  } catch (error) {
    if (isYnabError(error)) {
      displayError(error, 'Failed to fetch categories');
    }

    if (error instanceof Error) {
      showToast(ToastStyle.Failure, 'Something went wrong', error.message);
    }

    throw error;
  }
}

async function fetchPayees(selectedBudgetId: string) {
  try {
    const payeesResponse = await client.payees.getPayees(selectedBudgetId);
    const payees = payeesResponse.data.payees;
    return payees;
  } catch (error) {
    if (isYnabError(error)) {
      displayError(error, 'Failed to fetch payees');
    }

    if (error instanceof Error) {
      showToast(ToastStyle.Failure, 'Something went wrong', error.message);
    }

    throw error;
  }
}

async function fetchAccounts(selectedBudgetId: string) {
  try {
    const accountsResponse = await client.accounts.getAccounts(selectedBudgetId || 'last-used');
    const accounts = accountsResponse.data.accounts;

    return accounts;
  } catch (error) {
    if (isYnabError(error)) {
      displayError(error, 'Failed to fetch accounts');
    }

    if (error instanceof Error) {
      showToast(ToastStyle.Failure, 'Something went wrong', error.message);
    }

    throw error;
  }
}

async function fetchTransactions(selectedBudgetId: string) {
  try {
    const transactionsResponse = await client.transactions.getTransactions(
      selectedBudgetId,
      dayjs().subtract(1, 'month').toISOString() // Show one month before by default
    );
    const transactions = transactionsResponse.data.transactions;

    // Sorted by oldest
    transactions.reverse();

    return transactions;
  } catch (error) {
    if (isYnabError(error)) {
      displayError(error, 'Failed to fetch transactions');
    }

    if (error instanceof Error) {
      showToast(ToastStyle.Failure, 'Something went wrong', error.message);
    }

    throw error;
  }
}

export function useBudgets() {
  return useSWR('budgets', fetchBudgets);
}

export function useBudget(budgetId = 'last-used') {
  return useSWR(budgetId, fetchBudget);
}

export function useTransactions(budgetId = 'last-used') {
  return useSWR(budgetId, fetchTransactions);
}

export function usePayees(budgetId = 'last-used') {
  return useSWR(budgetId, fetchPayees);
}

export function useCategoryGroups(budgetId = 'last-used') {
  return useSWR(budgetId, fetchCategoryGroups);
}

export function useAccounts(budgetId = 'last-used') {
  return useSWR(budgetId, fetchAccounts);
}

export interface BudgetSummary {
  id: string;
  name: string;
  last_modified_on?: string | null;
}
