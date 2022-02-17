// import type {CategoryGroupWithCategories, } from 'ynab'
import type { TransactionDetail as ynabTransactionDetail } from 'ynab';

export interface Preferences {
  apiToken: string;
}

export type TransactionDetail = ynabTransactionDetail;
export type TransactionDetailMap = Map<string, Group<TransactionDetail>>;

export type GroupTypes = 'category' | 'payee' | 'account';
export type GroupNames = `${GroupTypes}_name`;

export type FilterTypes = 'category' | 'account';
export type FilterNames = `${FilterTypes}_name` | 'amount';

export type SortTypes = 'amount' | 'date';
export type sortOrder = 'asc' | 'desc';
export type SortNames = `${SortTypes}_${sortOrder}`;

export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type FlagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface BudgetSummary {
  id: string;
  name: string;
  last_modified_on?: string | null;
}
export interface Group<T> {
  id: string;
  title: string;
  items: T[];
}

export type Filter = {
  key: FilterNames;
  value?: string;
} | null;

export type onGroupType = (groupType: GroupNames) => () => void;
export type onFilterType = (filterType: Filter) => () => void;
export type onSortType = (sortType: SortNames) => () => void;
export type onTimelineType = (period: Period) => void;

export interface ViewState {
  filter: Filter;
  group: GroupNames | null;
  sort: SortNames | null;
  collection: TransactionDetail[] | TransactionDetailMap;
  initialCollection: TransactionDetail[];
}

export type ViewAction =
  | { type: 'reset'; initialCollection?: TransactionDetail[] }
  | {
      type: 'filter';
      filterBy: Filter;
    }
  | { type: 'group'; groupBy: GroupNames }
  | { type: 'sort'; sortBy: SortNames };

export type TransactionState = Omit<ViewState, 'collection' | 'initialCollection'> & {
  timeline: Period | undefined;
};
