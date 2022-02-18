import { OpenInYnabAction } from '@components/actions';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { formatToReadablePrice } from '@lib/utils';
import { Action, ActionPanel, Icon, List } from '@raycast/api';
import { CurrencyFormat } from '@srcTypes';
import { useState } from 'react';
import type { Category, CategoryGroupWithCategories } from 'ynab';

export function CategoryGroupSection({
  categoryGroups,
}: {
  categoryGroups: CategoryGroupWithCategories[] | undefined;
}) {
  const [activeBudgetCurrency] = useLocalStorage<CurrencyFormat | null>('activeBudgetCurrency', null);
  const [showProgress, setshowProgress] = useState(false);

  return (
    <>
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
              // TODO create unique icons for different goal types
              <List.Item
                key={category.id}
                id={category.id}
                title={category.name}
                accessoryTitle={
                  showProgress
                    ? renderProgressTitle(category)
                    : renderDefaultTitle(category, activeBudgetCurrency?.currency_symbol)
                }
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="Show Category"
                      icon={Icon.Eye}
                      target={
                        {
                          /* <TransactionDetails transaction={transaction} /> */
                        }
                      }
                    />
                    <Action.Push
                      title="Edit Category"
                      icon={Icon.Pencil}
                      target={
                        {
                          /* <TransactionEditForm transaction={transaction} /> */
                        }
                      }
                    />
                    <OpenInYnabAction />
                    <Action
                      icon={Icon.Binoculars}
                      title={`${showProgress ? 'Hide' : 'Show'} Progress`}
                      onAction={() => setshowProgress((s) => !s)}
                      shortcut={{ modifiers: ['cmd'], key: 'p' }}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        ))}
    </>
  );
}

const FULL_SYMBOL = '●';
const EMPTY_SYMBOL = '○';
const MAX_SYMBOL_COUNT = 10;
function renderProgressTitle(category: Category) {
  const percentage = category.goal_percentage_complete;

  if (!category.goal_type) return 'N/A';

  const fullSymbolsCount = Math.min(Math.round(((percentage ?? 0) * MAX_SYMBOL_COUNT) / 100), 100);

  const emptySymbolsCount = MAX_SYMBOL_COUNT - fullSymbolsCount;

  return `${FULL_SYMBOL.repeat(fullSymbolsCount)}${EMPTY_SYMBOL.repeat(emptySymbolsCount)} ${percentage
    ?.toString()
    .padStart(3, ' ')}%`;
}

function renderDefaultTitle(category: Category, currencySymbol: string | undefined) {
  return `${currencySymbol ?? '$'}${formatToReadablePrice(category.balance)}`;
}
