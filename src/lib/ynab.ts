import { preferences, showToast, ToastStyle } from '@raycast/api';
import useSWR from 'swr';
import * as ynab from 'ynab';
import { displayError, isYnabError } from './errors';

window.requestAnimationFrame = window.setTimeout;
const client = new ynab.API(preferences.apiToken.value as string);

async function fetchBudgets() {
  try {
    const budgetsResponse = await client.budgets.getBudgets();
    const budgets = budgetsResponse.data.budgets;

    const allBudgets: BudgetInfo[] = budgets.map(({ id, name, last_modified_on }) => {
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

export function useBudgets() {
  return useSWR('budgets', fetchBudgets);
}

interface BudgetInfo {
  id: string;
  name: string;
  last_modified_on?: string | null;
}
