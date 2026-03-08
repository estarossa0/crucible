import { Box } from 'ink';
import { type ReactNode } from 'react';

import { useTerminalSize } from '@hooks/index';
import { useApp } from '@logic/AppContext';
import { AppKeyBindings } from '@logic/AppKeyBindings';
import { KeyHints, StatusBar } from '@ui/index';

const OVERLAY_HINTS = [
  { key: '\u2191\u2193', action: 'navigate' },
  { key: 'enter', action: 'select' },
  { key: 'esc', action: 'close' },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { width, height } = useTerminalSize();
  const { enabledOverlay } = useApp();

  return (
    <Box flexDirection="column" width={width} height={height} borderStyle="round" paddingX={1}>
      <Box flexDirection="column-reverse">
        <Box>{children}</Box>

        <Box>
          <StatusBar />
        </Box>
      </Box>

      <Box justifyContent="space-between">
        <Box>{/* mode-specific keybindings (left) */}</Box>
        {enabledOverlay !== null ? (
          <Box>
            <KeyHints hints={OVERLAY_HINTS} />
          </Box>
        ) : (
          <AppKeyBindings />
        )}
      </Box>
    </Box>
  );
}
