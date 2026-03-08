import { Box, Text } from 'ink';

interface KeyHint {
  key: string;
  action: string;
  disabled?: boolean;
}

interface KeyHintsProps {
  hints: KeyHint[];
}

export function KeyHints({ hints }: KeyHintsProps) {
  return (
    <Box gap={2}>
      {hints.map((hint) => (
        <Box key={`${hint.key}:${hint.action}`}>
          <Text dimColor={hint.disabled} bold color="cyan">
            {hint.key}
          </Text>
          <Text dimColor={hint.disabled}>:{hint.action}</Text>
        </Box>
      ))}
    </Box>
  );
}
