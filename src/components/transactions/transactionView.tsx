import { useEffect, useReducer } from 'react';
import { List } from '@raycast/api';

import { useSharedState } from '@lib/useSharedState';
import { useTransactions } from '@lib/ynab';
import { TransactionItem } from './transactionItem';
import { initView, transactionViewReducer } from './viewReducer';
import { TransactionProvider } from './transactionContext';
import { type ManipulateType } from 'dayjs';

export function TransactionView() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const [timeline = 'month'] = useSharedState<ManipulateType>('timeline', 'm');
  const { data: transactions = [], isValidating } = useTransactions(activeBudgetId, timeline);

  const [{ collection }, dispatch] = useReducer(
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

  return (
    <TransactionProvider dispatch={dispatch}>
      <List isLoading={isValidating}>
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
