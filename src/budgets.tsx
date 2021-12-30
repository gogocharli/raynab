import { Icon, List, ActionPanel, Color } from '@raycast/api';
import { SWRConfig } from 'swr';

import { cacheConfig } from '@lib/cache';
import { useSharedState } from '@lib/useSharedState';
import { useBudgets, type BudgetSummary } from '@lib/ynab';

export default function Command() {
  return (
    <SWRConfig value={cacheConfig}>
      <BudgetList />
    </SWRConfig>
  );
}

function BudgetList() {
  const { data: budgets, isValidating } = useBudgets();

  const [activeBudgetId, setActiveBudgetId] = useSharedState('activeBudgetId', '');

  return (
    <List isLoading={isValidating}>
      {budgets?.map((budget) => (
        <BudgetItem
          key={budget.id}
          budget={budget}
          selectedId={activeBudgetId ?? ''}
          onToggle={() => setActiveBudgetId(budget?.id)}
        />
      ))}
    </List>
  );
}

function BudgetItem({
  budget,
  selectedId,
  onToggle,
}: {
  budget: BudgetSummary;
  selectedId: string;
  onToggle: () => void;
}) {
  return (
    <List.Item
      icon={Icon.Document}
      title={budget.name}
      accessoryIcon={budget.id === selectedId ? { source: Icon.Checkmark, tintColor: Color.Green } : Icon.Circle}
      actions={
        <ActionPanel title="Inspect Budget">
          <ActionPanel.Item title="Select Budget" onAction={onToggle} />
        </ActionPanel>
      }
    />
  );
}
