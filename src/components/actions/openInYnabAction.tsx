import { Action } from '@raycast/api';
import { useSharedState } from 'hooks/useSharedState';
import { Shortcuts, URLs } from '@constants';

interface OpenInYnabActionProps {
  accounts?: boolean;
  accountId?: string;
  yearMonth?: string;
}

export function OpenInYnabAction(props: OpenInYnabActionProps) {
  const [activeBudgetId = ''] = useSharedState('activeBudgetId', '');

  const constructUrl = (budgetId: string, { accounts, accountId, yearMonth } = props) => {
    const budgetPath = `${URLs.ynab}/${budgetId}/`;

    if (yearMonth) return budgetPath + yearMonth;

    if (accounts) return `${budgetPath}/accounts/${accountId ?? ''}`;

    return budgetPath;
  };

  return (
    <Action.OpenInBrowser
      title={`Open ${props.accounts ? `Account${props.accountId ? '' : 's'}` : 'Budget'} in YNAB`}
      url={constructUrl(activeBudgetId, props)}
      shortcut={Shortcuts.ViewInBrowser}
    />
  );
}
