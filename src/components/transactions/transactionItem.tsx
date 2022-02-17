import { Icon, List, ActionPanel, Color, Action } from '@raycast/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { type TransactionDetail } from 'ynab';
import { TransactionDetails } from './transactionDetails';
import { useTransaction } from './transactionContext';
import { formatToReadablePrice } from '@lib/utils';
import {
  OpenInYnabAction,
  GroupBySubmenu,
  SortBySubmenu,
  TimelineSubmenu,
  ToggleFlagsAction,
} from '@components/actions';
import { TransactionEditForm } from './transactionEditForm';

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
      subtitle={formatToReadablePrice(transaction.amount).toString()}
      accessoryIcon={showFlags ? { source: Icon.Dot, tintColor: getColor(transaction.flag_color) } : undefined}
      accessoryTitle={dayjs(transaction.date).fromNow()}
      actions={
        <ActionPanel title="Inspect Transaction">
          <ActionPanel.Section>
            <Action.Push title="Show Transaction" target={<TransactionDetails transaction={transaction} />} />
            <Action.Push title="Edit Transaction" target={<TransactionEditForm transaction={transaction} />} />
            <OpenInYnabAction />
          </ActionPanel.Section>
          <ActionPanel.Section title="Modify List View">
            <GroupBySubmenu onGroup={onGroup} currentGroup={state.group} />
            <SortBySubmenu onSort={onSort} currentSort={state.sort} />
            <TimelineSubmenu onTimelineChange={onTimelineChange} currentTimeline={state.timeline ?? 'month'} />
            <ToggleFlagsAction showFlags={showFlags} setShowFlags={setShowFlags} />
          </ActionPanel.Section>
        </ActionPanel>
      }
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
