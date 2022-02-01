import type { TransactionDetail } from 'ynab';
import type { Filter, Group, GroupNames } from '@srcTypes';

import { randomId } from '@raycast/api';

type TransactionDetailMap = Map<string, Group<TransactionDetail>>;

export interface ViewState {
  filter: Filter;
  group: GroupNames | null;
  collection: TransactionDetail[] | TransactionDetailMap;
  initialCollection: TransactionDetail[];
}

export type ViewAction =
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
      const { collection, filter: currentFilter, group, initialCollection } = state;

      if (newFilter === null || isSameFilter(newFilter, currentFilter)) {
        const collection = group ? initialCollection.reduce(groupToMap(group), new Map()) : initialCollection;
        return {
          ...state,
          collection,
          filter: null,
        };
      }

      const filteredCollection = Array.isArray(collection)
        ? initialCollection.filter((item) => item[newFilter.key] === newFilter.value)
        : // TODO improve performance. Most .reduce calls could be replaced by for loops
          initialCollection
            .filter((item) => item[newFilter.key] === newFilter.value)
            .reduce(groupToMap(group), new Map());

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

function groupToMap(groupBy: GroupNames | null) {
  // TODO improve this error
  if (!groupBy) throw 'Not a valid Groupname';

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
  if (!filterA && filterB) return false;

  if (filterA && !filterB) return false;

  if (filterA && filterB) {
    if (!filterA?.key && !filterB?.key) return false;

    for (const [key, value] of Object.entries(filterA)) {
      if (key === filterB.key && value === filterB.value) continue;
      return false;
    }
  }

  return true;
}
