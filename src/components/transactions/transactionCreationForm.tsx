import { formatToYnabPrice } from '@lib/utils';
import { ActionPanel, Action, Form, Icon, Color, showToast, Toast, confirmAlert } from '@raycast/api';
import { FlagColor } from '@srcTypes';
import { useEffect, useState } from 'react';
import { createTransaction } from '@lib/api';
import { useAccounts } from '@hooks/useAccounts';
import { useCategoryGroups } from '@hooks/useCategoryGroups';
import { nanoid as random } from 'nanoid';

interface Values {
  date: Date;
  account_id: string;
  amount: string;
  payee_name: string;
  memo?: string;
  flag_color: FlagColor | '';
  category_id: string;
  cleared: boolean;
}

export function TransactionCreationForm({ categoryId, accountId }: { categoryId?: string; accountId?: string }) {
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('0');
  const [payee, setPayee] = useState('');
  const [memo, setMemo] = useState('');
  const [flag, setFlag] = useState<FlagColor | undefined>();
  const [cleared, setCleared] = useState(false);

  const { data: accounts = [] } = useAccounts();
  const { data: categoryGroups } = useCategoryGroups();

  // Parse currency data and validate
  // Add Alert confirmation
  async function handleSubmit(values: Values) {
    const submittedValues = {
      ...values,
      date: values.date.toISOString(),
      flag_color: values.flag_color || null,
      amount: formatToYnabPrice(amount),
      memo: values.memo || null,
    };

    if (await confirmAlert({ title: 'Are you sure you want to create this transaction?' })) {
      const toast = await showToast({ style: Toast.Style.Animated, title: 'Updating Transaction' });
      console.log(submittedValues);

      toast.style = Toast.Style.Success;
      toast.title = 'Transaction updated successfully';

      // @ts-expect-error Unfortunately a type enum problem I haven't found a solution for yet.
      // createTransaction('last-used', transaction.id, submittedValues).then(() => {
      //   toast.style = Toast.Style.Success;
      //   toast.title = 'Transaction updated successfully';
      // });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Edit Transaction"
        text="Change one or more of the following fields to update the transaction."
      />
      <Form.DatePicker id="date" title="Date of Transaction" value={date} onChange={setDate} />
      <Form.TextField id="amount" title="Amount" value={amount} onChange={setAmount} />
      <Form.TextField id="payee_name" title="Payee Name" value={payee} onChange={setPayee} />
      <Form.Dropdown id="account_id" title="Account" defaultValue={accountId}>
        {accounts.map((account) => (
          <Form.Dropdown.Item key={account?.id ?? random()} value={account?.id} title={account?.name} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="category_id" title="Category" defaultValue={categoryId}>
        {categoryGroups
          ?.flatMap((g) => g.categories)
          .map((category) => (
            <Form.Dropdown.Item key={category?.id ?? random()} value={category?.id} title={category?.name} />
          ))}
      </Form.Dropdown>
      <Form.Separator />
      <Form.Checkbox id="cleared" label="Has the transaction cleared?" value={cleared} onChange={setCleared} />
      <Form.TextArea id="memo" title="Memo" value={memo} onChange={setMemo} />
      {/* @ts-expect-error The form API doesn't support passing arbitrary types to the value yet */}
      <Form.Dropdown id="flag_color" title="Flag Color" value={flag} onChange={setFlag}>
        <Form.Dropdown.Item value="" title="No Flag" icon={{ source: Icon.Dot }} />
        <Form.Dropdown.Item value="red" title="Red" icon={{ source: Icon.Dot, tintColor: Color.Red }} />
        <Form.Dropdown.Item value="orange" title="Orange" icon={{ source: Icon.Dot, tintColor: Color.Orange }} />
        <Form.Dropdown.Item value="yellow" title="Yellow" icon={{ source: Icon.Dot, tintColor: Color.Yellow }} />
        <Form.Dropdown.Item value="green" title="Green" icon={{ source: Icon.Dot, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="blue" title="Blue" icon={{ source: Icon.Dot, tintColor: Color.Blue }} />
        <Form.Dropdown.Item value="purple" title="Purple" icon={{ source: Icon.Dot, tintColor: Color.Purple }} />
      </Form.Dropdown>
    </Form>
  );
}
