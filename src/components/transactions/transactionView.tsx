import type { TransactionDetail } from 'ynab';
import type { FilterNames, Group, GroupNames } from '@srcTypes';

import { useState } from 'react';
import { List, randomId } from '@raycast/api';

import { useSharedState } from '@lib/useSharedState';
import { useTransactions } from '@lib/ynab';
import { TransactionItem } from './transactionItem';

export function TransactionView() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const { data: transactions, isValidating } = useTransactions(activeBudgetId);

  const [groupBy, setGroupBy] = useState<GroupNames | null>(null);

  /* TODO: Hold new state for filters */
  // const [filter, setFilter] = useState<FilterNames | null>(null);

  const groups =
    groupBy &&
    transactions?.reduce<Map<string, Group<TransactionDetail>>>((groupMap, currentTransaction) => {
      const groupName = currentTransaction[groupBy] ?? '';

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          id: `${groupName}-${randomId()}`,
          title: groupName,
          items: [],
        });
      }

      const previousGroup = groupMap.get(groupName) as Group<TransactionDetail>;
      groupMap.set(groupName, { ...previousGroup, items: [...previousGroup?.items, currentTransaction] });

      return groupMap;
    }, new Map());

  const handleGrouping = (groupType: GroupNames | null) => () => setGroupBy(groupType);

  return (
    <List isLoading={isValidating}>
      {groups
        ? Array.from(groups).map(([, group]) => (
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
