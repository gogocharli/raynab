import { useCategoryGroups } from '@hooks/useCategoryGroups';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { getCurrentMonth } from '@lib/utils';
import { List } from '@raycast/api';
import { CategoryGroupSection } from './categoryGroupSection';

export function BudgetView() {
  const [activeBudgetId] = useLocalStorage('activeBudgetId', '');
  const { data: categoryGroups, isValidating: isLoadingCategories } = useCategoryGroups(activeBudgetId);

  return (
    <List isLoading={isLoadingCategories} searchBarPlaceholder={`Search categories in ${getCurrentMonth()}`}>
      <CategoryGroupSection categoryGroups={categoryGroups} />
    </List>
  );
}
