import { Icon, List, ActionPanel, Color, PushAction } from '@raycast/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { formatPrice } from '@lib/utils';
import { type TransactionDetail } from 'ynab';
import { TransactionDetails } from './transactionDetails';
import { GroupNames } from '@srcTypes';

export function TransactionItem({
  transaction,
  onGrouping,
}: {
  transaction: TransactionDetail;
  onGrouping: (groupType: GroupNames) => () => void;
}) {
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
          <PushAction title="Show Transaction" target={<TransactionDetails transaction={transaction} />} />
          <ActionPanel.Submenu title="Group by">
            <ActionPanel.Item title="Category" icon={Icon.TextDocument} onAction={onGrouping('category_name')} />
            <ActionPanel.Item title="Payee" icon={Icon.TextDocument} onAction={onGrouping('payee_name')} />
            <ActionPanel.Item title="Account" icon={Icon.TextDocument} onAction={onGrouping('account_name')} />
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    />
  );
}
