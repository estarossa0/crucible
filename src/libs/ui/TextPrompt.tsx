import { Box, Text } from 'ink';

import { TextInput } from './TextInput';

interface TextPromptProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  isFocused: boolean;
}

export function TextPrompt({ label, value, onChange, onSubmit, isFocused }: TextPromptProps) {
  return (
    <Box>
      <Text dimColor={!isFocused}>{isFocused ? '> ' : '  '}</Text>
      <Text dimColor={!isFocused} bold={isFocused} color={isFocused ? 'cyan' : undefined}>
        {label}:{' '}
      </Text>
      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} focus={isFocused} />
    </Box>
  );
}
