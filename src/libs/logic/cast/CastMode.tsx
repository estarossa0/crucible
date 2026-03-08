import { Box, useInput } from 'ink';
import { useState } from 'react';

import { useCommandRunner } from '@hooks/useCommandRunner';
import { useApp } from '@logic/AppContext';
import { castCommands } from '@logic/commands';
import { OutputPanel, TextPrompt } from '@ui/index';

const command = castCommands[0] as (typeof castCommands)[number];

export function CastMode() {
  const { enabledOverlay } = useApp();
  const isActive = enabledOverlay === null;

  const [focusIndex, setFocusIndex] = useState(0);
  const { fieldValues, stdout, stderr, isLoading, setFieldValue, execute } = useCommandRunner(
    'cast',
    command,
  );

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        setFocusIndex((prev) => Math.max(0, prev - 1));
      }
      if (key.downArrow) {
        setFocusIndex((prev) => Math.min(command.args.length - 1, prev + 1));
      }
    },
    { isActive },
  );

  const handleSubmit = () => {
    const hasRequired = command.args
      .filter((arg) => arg.required)
      .every((arg) => fieldValues[arg.name]?.trim());

    if (hasRequired) {
      execute();
    }
  };

  return (
    <Box flexDirection="column" flexGrow={1}>
      {command.args.map((arg, index) => (
        <TextPrompt
          key={arg.name}
          label={arg.label}
          value={fieldValues[arg.name] ?? ''}
          onChange={(value) => setFieldValue(arg.name, value)}
          onSubmit={handleSubmit}
          isFocused={isActive && focusIndex === index}
        />
      ))}

      <OutputPanel stdout={stdout} stderr={stderr} isLoading={isLoading} />
    </Box>
  );
}
