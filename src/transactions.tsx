import { Icon, List, ActionPanel, Color, PushAction, Detail, CopyToClipboardAction } from '@raycast/api';
import { SWRConfig } from 'swr';

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
  const formattedTransactionAmt = Number(transaction.amount / 1000).toFixed(2);
  return (
    <List.Item
      icon={{ source: Icon.Dot, tintColor: transaction.amount > 0 ? Color.Green : Color.Red }}
      title={transaction.payee_name ?? transaction.id}
      subtitle={formattedTransactionAmt}
      accessoryTitle={transaction.account_name}
      actions={
        <ActionPanel title="Inspect Budget">
          {/* TODO: Add more actions and filters */}
          <PushAction title="Show Transaction" target={<TransactionDetails />} />
        </ActionPanel>
      }
    />
  );
}

function TransactionDetails() {
  /* TODO: Show amount, category, account, payee, etc */
  return (
    <Detail
      markdown="Transaction Payee"
      actions={
        <ActionPanel>
          <CopyToClipboardAction title="Copy Transaction Amount" content="Dollar Billz" />
        </ActionPanel>
      }
    />
  );
}
