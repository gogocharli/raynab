import { formatToReadablePrice, formatToYnabPrice } from '@lib/utils';
import { ActionPanel, Action, Form, Icon, Color, showToast, useNavigation, Toast } from '@raycast/api';
import { FlagColor, TransactionDetail } from '@srcTypes';
import { useState } from 'react';
import { updateTransaction } from '@lib/api';

interface Values {
  date: Date;
  amount: string;
  payee_name: string;
  memo?: string;
  flag_color: FlagColor | '';
}

export function TransactionEditForm({ transaction }: { transaction: TransactionDetail }) {
  const [date, setDate] = useState(new Date(transaction.date));
  const [amount, setAmount] = useState(formatToReadablePrice(transaction.amount).toString());
  const [payee, setPayee] = useState(transaction.payee_name ?? '');
  const [memo, setMemo] = useState(transaction.memo ?? '');
  const [flag, setFlag] = useState<FlagColor | undefined>(transaction.flag_color as unknown as FlagColor);

  const { pop } = useNavigation();

  // TODO sanitize flag color and other areas which might conflict
  // TODO send actual request
  async function handleSubmit(values: Values) {
    const submittedValues = {
      ...transaction,
      ...values,
      date: values.date.toISOString(),
      flag_color: values.flag_color || null,
      amount: formatToYnabPrice(amount),
      memo: values.memo || null,
    };
    // Unfortunately a type enum problem I haven't found a solution for yet.

    const toast = await showToast({ style: Toast.Style.Animated, title: 'Updating Transaction' });
    updateTransaction('last-used', transaction.id, submittedValues).then(() => {
      toast.style = Toast.Style.Success;
      toast.title = 'Transaction updated successfully';
      pop();
    });
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
      <Form.TextArea id="memo" value={memo} onChange={setMemo} />
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
