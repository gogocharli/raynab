import { Icon, List, ActionPanel, Color, PushAction, Detail, CopyToClipboardAction, randomId } from '@raycast/api';
import { SWRConfig } from 'swr';

import { useState } from 'react';
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

type GroupTypes = 'category' | 'payee' | 'account';
type GroupNames = `${GroupTypes}_name`;
interface Group<T> {
  id: string;
  title: string;
  items: T[];
}

function TransactionList() {
  const [activeBudgetId] = useSharedState('activeBudgetId', '');
  const { data: transactions, isValidating } = useTransactions(activeBudgetId);

  const [groupBy, setGroupBy] = useState<GroupNames | null>(null);

  /* TODO: Hold new state for filters */
  // const [filter, setFilter] = useState(null);

  const groups =
    groupBy &&
    transactions?.reduce<Map<string, Group<TransactionDetail>>>((groupMap, currentTransaction) => {
      const groupName = currentTransaction[groupBy] ?? '';

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          id: `${groupName}-${randomId()}`,
          title: groupName,
          items: [],
        });
      }

      const previousGroup = groupMap.get(groupName) as Group<TransactionDetail>;
      groupMap.set(groupName, { ...previousGroup, items: [...previousGroup?.items, currentTransaction] });

      return groupMap;
    }, new Map());

  const handleGrouping = (groupType: GroupNames | null) => () => setGroupBy(groupType);

  return (
    <List isLoading={isValidating}>
      {groups
        ? Array.from(groups).map(([, group]) => (
            <List.Section
              title={group.title}
              key={group.id}
              children={group.items.map((t) => (
                <TransactionItem transaction={t} key={t.id} onGrouping={handleGrouping} />
              ))}
            />
          ))
        : transactions?.map((t) => <TransactionItem transaction={t} key={t.id} onGrouping={handleGrouping} />)}
    </List>
  );
}

function TransactionItem({
  transaction,
  onGrouping,
}: {
  transaction: TransactionDetail;
  onGrouping: (groupType: GroupNames | null) => () => void;
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
