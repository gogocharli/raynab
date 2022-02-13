import { useEffect, useReducer } from 'react';
import { List, showToast, ToastStyle } from '@raycast/api';

import { useSharedState } from '@lib/useSharedState';
import { useTransactions } from '@lib/ynab';
import { TransactionItem } from './transactionItem';
import { initView, transactionViewReducer } from './viewReducer';
import { TransactionProvider } from './transactionContext';
import { type Period } from '@srcTypes';

export function TransactionView() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const [timeline, setTimeline] = useSharedState<Period>('timeline', 'month');
  const { data: transactions = [], isValidating } = useTransactions(activeBudgetId, timeline ?? 'month');

  const [state, dispatch] = useReducer(
    transactionViewReducer,
    {
      filter: null,
      group: null,
      sort: 'date_desc',
      collection: transactions,
      initialCollection: transactions,
    },
    initView
  );

  const { collection, group, sort, filter } = state;

  useEffect(() => {
    // Showing an empty list will prevent users from accessing actions and will be stuck
    // We progressively back off in order to not fetch unnecessary data
    // This might cause problems for budgets with no transactions in the past year
    // TODO add a view for > 1 year, change to a different fallback model?

    const showBackupToast = async (fallback: Period) => {
      await showToast(
        ToastStyle.Failure,
        `No results for the past ${timeline}`,
        `Falling back to the last ${fallback}`
      );
    };

    if (transactions.length == 0) {
      let fallbackTimeline: Period;
      switch (timeline) {
        case 'day':
          fallbackTimeline = 'week';
          break;
        case 'week':
          fallbackTimeline = 'month';
          break;
        case 'month':
          fallbackTimeline = 'quarter';
          break;
        default:
          fallbackTimeline = 'year';
          break;
      }

      setTimeline(fallbackTimeline);
      showBackupToast(fallbackTimeline);
      return;
    }

    dispatch({ type: 'reset', initialCollection: transactions });
  }, [timeline]);

  return (
    <TransactionProvider dispatch={dispatch} state={{ group, sort, filter, timeline }} onTimelineChange={setTimeline}>
      <List isLoading={isValidating} searchBarPlaceholder={`Search transactions in the last ${timeline}`}>
        {!Array.isArray(collection)
          ? Array.from(collection).map(([, group]) => (
              <List.Section
                title={group.title}
                key={group.id}
                children={group.items.map((t) => (
                  <TransactionItem transaction={t} key={t.id} />
                ))}
              />
            ))
          : collection.map((t) => <TransactionItem transaction={t} key={t.id} />)}
      </List>
    </TransactionProvider>
  );
}
