export type GroupTypes = 'category' | 'payee' | 'account';
export type GroupNames = `${GroupTypes}_name`;

export type FilterTypes = 'category' | 'account';
export type FilterNames = `${FilterTypes}_name`;

export interface Group<T> {
  id: string;
  title: string;
  items: T[];
}

export type Filter = {
  key: FilterNames;
  value?: string;
} | null;
