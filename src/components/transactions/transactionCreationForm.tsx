import { formatToYnabPrice } from '@lib/utils';
import { ActionPanel, Action, Form, Icon, Color, showToast, Toast } from '@raycast/api';
import { useState } from 'react';
import { createTransaction } from '@lib/api';
import { useAccounts } from '@hooks/useAccounts';
import { useCategoryGroups } from '@hooks/useCategoryGroups';
import { nanoid as random } from 'nanoid';

import { SaveTransaction } from 'ynab';
interface Values {
  date: Date;
  account_id: string;
  amount: string;
  payee_name: string;
  memo?: string;
  flag_color: SaveTransaction.FlagColorEnum | '';
  category_id: string;
  cleared: boolean;
}

export function TransactionCreationForm({ categoryId, accountId }: { categoryId?: string; accountId?: string }) {
  const [date, setDate] = useState(new Date());
  const [payee, setPayee] = useState('');
  const [memo, setMemo] = useState('');
  const [cleared, setCleared] = useState(false);

  const { data: accounts = [] } = useAccounts();
  const { data: categoryGroups } = useCategoryGroups();

  async function handleSubmit(values: Values) {
    if (!isValidFormSubmission(values)) return;

    const requestData = createTransactionData(values);

    const toast = await showToast({ style: Toast.Style.Animated, title: 'Updating Transaction' });

    createTransaction('last-used', requestData).then(() => {
      toast.style = Toast.Style.Success;
      toast.title = 'Transaction updated successfully';
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
      <Form.TextField id="amount" title="Amount" defaultValue="0" />
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

      <Form.Dropdown id="flag_color" title="Flag Color" defaultValue="">
        <Form.Dropdown.Item value="" title="No Flag" icon={{ source: Icon.Dot }} />
        <Form.Dropdown.Item
          value={SaveTransaction.FlagColorEnum.Red.toString()}
          title="Red"
          icon={{ source: Icon.Dot, tintColor: Color.Red }}
        />
        <Form.Dropdown.Item
          value={SaveTransaction.FlagColorEnum.Orange.toString()}
          title="Orange"
          icon={{ source: Icon.Dot, tintColor: Color.Orange }}
        />
        <Form.Dropdown.Item
          value={SaveTransaction.FlagColorEnum.Yellow.toString()}
          title="Yellow"
          icon={{ source: Icon.Dot, tintColor: Color.Yellow }}
        />
        <Form.Dropdown.Item
          value={SaveTransaction.FlagColorEnum.Green.toString()}
          title="Green"
          icon={{ source: Icon.Dot, tintColor: Color.Green }}
        />
        <Form.Dropdown.Item
          value={SaveTransaction.FlagColorEnum.Blue.toString()}
          title="Blue"
          icon={{ source: Icon.Dot, tintColor: Color.Blue }}
        />
        <Form.Dropdown.Item
          value={SaveTransaction.FlagColorEnum.Purple.toString()}
          title="Purple"
          icon={{ source: Icon.Dot, tintColor: Color.Purple }}
        />
      </Form.Dropdown>
    </Form>
  );
}

const REQUIRED_FORM_VALUES = new Map([
  ['account_id', 'Account'],
  ['category_id', 'Category'],
  ['payee_name', 'Payee'],
]);
function isValidFormSubmission(values: Values) {
  let isValid = true;

  Object.entries({ ...values }).forEach(([key, value]) => {
    if (!value && REQUIRED_FORM_VALUES.get(key)) {
      isValid = false;

      showToast({
        style: Toast.Style.Failure,
        title: `The ${REQUIRED_FORM_VALUES.get(key)} is required`,
        message: 'Please enter a valid value for the field.',
      });

      return;
    }
  });

  if (Number.isNaN(Number(values.amount))) {
    isValid = false;
    showToast({
      style: Toast.Style.Failure,
      title: `Incorrect value for the amount`,
      message: `${values.amount} is not a valid number`,
    });
  }

  return isValid;
}

function createTransactionData(values: Values) {
  return {
    ...values,
    date: values.date.toISOString(),
    flag_color: values.flag_color || null,
    amount: formatToYnabPrice(values.amount),
    memo: values.memo || null,
    approved: true,
    cleared: values.cleared ? SaveTransaction.ClearedEnum.Cleared : SaveTransaction.ClearedEnum.Uncleared,
  };
}