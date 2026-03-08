import { Box } from 'ink';
import { type ReactNode } from 'react';

import { useTerminalSize } from '@hooks/index';
import { AppKeyBindings } from '@logic/index';
import { StatusBar } from '@ui/StatusBar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { width, height } = useTerminalSize();

  return (
    <Box flexDirection="column" width={width} height={height} borderStyle="round" paddingX={1}>
      <Box>
        <StatusBar />
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {children}
      </Box>

      <Box justifyContent="space-between">
        <Box>{/* mode-specific keybindings (left) */}</Box>
        <AppKeyBindings />
      </Box>
    </Box>
  );
}
