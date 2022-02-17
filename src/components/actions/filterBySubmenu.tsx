import { onFilterType, Filter } from '@srcTypes';

import { ActionPanel, Action, Icon, Color } from '@raycast/api';
import { Shortcuts } from '@constants';

export function FilterBySubmenu({ onFilter, currentFilter }: { onFilter: onFilterType; currentFilter: Filter }) {
  return (
    <ActionPanel.Submenu title="Group by" shortcut={Shortcuts.Filter}>
      <Action
        title="Inflow (Positive)"
        icon={currentFilter?.value === 'inflow' ? { source: Icon.Checkmark, tintColor: Color.Green } : Icon.List}
        onAction={onFilter({ key: 'amount', value: 'inflow' })}
      />
      <Action
        title="Outflow (Negative)"
        icon={currentFilter?.value === 'outflow' ? { source: Icon.Checkmark, tintColor: Color.Green } : Icon.List}
        onAction={onFilter({ key: 'amount', value: 'outflow' })}
      />
    </ActionPanel.Submenu>
  );
}
