import type { TransactionDetail } from 'ynab';
import type { FilterNames, Group, GroupNames } from '@srcTypes';

import { randomId } from '@raycast/api';

type TransactionDetailMap = Map<string, Group<TransactionDetail>>;
type Filter = {
  key: FilterNames;
  value?: string;
} | null;

export interface ViewState {
  filter: Filter;
  group: GroupNames | null;
  collection: TransactionDetail[] | TransactionDetailMap;
  initialCollection: TransactionDetail[];
}

type ViewAction =
  | { type: 'reset' }
  | {
      type: 'filter';
      filterBy: Filter;
    }
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
      const { collection, group: currentGroup } = state;

      if (newGroup === currentGroup) return state;

      const groups = Array.isArray(collection)
        ? collection?.reduce(groupToMap(newGroup), new Map())
        : Array.from(collection.values())
            .flatMap((g) => g.items)
            .reduce(groupToMap(newGroup), new Map());

      return {
        ...state,
        group: newGroup,
        collection: groups,
      };
    }
    case 'filter': {
      const { filterBy: newFilter } = action;
      const { collection, filter: currentFilter } = state;

      // TODO handle this case by returning the state without the filter
      if (newFilter === null) return state;

      if (isSameFilter(newFilter, currentFilter)) return state;

      const filteredCollection = Array.isArray(collection)
        ? collection.filter((item) => item[newFilter.key] === newFilter.value)
        : collection;

      return {
        ...state,
        filter: newFilter,
        collection: filteredCollection,
      };
    }
    default:
      //@ts-expect-error action type does not exist
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

function isSameFilter(filterA: Filter, filterB: Filter) {
  if (!filterA || !filterB) return true;

  if (!filterA?.key && !filterB?.key) return false;

  for (const [key, value] of Object.entries(filterA)) {
    if (key === filterB.key && value === filterB.value) continue;
    return false;
  }

  return true;
}
