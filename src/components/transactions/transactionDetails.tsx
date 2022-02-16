import { Action, ActionPanel, Detail } from '@raycast/api';
import { type TransactionDetail } from 'ynab';
import dayjs from 'dayjs';

import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

import { formatToReadablePrice } from '@lib/utils';

export function TransactionDetails({ transaction }: { transaction: TransactionDetail }) {
  const markdown = `
  # ${transaction.amount > 0 ? 'Inflow to' : 'Outflow from'} ${transaction.account_name}

  - **Amount**: ${formatToReadablePrice(transaction.amount)} CAD
  - **Payee**: ${transaction.payee_name ?? 'Not Specified'}
  - **Date**: ${dayjs(transaction.date).format('LL')}
  - **Category**: ${transaction.category_name ?? 'Not Specified'}
  `;
  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Transaction Amount" content="Dollar Billz" />
        </ActionPanel>
      }
    />
  );
}
