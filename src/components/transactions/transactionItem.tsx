import { Filter, GroupNames } from '@srcTypes';

import { Icon, List, ActionPanel, Color, PushAction } from '@raycast/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { formatPrice } from '@lib/utils';
import { type TransactionDetail } from 'ynab';
import { TransactionDetails } from './transactionDetails';
import { useTransaction } from './transactionContext';

export function TransactionItem({ transaction }: { transaction: TransactionDetail }) {
  const { onGroup, onFilter } = useTransaction();
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
              {/* TODO Will need to map over all existing categories */}
              <ActionPanel.Item
                title="Subscriptions"
                icon={Icon.TextDocument}
                onAction={onFilter({ key: 'category_name', value: 'Subscriptions' })}
              />
            </ActionPanel.Submenu>
            <ActionPanel.Submenu title="Account">
              {/* TODO Will need to map over all existing accounts */}
              <ActionPanel.Item
                title="TD Checking"
                icon={Icon.TextDocument}
                onAction={onFilter({ key: 'account_name', value: 'TD Checking' })}
              />
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
