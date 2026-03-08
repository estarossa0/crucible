import React, { useState, useEffect } from "react";
import { Box, useStdout } from "ink";
import type { ReactNode } from "react";
import { StatusBar } from "../ui/StatusBar.tsx";
import { KeyHints } from "../ui/KeyHints.tsx";

const DEFAULT_HINTS = [
  { key: "c", action: "chain" },
  { key: "q", action: "quit" },
];

function useTerminalSize() {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    width: stdout?.columns ?? 80,
    height: stdout?.rows ?? 24,
  });

  useEffect(() => {
    if (!stdout) return;

    const onResize = () => {
      setSize({ width: stdout.columns, height: stdout.rows });
    };

    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  return size;
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { width, height } = useTerminalSize();

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      paddingX={1}
    >
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
