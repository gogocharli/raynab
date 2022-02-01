import { useReducer } from 'react';
import { List } from '@raycast/api';

import { useSharedState } from '@lib/useSharedState';
import { useTransactions } from '@lib/ynab';
import { TransactionItem } from './transactionItem';
import { initView, transactionViewReducer } from './viewReducer';
import { TransactionProvider } from './transactionContext';

export function TransactionView() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const { data: transactions = [], isValidating } = useTransactions(activeBudgetId);

  const [{ collection }, dispatch] = useReducer(
    transactionViewReducer,
    {
      filter: null,
      group: null,
      collection: transactions,
      initialCollection: transactions,
    },
    initView
  );

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
