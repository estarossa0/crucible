import { Box } from 'ink';
import { type ReactNode } from 'react';

import { useTerminalSize } from '@hooks/index';
import { useApp } from '@logic/AppContext';
import { AppKeyBindings } from '@logic/AppKeyBindings';
import { KeyHints, StatusBar } from '@ui/index';

const arrowUp = '\u2191';
const arrowDown = '\u2193';
const OVERLAY_HINTS = [
  { key: `${arrowUp}${arrowDown}`, action: 'navigate' },
  { key: 'tab', action: 'fill' },
  { key: 'enter', action: 'select' },
  { key: 'esc', action: 'close' },
];

interface KeyHint {
  key: string;
  action: string;
  disabled?: boolean;
}

interface LayoutProps {
  children: ReactNode;
  modeHints?: KeyHint[];
}

export function Layout({ children, modeHints }: LayoutProps) {
  const { width, height } = useTerminalSize();
  const { enabledOverlay } = useApp();

  return (
    <Box
      justifyContent="space-between"
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      paddingX={1}
    >
      <Box flexGrow={1}>{children}</Box>

      <Box justifyContent="space-between" flexDirection="column">
        {/* mode / network */}
        <StatusBar />

        {/* KeyHints  */}
        <Box
          borderColor="whiteBright"
          borderTop
          borderStyle="classic"
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          justifyContent="space-between"
        >
          <Box>{modeHints && <KeyHints hints={modeHints} />}</Box>
          {enabledOverlay !== null ? (
            <Box>
              <KeyHints hints={OVERLAY_HINTS} />
            </Box>
          ) : (
            <AppKeyBindings />
          )}
        </Box>
      </Box>
    </Box>
  );
}
