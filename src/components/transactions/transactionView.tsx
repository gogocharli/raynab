import { useEffect, useReducer } from 'react';
import { List } from '@raycast/api';

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

  useEffect(() => {
    dispatch({ type: 'reset', initialCollection: transactions });
  }, [timeline]);

  const { collection, group, sort, filter } = state;

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
