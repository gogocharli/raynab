import { Icon, List, ActionPanel, Color, Action } from '@raycast/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { type TransactionDetail } from 'ynab';
import { TransactionDetails } from './transactionDetails';
import { useTransaction } from './transactionContext';
import { formatPrice } from '@lib/utils';
import { useSharedState } from '@lib/useSharedState';
import { GroupNames, onGroupType, onSortType, onTimelineType, Period, SortNames } from '@srcTypes';
import { Shortcuts, URLs } from '@constants';

const INFLOW_ICON = { source: Icon.ChevronUp, tintColor: Color.Green };
const OUTFLOW_ICON = { source: Icon.ChevronDown, tintColor: Color.Red };

export function TransactionItem({ transaction }: { transaction: TransactionDetail }) {
  const {
    onGroup,
    onSort,
    onTimelineChange,
    state,
    flags: [showFlags, setShowFlags],
  } = useTransaction();

  const mainIcon = transaction.amount > 0 ? INFLOW_ICON : OUTFLOW_ICON;

  return (
    <List.Item
      icon={mainIcon}
      id={transaction.id}
      title={transaction.payee_name ?? transaction.id}
      subtitle={formatPrice(transaction.amount)}
      accessoryIcon={showFlags ? { source: Icon.Dot, tintColor: getColor(transaction.flag_color) } : undefined}
      accessoryTitle={dayjs(transaction.date).fromNow()}
      actions={
        <ActionPanel title="Inspect Budget">
          <ActionPanel.Section>
            <Action.Push title="Show Transaction" target={<TransactionDetails transaction={transaction} />} />
            <OpenInYnabAction />
            <Action
              title={`${showFlags ? 'Hide' : 'Show'} Flags`}
              onAction={() => setShowFlags((s) => !s)}
              shortcut={Shortcuts.ToggleFlags}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <GroupBySubmenu onGroup={onGroup} currentGroup={state.group} />
            <SortBySubmenu onSort={onSort} currentSort={state.sort} />
            <TimelineSubMenu onTimelineChange={onTimelineChange} currentTimeline={state.timeline ?? 'month'} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

interface RenderActionIcons<T> {
  defaultIcon: Icon;
  selectedIcon?: Icon;
  currentType: T | null;
}

function renderActionIcon<T>({ defaultIcon, selectedIcon, currentType }: RenderActionIcons<T>) {
  return function (actionType: T) {
    if (actionType === currentType) return { source: selectedIcon ?? Icon.Checkmark, tintColor: Color.Green };

    return { source: defaultIcon, tintColor: Color.SecondaryText };
  };
}

function GroupBySubmenu({ onGroup, currentGroup }: { onGroup: onGroupType; currentGroup: GroupNames | null }) {
  const renderGroupIcon = renderActionIcon<GroupNames>({
    defaultIcon: Icon.TextDocument,
    currentType: currentGroup,
  });

  return (
    <ActionPanel.Submenu title="Group by" shortcut={Shortcuts.Group}>
      <Action title="Category" icon={renderGroupIcon('category_name')} onAction={onGroup('category_name')} />
      <Action title="Payee" icon={renderGroupIcon('payee_name')} onAction={onGroup('payee_name')} />
      <Action title="Account" icon={renderGroupIcon('account_name')} onAction={onGroup('account_name')} />
    </ActionPanel.Submenu>
  );
}

function SortBySubmenu({ onSort, currentSort }: { onSort: onSortType; currentSort: SortNames | null }) {
  const renderSortIcon = renderActionIcon<SortNames>({
    defaultIcon: Icon.Text,
    currentType: currentSort,
  });

  return (
    <ActionPanel.Submenu title="Sort By" shortcut={Shortcuts.Sort}>
      <Action title="Amount (Low to High)" icon={renderSortIcon('amount_asc')} onAction={onSort('amount_asc')} />
      <Action title="Amount (High to Low)" icon={renderSortIcon('amount_desc')} onAction={onSort('amount_desc')} />
      <Action title="Date (Old to New)" icon={renderSortIcon('date_asc')} onAction={onSort('date_asc')} />
      <Action title="Date (New to Old)" icon={renderSortIcon('date_desc')} onAction={onSort('date_desc')} />
    </ActionPanel.Submenu>
  );
}

function TimelineSubMenu({
  onTimelineChange,
  currentTimeline,
}: {
  onTimelineChange: onTimelineType;
  currentTimeline: Period;
}) {
  const renderTimelineIcon = renderActionIcon<Period>({
    defaultIcon: Icon.Calendar,
    currentType: currentTimeline,
  });

  return (
    <ActionPanel.Submenu title="Timeline" shortcut={Shortcuts.Timeline}>
      <Action title="Last Day" icon={renderTimelineIcon('day')} onAction={() => onTimelineChange('day')} />
      <Action title="Last Week" icon={renderTimelineIcon('week')} onAction={() => onTimelineChange('week')} />
      <Action title="Last Month" icon={renderTimelineIcon('month')} onAction={() => onTimelineChange('month')} />
      <Action title="Last Quarter" icon={renderTimelineIcon('quarter')} onAction={() => onTimelineChange('quarter')} />
      <Action title="Last Year" icon={renderTimelineIcon('year')} onAction={() => onTimelineChange('year')} />
    </ActionPanel.Submenu>
  );
}

// TODO take a look at conditional types https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
interface OpenInYnabActionProps {
  accounts?: boolean;
  accountId?: string;
  yearMonth?: string;
}
function OpenInYnabAction(props: OpenInYnabActionProps) {
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

function getColor(color: TransactionDetail.FlagColorEnum | null | undefined) {
  const stringColor = color?.toString();
  switch (stringColor) {
    case 'red':
      return Color.Red;
    case 'green':
      return Color.Green;
    case 'purple':
      return Color.Purple;
    case 'orange':
      return Color.Orange;
    case 'blue':
      return Color.Blue;
    default:
      return;
  }
}
