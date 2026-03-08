import { Box, Text } from 'ink';

import { useApp } from '@logic/AppContext';

export function StatusBar() {
  const { mode, chain } = useApp();

  return (
    <Box gap={2}>
      <Text bold color="green">
        {mode.toUpperCase()}
      </Text>
      <Text dimColor>|</Text>
      <Text color="yellow">{chain}</Text>
    </Box>
  );
}
