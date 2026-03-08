import { Text, useInput } from 'ink';
import { useEffect, useState } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  focus?: boolean;
}

function wordLeft(text: string, pos: number): number {
  let i = pos - 1;
  while (i > 0 && text[i - 1] === ' ') i--;
  while (i > 0 && text[i - 1] !== ' ') i--;
  return i;
}

function wordRight(text: string, pos: number): number {
  let i = pos;
  while (i < text.length && text[i] !== ' ') i++;
  while (i < text.length && text[i] === ' ') i++;
  return i;
}

export function TextInput({ value, onChange, onSubmit, focus = true }: TextInputProps) {
  const [cursor, setCursor] = useState(value.length);

  // Clamp cursor when value shrinks
  useEffect(() => {
    setCursor((c) => Math.min(c, value.length));
  }, [value]);

  useInput(
    (input, key) => {
      if (key.upArrow || key.downArrow || key.tab || (key.ctrl && input === 'c')) return;

      if (key.return) {
        onSubmit?.(value);
        return;
      }

      // Word navigation: Meta+b (word left), Meta+f (word right)
      // Terminals send these for Option+Left/Right on macOS
      if (key.meta && input === 'b') {
        setCursor((c) => wordLeft(value, c));
        return;
      }
      if (key.meta && input === 'f') {
        setCursor((c) => wordRight(value, c));
        return;
      }

      // Navigation
      if (key.leftArrow) {
        setCursor((c) => (key.meta ? wordLeft(value, c) : Math.max(0, c - 1)));
        return;
      }
      if (key.rightArrow) {
        setCursor((c) => (key.meta ? wordRight(value, c) : Math.min(value.length, c + 1)));
        return;
      }
      if (key.home || (key.ctrl && input === 'a')) {
        setCursor(0);
        return;
      }
      if (key.end || (key.ctrl && input === 'e')) {
        setCursor(value.length);
        return;
      }

      // Word delete forward: Meta+d
      if (key.meta && input === 'd') {
        if (cursor < value.length) {
          onChange(value.slice(0, cursor) + value.slice(wordRight(value, cursor)));
        }
        return;
      }

      // Backward delete (Backspace key sends \x7f → key.delete on macOS)
      if (key.backspace || (key.delete && !key.meta)) {
        if (cursor === 0) return;
        onChange(value.slice(0, cursor - 1) + value.slice(cursor));
        setCursor((c) => c - 1);
        return;
      }
      // Word backward delete: Option+Backspace sends \x1b\x7f → key.delete + key.meta
      if (key.delete && key.meta) {
        if (cursor === 0) return;
        const b = wordLeft(value, cursor);
        onChange(value.slice(0, b) + value.slice(cursor));
        setCursor(b);
        return;
      }

      // Kill line (Ctrl+K) / kill to start (Ctrl+U)
      if (key.ctrl && input === 'k') {
        onChange(value.slice(0, cursor));
        return;
      }
      if (key.ctrl && input === 'u') {
        onChange(value.slice(cursor));
        setCursor(0);
        return;
      }

      // Character input
      if (input && !key.ctrl && !key.meta) {
        onChange(value.slice(0, cursor) + input + value.slice(cursor));
        setCursor((c) => c + input.length);
      }
    },
    { isActive: focus },
  );

  if (!focus) {
    return <Text>{value}</Text>;
  }

  const before = value.slice(0, cursor);
  const cursorChar = value[cursor];
  const after = value.slice(cursor + 1);

  return (
    <Text>
      {before}
      <Text inverse>{cursorChar ?? ' '}</Text>
      {after}
    </Text>
  );
}
