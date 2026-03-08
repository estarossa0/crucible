import { Box, Text, useInput } from 'ink';

export interface SelectOption<T> {
  label: string;
  value: T;
}

interface SelectProps<T> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  onConfirm: (value: T) => void;
  onCancel: () => void;
}

export function Select<T>({ options, value, onChange, onConfirm, onCancel }: SelectProps<T>) {
  useInput((_input, key) => {
    if (key.return) {
      if (options.length > 0) onConfirm(value);
      return;
    }
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.upArrow || key.downArrow) {
      const currentIdx = options.findIndex((o) => o.value === value);
      // Modulo wraps the index: down from last → first, up from first → last
      // +length before % prevents negative modulo (e.g. (0-1+8)%8=7 instead of -1)
      const nextIdx = key.downArrow
        ? (currentIdx + 1) % options.length
        : (currentIdx - 1 + options.length) % options.length;
      const next = options[nextIdx];
      if (next) onChange(next.value);
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((option) => {
        const isHighlighted = option.value === value;

        return (
          <Text
            key={String(option.value)}
            bold={isHighlighted}
            color={isHighlighted ? 'cyan' : undefined}
          >
            {isHighlighted ? '> ' : '  '}
            {option.label}
          </Text>
        );
      })}
    </Box>
  );
}
