import { Box, useInput } from 'ink';

import { OverlayType, useApp } from '@logic/AppContext';
import { KeyHints } from '@ui/KeyHints';

const DEFAULT_HINTS = [
  { key: 'c', action: 'chain' },
  { key: 'q', action: 'quit' },
];

export function AppKeyBindings() {
  const { enabledOverlay, openOverlay, exit } = useApp();

  useInput((input, key) => {
    if (enabledOverlay !== null) return;

    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
    if (input === 'c') {
      openOverlay(OverlayType.ChainSelect);
    }
  });

  return (
    <Box>
      <KeyHints hints={DEFAULT_HINTS} />
    </Box>
  );
}
