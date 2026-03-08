import { Box, Text } from 'ink';

import { useApp } from '@logic/AppContext';
import { SelectedChain } from '@logic/SelectedChain';

export function StatusBar() {
  const { mode } = useApp();

  return (
    <Box backgroundColor="black" gap={2}>
      <Text bold color="green">
        {mode.toUpperCase()}
      </Text>
      <Text dimColor>|</Text>
      <SelectedChain />
    </Box>
  );
}
