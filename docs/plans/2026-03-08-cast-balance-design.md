# Plan: Cast Balance with Generic Subcommand Registry

## Context

Crucible's cast mode doesn't exist yet. We need to build it starting with `cast balance`, but using a **data-driven subcommand registry** so adding more commands later is just adding entries to an array — no new hooks or components per command.

## Architecture

### 3 Layers

1. **Shell layer** — `src/libs/utils/shell.ts` — Effect + `Bun.spawn`, reusable for forge/cast
2. **UI components** — `TextPrompt.tsx` + `OutputPanel.tsx` in `src/libs/ui/`
3. **Cast mode** — Registry-driven: define commands as data, one generic component renders any command's fields and runs it

### Subcommand Registry (shared, used by both cast and forge)

```ts
// src/libs/logic/commands/types.ts
interface CommandArg {
  name: string;
  label: string;
  required: boolean;
}

interface CommandFlagBase {
  name: string;
  label: string;
}

interface BooleanFlag extends CommandFlagBase {
  type: 'boolean';       // e.g. --ether → on/off
  default: boolean;
}

interface LevelFlag extends CommandFlagBase {
  type: 'level';         // e.g. -v, -vv, -vvv, -vvvv
  levels: string[];      // ordered list of values, e.g. ['-v', '-vv', '-vvv', '-vvvv']
  default: number;       // index into levels (0-based), -1 or undefined = off
}

type CommandFlag = BooleanFlag | LevelFlag;

interface Command {
  name: string;
  args: CommandArg[];
  flags: CommandFlag[];
}

// src/libs/logic/commands/castCommands.ts
const castCommands: Command[] = [
  {
    name: 'balance',
    args: [
      { name: 'who', label: 'Address', required: true },
    ],
    flags: [],  // no flags for now, ether/etc added later
  },
];

// src/libs/logic/commands/index.ts — barrel export
```

### Data Flow

```
CastMode renders fields from castCommands[0] (balance)
  → TextPrompt per arg, stacked vertically, arrow keys move focus
  → User presses Enter → builds command:
      ["cast", "balance", <address>, "--rpc-url", <rpcUrl from AppContext>]
  → shell.run(command) via Effect
  → OutputPanel shows spinner while loading
  → On complete: stdout (default color) / stderr (red)
```

### Generic Hook: `useCommandRunner`

One hook handles ANY subcommand from either mode:

```ts
// src/libs/hooks/useCommandRunner.ts
function useCommandRunner(toolName: 'cast' | 'forge', command: Command) {
  // Gets rpcUrl from useApp() internally
  // State: field values (Record<string, string>), stdout, stderr, isLoading
  // buildCommand(): assembles [toolName, command.name, ...positional args, "--rpc-url", rpcUrl, ...flags]
  // run(): executes via shell.run, manages loading state
  // setFieldValue(name, value): updates a field
  return { fieldValues, stdout, stderr, isLoading, setFieldValue, run };
}
```

## Files

### New files (10)

| File | Purpose |
|------|---------|
| `src/libs/utils/shell.ts` | Effect + Bun.spawn wrapper → `{ stdout, stderr, exitCode }` |
| `src/libs/ui/TextPrompt.tsx` | Inline text input with label, cursor, isActive guard |
| `src/libs/ui/OutputPanel.tsx` | Stdout/stderr display + loading spinner |
| `src/libs/logic/commands/types.ts` | Shared Command, CommandArg, CommandFlag types |
| `src/libs/logic/commands/castCommands.ts` | Cast subcommand registry (starts with balance) |
| `src/libs/logic/commands/index.ts` | Barrel export for commands |
| `src/libs/hooks/useCommandRunner.ts` | Generic hook: field state + command building + execution |
| `src/libs/logic/cast/CastMode.tsx` | Renders fields from registry, output panel, keybindings |
| `src/libs/logic/cast/CastKeyBindings.tsx` | Cast-mode specific key hints (enter:run) |
| `src/libs/logic/cast/index.ts` | Barrel export |

### Modified files (5)

| File | Change |
|------|--------|
| `package.json` | Add `effect` dependency |
| `tsconfig.json` | No change needed — cast is under `@logic/cast/*` |
| `src/libs/utils/index.ts` | Export shell |
| `src/libs/ui/index.ts` | Export TextPrompt, OutputPanel |
| `src/libs/hooks/index.ts` | Export useCommandRunner |
| `src/app/App.tsx` | Route Mode.Cast → `<CastMode />` |

### Layout change

`src/libs/logic/Layout.tsx` — Add optional `modeHints` prop (KeyHint[]) to render mode-specific hints in the empty left slot (line 51).

## Component Details

### TextPrompt

```
Props: { label, value, onChange, onSubmit, isActive, isFocused }
Render: "> label: value█" when focused, "  label: value" when not
Pattern: useInput with isActive guard (same as SelectedChain)
```

### OutputPanel

```
Props: { stdout, stderr, isLoading }
Render: Loading spinner | stdout text | stderr in red
Fills available vertical space (flexGrow=1)
```

### CastMode

```
- Reads active command from registry (hardcoded to balance for now)
- Maps command.args → stacked TextPrompt components
- Arrow up/down moves focus between fields
- Enter on last field (or anytime) runs the command
- Shows OutputPanel below fields
- Passes mode hints to Layout
```

## Implementation Order

1. Install `effect`, update `package.json`
2. `shell.ts` — foundation layer + update `utils/index.ts`
3. `TextPrompt.tsx` + `OutputPanel.tsx` — UI components + update `ui/index.ts`
4. `logic/commands/types.ts` + `castCommands.ts` + `commands/index.ts` — shared registry
5. `useCommandRunner.ts` — generic hook + update `hooks/index.ts`
6. `CastMode.tsx` + `CastKeyBindings.tsx` + `cast/index.ts`
7. `Layout.tsx` — add `modeHints` prop
8. `App.tsx` — routing

## Verification

1. `bun run src/index.ts cast` — should show cast mode with address field
2. Type an address, press Enter — should run `cast balance` and show output
3. Change chain via `c` — next run should use new RPC URL
4. `bun run types` — no TypeScript errors
5. `bun run lint` — no lint errors
