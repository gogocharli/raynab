import { OpenInYnabAction } from '@components/actions';
import { useAccounts } from '@hooks/useAccounts';
import { formatToReadablePrice } from '@lib/utils';
import { ActionPanel, Color, Icon, List } from '@raycast/api';

export function AccountView() {
  const { data: accounts, isValidating } = useAccounts();

  return (
    <List isLoading={isValidating}>
      {accounts?.map((account) => (
        <List.Item
          key={account.id}
          icon={{ source: Icon.Circle, tintColor: account.on_budget ? Color.Green : Color.Red }}
          title={account.name}
          accessoryTitle={formatToReadablePrice(account.balance).toString()}
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
