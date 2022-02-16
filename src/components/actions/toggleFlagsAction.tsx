import { Action } from '@raycast/api';
import { Shortcuts } from '@constants';

export function ToggleFlagsAction({
  showFlags,
  setShowFlags,
}: {
  showFlags: boolean;
  setShowFlags: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Action
      title={`${showFlags ? 'Hide' : 'Show'} Flags`}
      onAction={() => setShowFlags((s) => !s)}
      shortcut={Shortcuts.ToggleFlags}
    />
  );
}
