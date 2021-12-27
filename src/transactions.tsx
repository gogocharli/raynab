import { Icon, List, ActionPanel, Color, PushAction, Detail, CopyToClipboardAction } from '@raycast/api';
import { SWRConfig } from 'swr';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

import { cacheConfig } from './lib/cache';
import { useSharedState } from './lib/useSharedState';
import { useTransactions } from './lib/ynab';

import type { TransactionDetail } from 'ynab';

export default function Command() {
  return (
    <SWRConfig value={cacheConfig}>
      <TransactionList />
    </SWRConfig>
  );
}

function TransactionList() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const { data: transactions, isValidating } = useTransactions(activeBudgetId);

  /* TODO: Hold new state to transition between different views (By Category, By Account, etc) */
  return (
    <List isLoading={isValidating}>
      {transactions?.map((t) => (
        <TransactionItem transaction={t} key={t.id} />
      ))}
    </List>
  );
}

function TransactionItem({ transaction }: { transaction: TransactionDetail }) {
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
          {/* TODO: Add more actions and filters */}
          <PushAction title="Show Transaction" target={<TransactionDetails transaction={transaction} />} />
        </ActionPanel>
      }
    />
  );
}

function TransactionDetails({ transaction }: { transaction: TransactionDetail }) {
  const markdown = `
  # ${transaction.amount > 0 ? 'Inflow to' : 'Outflow from'} ${transaction.account_name}

  - **Amount**: ${formatPrice(transaction.amount)} CAD
  - **Payee**: ${transaction.payee_name ?? 'Not Specified'}
  - **Date**: ${dayjs(transaction.date).format('LL')}
  - **Category**: ${transaction.category_name ?? 'Not Specified'}
  `;
  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <CopyToClipboardAction title="Copy Transaction Amount" content="Dollar Billz" />
        </ActionPanel>
      }
    />
  );
}

function formatPrice(price: number) {
  return `${Number(price / 1000).toFixed(2)}`;
}
