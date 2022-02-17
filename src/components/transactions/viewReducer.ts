import type {
  Filter,
  Group,
  GroupNames,
  SortNames,
  SortTypes,
  sortOrder,
  ViewAction,
  ViewState,
  TransactionDetail,
  TransactionDetailMap,
} from '@srcTypes';

import { nanoid as randomId } from 'nanoid';

export function transactionViewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case 'reset': {
      const initialItems = action.initialCollection ?? state.initialCollection;
      return {
        filter: null,
        group: null,
        sort: 'date_desc',
        collection: initialItems,
        initialCollection: initialItems,
      };
    }
    case 'group': {
      const { groupBy: newGroup } = action;
      const { collection, group: currentGroup, initialCollection } = state;

      if (newGroup === currentGroup) {
        return {
          ...state,
          collection: initialCollection,
          group: null,
        };
      }

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
        ? initialCollection.filter(filterCollectionBy(newFilter))
        : // TODO improve performance. Most .reduce calls could be replaced by for loops
          initialCollection.filter(filterCollectionBy(newFilter)).reduce(groupToMap(group), new Map());

      return {
        ...state,
        filter: newFilter,
        collection: filteredCollection,
      };
    }
    case 'sort': {
      const { sortBy: newSort } = action;
      const { collection, sort: currentSort, group, initialCollection } = state;

      if (newSort === null || newSort === currentSort) {
        const collection = group ? initialCollection.reduce(groupToMap(group), new Map()) : initialCollection;
        return {
          ...state,
          collection,
          sort: 'date_desc',
        };
      }

      const sortFn = sortCollectionBy(newSort);
      const sortedCollection = Array.isArray(collection)
        ? [...initialCollection].sort(sortFn)
        : [...initialCollection].sort(sortFn).reduce(groupToMap(group), new Map());

      return { ...state, sort: newSort, collection: sortedCollection };
    }
    default:
      //@ts-expect-error action type does not exist
      throw new Error(`Invalid action type "${action.type}" in transactionViewReducer`);
  }
}

export function initView({
  filter = null,
  group = null,
  sort = null,
  initialCollection: initialItems,
}: ViewState): ViewState {
  return {
    filter,
    group,
    sort,
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

function sortCollectionBy(sortOrder: SortNames) {
  const [key, order] = sortOrder.split('_') as [SortTypes, sortOrder];

  return function compareItems(firstEl: TransactionDetail, secondEl: TransactionDetail) {
    const left = key === 'date' ? new Date(firstEl[key]).getTime() : firstEl[key];
    const right = key === 'date' ? new Date(secondEl[key]).getTime() : secondEl[key];

    const sortOrderValue = right === left ? 0 : right > left ? 1 : -1;

    return order === 'desc' || sortOrderValue === 0 ? sortOrderValue : -1 * sortOrderValue;
  };
}

function filterCollectionBy(newFilter: Filter) {
  return (item: TransactionDetail) => {
    if (!newFilter) return true;

    if (newFilter.key === 'amount') {
      if (newFilter.value == 'inflow') return item.amount >= 0;
      else if (newFilter.value == 'outflow') return item.amount < 0;
    }

    return item[newFilter.key] === newFilter.value;
  };
}

function isSameFilter(filterA: Filter, filterB: Filter) {
  if (!filterA && filterB) return false;

  if (filterA && !filterB) return false;

  let isSameObject = false;

  if (filterA && filterB) {
    if (!filterA?.key && !filterB?.key) isSameObject = false;

    isSameObject = filterA.key === filterB.key && filterA.value === filterB.value;
  }

  return isSameObject;
}
