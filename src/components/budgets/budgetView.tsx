import { OpenInYnabAction } from '@components/actions';
import { useBudget } from '@hooks/useBudget';
import { useCategoryGroups } from '@hooks/useCategoryGroups';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { formatToReadablePrice, getCurrentMonth } from '@lib/utils';
import { ActionPanel, Color, Icon, List } from '@raycast/api';

export function BudgetView() {
  const [activeBudgetId] = useLocalStorage('activeBudgetId', '');
  const { data: budget, isValidating: isLoadingBudget } = useBudget(activeBudgetId);
  const { data: categoryGroups, isValidating: isLoadingCategories } = useCategoryGroups(activeBudgetId);

  const currentMonth = budget?.months?.at(0);

  return (
    <List
      isLoading={isLoadingBudget || isLoadingCategories}
      searchBarPlaceholder={`Search categories in ${getCurrentMonth()}`}
    >
      {categoryGroups
        ?.filter((group) => group.name !== 'Internal Master Category')
        ?.map((group) => (
          <List.Section
            key={group.id}
            id={group.id}
            title={group.name}
            subtitle={`${group.categories.length} Categories`}
          >
            {group.categories.map((category) => (
              <List.Item
                key={category.id}
                id={category.id}
                title={category.name}
                accessoryTitle={`${budget?.currency_format?.currency_symbol}${formatToReadablePrice(category.balance)}`}
              />
            ))}
          </List.Section>
        ))}
    </List>
  );
}
