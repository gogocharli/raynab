import type { TransactionDetail } from 'ynab';
import type { FilterNames, Group, GroupNames } from '@srcTypes';

import { randomId } from '@raycast/api';

type TransactionDetailMap = Map<string, Group<TransactionDetail>>;

export interface ViewState {
  filter: FilterNames | null;
  group: GroupNames | null;
  collection: TransactionDetail[] | TransactionDetailMap;
  initialCollection: TransactionDetail[];
}

type ViewAction =
  | { type: 'reset' }
  | { type: 'filter'; filterBy: FilterNames }
  | { type: 'group'; groupBy: GroupNames };

export function transactionViewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case 'reset': {
      const { initialCollection: initialItems } = state;
      return {
        filter: null,
        group: null,
        collection: initialItems,
        initialCollection: initialItems,
      };
    }
    case 'group': {
      const { groupBy: newGroup } = action;
      const { collection: items, group } = state;

      if (newGroup === group) return state;

      const groups = Array.isArray(items)
        ? items?.reduce(groupToMap(newGroup), new Map())
        : Array.from(items.values())
            .flatMap((g) => g.items)
            .reduce(groupToMap(newGroup), new Map());

      return {
        ...state,
        group: newGroup,
        collection: groups,
      };
    }
    default:
      throw new Error(`Invalid action type "${action.type}" in transactionViewReducer`);
  }
}

export function initView({ filter = null, group = null, initialCollection: initialItems }: ViewState): ViewState {
  return {
    filter,
    group,
    collection: initialItems,
    initialCollection: initialItems,
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
