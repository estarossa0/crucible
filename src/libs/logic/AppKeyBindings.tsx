import { Box, useInput } from 'ink';
import { useApp } from '../../app/index';
import { KeyHints } from '../../ui/KeyHints';

const DEFAULT_HINTS = [
  { key: 'c', action: 'chain' },
  { key: 'q', action: 'quit' },
];

export function AppKeyBindings() {
  const { cycleChain, exit } = useApp();

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
    if (input === 'c') {
      cycleChain();
    }
  });

  return (
    <Box>
      <KeyHints hints={DEFAULT_HINTS} />
    </Box>
  );
}
