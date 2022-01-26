import type { TransactionDetail } from 'ynab';
import type { FilterNames, Group, GroupNames } from '@srcTypes';

import { useReducer } from 'react';
import { List, randomId } from '@raycast/api';

import { useSharedState } from '@lib/useSharedState';
import { useTransactions } from '@lib/ynab';
import { TransactionItem } from './transactionItem';

export function TransactionView() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const { data: transactions = [], isValidating } = useTransactions(activeBudgetId);

  const [{ group, items }, dispatch] = useReducer(
    transactionViewReducer,
    {
      filter: null,
      group: null,
      items: transactions,
      initialItems: transactions,
    },
    initView
  );

  const handleGrouping = (groupType: GroupNames) => () => dispatch({ type: 'group', groupBy: groupType });

  return (
    <List isLoading={isValidating}>
      {group
        ? Array.from(items as TransactionDetailMap).map(([, group]) => (
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

type TransactionDetailMap = Map<string, Group<TransactionDetail>>;
interface ViewState {
  filter: FilterNames | null;
  group: GroupNames | null;
  items: TransactionDetail[] | TransactionDetailMap;
  initialItems: TransactionDetail[];
}

type ViewAction =
  | { type: 'reset' }
  | { type: 'filter'; filterBy: FilterNames }
  | { type: 'group'; groupBy: GroupNames };

function transactionViewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case 'reset': {
      const { initialItems } = state;
      return {
        filter: null,
        group: null,
        items: initialItems,
        initialItems,
      };
    }
    case 'group': {
      const { groupBy: newGroup } = action;
      const { items, group } = state;

      // Early return if the group hasn't changed
      if (newGroup === group) return state;

      const groups = Array.isArray(items)
        ? items?.reduce(groupToMap(newGroup), new Map())
        : Array.from(items.values())
            .flatMap((g) => g.items)
            .reduce(groupToMap(newGroup), new Map());

      return {
        ...state,
        group: newGroup,
        items: groups,
      };
    }
    default:
      throw new Error(`Invalid action type "${action.type}" in transactionViewReducer`);
  }
}

function initView({ filter = null, group = null, initialItems }: ViewState): ViewState {
  return {
    filter,
    group,
    items: initialItems,
    initialItems,
  };
}

function groupToMap(groupBy: GroupNames) {
  return function (groupMap: TransactionDetailMap, currentTransaction: TransactionDetail) {
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
  };
}
