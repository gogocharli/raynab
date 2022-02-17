import { OpenInYnabAction } from '@components/actions';
import { useAccounts } from '@hooks/useAccounts';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { formatToReadablePrice } from '@lib/utils';
import { ActionPanel, Color, Icon, List } from '@raycast/api';
import { CurrencyFormat } from '@srcTypes';

export function AccountView() {
  const { data: accounts, isValidating } = useAccounts();
  const [activeBudgetCurrency] = useLocalStorage<CurrencyFormat | null>('activeBudgetCurrency', null);

  return (
    <List isLoading={isValidating}>
      {accounts?.map((account) => (
        <List.Item
          key={account.id}
          icon={{ source: Icon.Circle, tintColor: account.on_budget ? Color.Green : Color.Red }}
          title={account.name}
          accessoryTitle={`${activeBudgetCurrency?.currency_symbol ?? '$'} ${formatToReadablePrice(
            account.balance
          ).toString()}`}
          accessoryIcon={{
            source: Icon.Link,
            tintColor: account.direct_import_linked
              ? account.direct_import_in_error
                ? Color.Red
                : Color.Green
              : Color.SecondaryText,
          }}
          actions={
            <ActionPanel>
              <OpenInYnabAction accounts accountId={account.id} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
