import { type Keyboard } from '@raycast/api';

interface Constants {
  ViewInBrowser: Keyboard.Shortcut;
  ToggleFlags: Keyboard.Shortcut;
  Group: Keyboard.Shortcut;
  Sort: Keyboard.Shortcut;
  Timeline: Keyboard.Shortcut;
  Edit: Keyboard.Shortcut;
}

export const Shortcuts: Constants = {
  ViewInBrowser: {
    modifiers: ['cmd'],
    key: 'o',
  },
  ToggleFlags: { modifiers: ['cmd'], key: 'f' },
  Group: { modifiers: ['cmd'], key: 'g' },
  Sort: { modifiers: ['cmd'], key: 's' },
  Timeline: { modifiers: ['cmd'], key: 't' },
  Edit: { modifiers: ['cmd'], key: 'e' },
};
