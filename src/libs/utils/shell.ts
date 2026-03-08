import { Effect } from 'effect';

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function run(command: string[]): Effect.Effect<ShellResult, Error> {
  return Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn(command, {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const [stdout, stderr] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
      ]);

      const exitCode = await proc.exited;

      return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
    },
    catch: (error) => new Error(`Shell command failed: ${error}`),
  });
}
