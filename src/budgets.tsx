import {
  Icon,
  List,
  ActionPanel,
  Color,
  getLocalStorageItem,
  setLocalStorageItem,
  showToast,
  ToastStyle,
} from '@raycast/api';
import { useState, useEffect } from 'react';
import { SWRConfig } from 'swr';

import { cacheConfig } from './lib/cache';
import { useBudgets } from './lib/ynab';

export default function Command() {
  return (
    <SWRConfig value={cacheConfig}>
      <BudgetList />
    </SWRConfig>
  );
}

function BudgetList() {
  const { data: budgets, isValidating } = useBudgets();

  const [activeBudgetId, setActiveBudget] = useState('');

  useEffect(() => {
    async function getBudgetPreference() {
      const savedPreference = (await getLocalStorageItem('activeBudget')) as string;
      setActiveBudget(savedPreference ?? '');
    }

    getBudgetPreference();
  }, []);

  useEffect(() => {
    async function updateBudgetPreference() {
      const savedPreference = (await getLocalStorageItem('activeBudget')) as string;
      if (activeBudgetId !== savedPreference) {
        await setLocalStorageItem('activeBudget', activeBudgetId);
      }
    }
    updateBudgetPreference();
  }, [activeBudgetId]);

  // For now we'll only show one budget at a time
  function handleToggle(budgetId: string) {
    if (activeBudgetId == budgetId) {
      showToast(ToastStyle.Failure, 'Budget already selected');
      return;
    }

    setActiveBudget(budgetId);
  }

  return (
    <List isLoading={isValidating}>
      {budgets?.map((budget) => (
        <BudgetItem
          key={budget.id}
          budget={budget}
          selectedId={activeBudgetId}
          onToggle={() => handleToggle(budget.id)}
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
  budget: BudgetInfo;
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

interface BudgetInfo {
  id: string;
  name: string;
  last_modified_on?: string | null;
}
