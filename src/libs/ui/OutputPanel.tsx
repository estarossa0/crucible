import { Box, Text } from 'ink';

interface OutputPanelProps {
  stdout: string;
  stderr: string;
  isLoading: boolean;
}

export function OutputPanel({ stdout, stderr, isLoading }: OutputPanelProps) {
  if (isLoading) {
    return (
      <Box flexGrow={1} marginTop={1}>
        <Text color="yellow">⠋ Running...</Text>
      </Box>
    );
  }

  if (!stdout && !stderr) {
    return null;
  }

  return (
    <Box flexDirection="column" flexGrow={1} marginTop={1}>
      {stdout && <Text>{stdout}</Text>}
      {stderr && <Text color="red">{stderr}</Text>}
    </Box>
  );
}
