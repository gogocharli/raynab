import { Filter, GroupNames } from '@srcTypes';

import { createContext, useContext, type ReactNode } from 'react';
import { type ViewAction } from './viewReducer';

type TransactionContextReturnValues = {
  onGroup: (groupType: GroupNames) => () => void;
  onFilter: (filterType: Filter) => () => void;
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

  return <TransactionContext.Provider value={{ onFilter, onGroup }} children={children} />;
}

export function useTransaction() {
  const value = useContext(TransactionContext);

  if (!value) {
    throw new Error('useTransaction must be used inside a TransactionContext');
  }

  return value;
}
