import { GroupNames } from '@srcTypes';

import { useReducer } from 'react';
import { List } from '@raycast/api';

import { useSharedState } from '@lib/useSharedState';
import { useTransactions } from '@lib/ynab';
import { TransactionItem } from './transactionItem';
import { initView, transactionViewReducer } from './viewReducer';

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

  const handleGrouping = (groupType: GroupNames) => () => dispatch({ type: 'group', groupBy: groupType });

  return (
    <List isLoading={isValidating}>
      {!Array.isArray(collection)
        ? Array.from(collection).map(([, group]) => (
            <List.Section
              title={group.title}
              key={group.id}
              children={group.items.map((t) => (
                <TransactionItem transaction={t} key={t.id} onGrouping={handleGrouping} />
              ))}
            />
          ))
        : transactions?.map((t) => <TransactionItem transaction={t} key={t.id} onGrouping={handleGrouping} />)}
    </List>
  );
}
