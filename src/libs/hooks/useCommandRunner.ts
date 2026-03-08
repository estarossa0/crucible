import { Effect } from 'effect';
import { useCallback, useState } from 'react';

import { useApp } from '@logic/AppContext';
import { type Command } from '@logic/commands';
import { run } from '@utils/shell';

interface CommandRunnerState {
  fieldValues: Record<string, string>;
  stdout: string;
  stderr: string;
  isLoading: boolean;
}

export function useCommandRunner(toolName: 'cast' | 'forge', command: Command) {
  const { rpcUrl } = useApp();

  const [state, setState] = useState<CommandRunnerState>({
    fieldValues: Object.fromEntries(command.args.map((arg) => [arg.name, ''])),
    stdout: '',
    stderr: '',
    isLoading: false,
  });

  const setFieldValue = useCallback((name: string, value: string) => {
    setState((prev) => ({
      ...prev,
      fieldValues: { ...prev.fieldValues, [name]: value },
    }));
  }, []);

  const buildCommand = useCallback((): string[] => {
    const cmd = [toolName, command.name];

    for (const arg of command.args) {
      const value = state.fieldValues[arg.name];
      if (value) cmd.push(value);
    }

    cmd.push('--rpc-url', rpcUrl);

    return cmd;
  }, [toolName, command, state.fieldValues, rpcUrl]);

  const execute = useCallback(() => {
    const cmd = buildCommand();

    setState((prev) => ({ ...prev, isLoading: true, stdout: '', stderr: '' }));

    Effect.runPromise(run(cmd))
      .then((result) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          stdout: result.stdout,
          stderr: result.stderr,
        }));
      })
      .catch((error) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          stderr: String(error),
        }));
      });
  }, [buildCommand]);

  return {
    fieldValues: state.fieldValues,
    stdout: state.stdout,
    stderr: state.stderr,
    isLoading: state.isLoading,
    setFieldValue,
    execute,
  };
}
