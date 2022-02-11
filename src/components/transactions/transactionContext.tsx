import {
  Filter,
  GroupNames,
  onFilterType,
  onGroupType,
  onSortType,
  onTimelineType,
  SortNames,
  TransactionState,
  ViewAction,
} from '@srcTypes';

import { createContext, useContext, type ReactNode } from 'react';

type TransactionContextReturnValues = {
  onGroup: onGroupType;
  onFilter: onFilterType;
  onSort: onSortType;
  onTimelineChange: onTimelineType;
  state: TransactionState;
};
const TransactionContext = createContext<TransactionContextReturnValues | null>(null);

export function TransactionProvider({
  dispatch,
  state,
  onTimelineChange,
  children,
}: {
  dispatch: React.Dispatch<ViewAction>;
  state: TransactionState;
  onTimelineChange: onTimelineType;
  children: ReactNode;
}) {
  const onFilter = (filterType: Filter) => () => dispatch({ type: 'filter', filterBy: filterType });
  const onGroup = (groupType: GroupNames) => () => dispatch({ type: 'group', groupBy: groupType });
  const onSort = (sortType: SortNames) => () => dispatch({ type: 'sort', sortBy: sortType });

  return (
    <TransactionContext.Provider value={{ onFilter, onGroup, onSort, onTimelineChange, state }} children={children} />
  );
}

export function useTransaction() {
  const value = useContext(TransactionContext);

  if (!value) {
    throw new Error('useTransaction must be used inside a TransactionContext');
  }

  return value;
}
