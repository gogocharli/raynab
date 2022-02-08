import { Icon, List, ActionPanel, Color, PushAction } from '@raycast/api';

import dayjs, { type ManipulateType } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { formatPrice } from '@lib/utils';
import { type TransactionDetail } from 'ynab';
import { TransactionDetails } from './transactionDetails';
import { useTransaction } from './transactionContext';
import { useSharedState } from '@lib/useSharedState';

export function TransactionItem({ transaction }: { transaction: TransactionDetail }) {
  const { onGroup, onSort } = useTransaction();
  const [, setTimeline] = useSharedState<ManipulateType>('timeline', 'month');

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
          <ActionPanel.Section>
            <PushAction title="Show Transaction" target={<TransactionDetails transaction={transaction} />} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <ActionPanel.Submenu title="Group by">
              <ActionPanel.Item title="Category" icon={Icon.TextDocument} onAction={onGroup('category_name')} />
              <ActionPanel.Item title="Payee" icon={Icon.TextDocument} onAction={onGroup('payee_name')} />
              <ActionPanel.Item title="Account" icon={Icon.TextDocument} onAction={onGroup('account_name')} />
            </ActionPanel.Submenu>
            <ActionPanel.Submenu title="Sort By">
              <ActionPanel.Item title="Amount (Low to High)" icon={Icon.TextDocument} onAction={onSort('amount_asc')} />
              <ActionPanel.Item
                title="Amount (High to Low)"
                icon={Icon.TextDocument}
                onAction={onSort('amount_desc')}
              />
              <ActionPanel.Item title="Date (Old to New)" icon={Icon.TextDocument} onAction={onSort('date_asc')} />
              <ActionPanel.Item title="Date (New to Old)" icon={Icon.TextDocument} onAction={onSort('date_desc')} />
            </ActionPanel.Submenu>
            <ActionPanel.Submenu title="Timeline">
              <ActionPanel.Item title="Last Day" icon={Icon.Calendar} onAction={() => setTimeline('day')} />
              <ActionPanel.Item title="Last Week" icon={Icon.Calendar} onAction={() => setTimeline('week')} />
              <ActionPanel.Item title="Last Month" icon={Icon.Calendar} onAction={() => setTimeline('month')} />
              <ActionPanel.Item title="Last Quarter" icon={Icon.Calendar} onAction={() => setTimeline('quarter')} />
              <ActionPanel.Item title="Last Year" icon={Icon.Calendar} onAction={() => setTimeline('year')} />
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
