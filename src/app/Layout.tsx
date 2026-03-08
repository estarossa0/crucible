import { Box } from 'ink';
import { type ReactNode } from 'react';
import { useTerminalSize } from '../hooks/index.ts';
import { KeyHints } from '../ui/KeyHints.tsx';
import { StatusBar } from '../ui/StatusBar.tsx';

const DEFAULT_HINTS = [
  { key: 'c', action: 'chain' },
  { key: 'q', action: 'quit' },
];

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

      <Box>
        <KeyHints hints={DEFAULT_HINTS} />
      </Box>
    </Box>
  );
}
