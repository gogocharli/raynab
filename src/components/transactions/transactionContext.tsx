import { Filter, GroupNames, onFilterType, onGroupType, onSortType, SortNames } from '@srcTypes';
import { type ViewAction } from './viewReducer';

import { createContext, useContext, type ReactNode } from 'react';

type TransactionContextReturnValues = {
  onGroup: onGroupType;
  onFilter: onFilterType;
  onSort: onSortType;
};
const TransactionContext = createContext<TransactionContextReturnValues | null>(null);

export function TransactionProvider({
  dispatch,
  children,
}: {
  dispatch: React.Dispatch<ViewAction>;
  children: ReactNode;
}) {
  const onFilter = (filterType: Filter) => () => dispatch({ type: 'filter', filterBy: filterType });
  const onGroup = (groupType: GroupNames) => () => dispatch({ type: 'group', groupBy: groupType });
  const onSort = (sortType: SortNames) => () => dispatch({ type: 'sort', sortBy: sortType });

  return <TransactionContext.Provider value={{ onFilter, onGroup, onSort }} children={children} />;
}

export function useTransaction() {
  const value = useContext(TransactionContext);

  if (!value) {
    throw new Error('useTransaction must be used inside a TransactionContext');
  }

  return value;
}
