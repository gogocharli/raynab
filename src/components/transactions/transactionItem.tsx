import { Icon, List, ActionPanel, Color, PushAction } from '@raycast/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { formatPrice } from '@lib/utils';
import { type TransactionDetail } from 'ynab';
import { TransactionDetails } from './transactionDetails';
import { useTransaction } from './transactionContext';
import { useAccounts, useCategoryGroups, usePayees } from '@lib/ynab';

export function TransactionItem({ transaction }: { transaction: TransactionDetail }) {
  const { onGroup, onFilter } = useTransaction();
  const { data: categoryGroups } = useCategoryGroups();
  const { data: accounts } = useAccounts();
  // const { data: payees } = usePayees();

  const mainIcon =
    transaction.amount > 0
      ? { source: Icon.ChevronUp, tintColor: Color.Green }
      : { source: Icon.ChevronDown, tintColor: Color.Red };
  return (
    <List.Item
      icon={mainIcon}
      title={transaction.payee_name ?? transaction.id}
      subtitle={formatPrice(transaction.amount)}
      accessoryTitle={dayjs(transaction.date).fromNow()}
      actions={
        <ActionPanel title="Inspect Budget">
          {/* TODO: Add filters */}
          <ActionPanel.Section>
            <PushAction title="Show Transaction" target={<TransactionDetails transaction={transaction} />} />
            <ActionPanel.Submenu title="Group by">
              <ActionPanel.Item title="Category" icon={Icon.TextDocument} onAction={onGroup('category_name')} />
              <ActionPanel.Item title="Payee" icon={Icon.TextDocument} onAction={onGroup('payee_name')} />
              <ActionPanel.Item title="Account" icon={Icon.TextDocument} onAction={onGroup('account_name')} />
            </ActionPanel.Submenu>
          </ActionPanel.Section>
          <ActionPanel.Section title="Filter">
            <ActionPanel.Submenu title="Category">
              {categoryGroups
                ?.flatMap((cG) => cG.categories)
                .map(({ name: categoryName, id }) => (
                  <ActionPanel.Item
                    title={categoryName}
                    icon={Icon.TextDocument}
                    key={id}
                    onAction={onFilter({ key: 'category_name', value: categoryName })}
                  />
                ))}
            </ActionPanel.Submenu>
            <ActionPanel.Submenu title="Account">
              {accounts?.map(({ name: accountName, id }) => (
                <ActionPanel.Item
                  title={accountName}
                  icon={Icon.TextDocument}
                  key={id}
                  onAction={onFilter({ key: 'account_name', value: accountName })}
                />
              ))}
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
