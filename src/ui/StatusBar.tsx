import React from "react";
import { Box, Text } from "ink";
import { useAppContext } from "../app/AppContext.tsx";

export function StatusBar() {
  const { mode, chain } = useAppContext();

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
