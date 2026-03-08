# Crucible Design Document

**Date:** 2026-03-07

## Architecture Overview

Crucible is a persistent interactive TUI wrapping Foundry's `forge` and `cast` CLI tools. It uses Ink (React for terminals) to render a stateful UI where users toggle parameters via keybindings and re-run commands without leaving the app.

### Entry Flow

```
CLI input → Commander.js (index.ts)
  ├── "forge" → render <App mode="forge" />
  └── "cast"  → render <App mode="cast" />

App.tsx routes to:
  ├── <ForgeMode />
  └── <CastMode />
```

Commander.js handles argument parsing at the entry point (`src/index.ts`). It defines two subcommands (`forge`, `cast`) and delegates to the root Ink `<App />` component which conditionally renders the appropriate mode.

### File Structure

```
src/
├── index.ts              # Commander.js CLI definition, renders Ink app
├── app.tsx               # Root component, routes mode prop to ForgeMode/CastMode
├── forge/
│   ├── ForgeMode.tsx     # Forge interactive UI
│   ├── forgeRunner.ts    # Effect service for building and executing forge commands
│   ├── forgeState.ts     # Types and initial state for forge mode
│   └── index.ts          # Barrel: re-exports ForgeMode, runner, state types
├── cast/
│   ├── CastMode.tsx      # Cast interactive UI
│   ├── castRunner.ts     # Effect service for building and executing cast commands
│   ├── castState.ts      # Types and initial state for cast mode
│   └── index.ts          # Barrel: re-exports CastMode, runner, state types
├── ui/
│   ├── StatusBar.tsx     # Renders current parameter values at top
│   ├── OutputPanel.tsx   # Scrollable area displaying command stdout/stderr
│   ├── KeyHints.tsx      # Bottom bar showing available keybindings
│   ├── TextPrompt.tsx    # Inline text input (used for script path, address, etc.)
│   └── index.ts          # Barrel: re-exports all UI components
└── lib/
    ├── shell.ts          # Effect wrapper around Bun.spawn
    ├── chains.ts         # Chain registry: name → RPC URL mapping
    ├── types.ts          # Shared types (ChainName, CommandOutput, etc.)
    └── index.ts          # Barrel: re-exports shell, chains, types
```

**Convention:** Component files use PascalCase. Non-component `.ts` files use camelCase. Every directory has a barrel `index.ts`.

---

## Forge Mode

### State

```typescript
interface ForgeState {
  script: string;        // Path to .sol script, e.g. "script/Deploy.s.sol"
  chain: ChainName;      // Selected chain
  broadcast: boolean;    // --broadcast toggle
  verbosity: 0 | 1 | 2 | 3 | 4;  // Maps to -v through -vvvvv
  rpcUrl: string;        // Derived from chain or set manually
  output: CommandOutput; // Latest command result
  isRunning: boolean;    // True while command is executing
  inputMode: "none" | "script";  // Whether text input is active
}
```

### Keybindings

| Key | Action | Behavior |
|-----|--------|----------|
| `Enter` | Run | Execute forge script with current params |
| `s` | Edit script | Activate TextPrompt for script path |
| `b` | Toggle broadcast | Flip `broadcast` boolean |
| `c` | Cycle chain | Move to next chain in registry |
| `v` | Cycle verbosity | `0 → 1 → 2 → 3 → 4 → 0` |
| `q` | Quit | Exit the application |

Keybindings are disabled while `isRunning` is true or `inputMode` is not `"none"`.

### Command Building

The `forgeRunner` service constructs the command from state:

```
forge script <script> --rpc-url <rpcUrl> [--broadcast] [-v...]
```

Rules:
- `--broadcast` is included only when `broadcast === true`
- Verbosity maps to repeated `v` flags: 0 = omitted, 1 = `-v`, 2 = `-vv`, etc.
- `--rpc-url` is always included

### UI Layout

```
┌─ StatusBar ─────────────────────────────────────┐
│ FORGE  <script>                                 │
│ chain: <chain>  broadcast: <ON|OFF>  verb: <N>  │
├─ OutputPanel ───────────────────────────────────┤
│ <scrollable stdout/stderr from last run>        │
│                                                 │
├─ KeyHints ──────────────────────────────────────┤
│ Enter:run  s:script  b:broadcast  c:chain ...   │
└─────────────────────────────────────────────────┘
```

When `inputMode === "script"`, the KeyHints bar is replaced by a TextPrompt for entering the script path.

---

## Cast Mode

### State

```typescript
type CastSubcommand = "balance" | "tx" | "receipt" | "call";

interface CastState {
  command: CastSubcommand;
  chain: ChainName;
  rpcUrl: string;
  args: CastArgs;
  output: CommandOutput;
  isRunning: boolean;
  inputMode: "none" | "address";
}

interface CastArgs {
  address: string;    // Used by: balance
  txHash: string;     // Used by: tx, receipt
  to: string;         // Used by: call
  calldata: string;   // Used by: call
}
```

### Keybindings

| Key | Action | Behavior |
|-----|--------|----------|
| `Enter` | Run | Execute cast command with current params |
| `Tab` | Switch subcommand | Cycle through: balance → tx → receipt → call |
| `c` | Cycle chain | Move to next chain in registry |
| `a` | Set address/hash | Activate TextPrompt for address or tx hash |
| `q` | Quit | Exit the application |

### Subcommands

Each subcommand maps to a specific `cast` invocation:

| Subcommand | Command Built | Args Used |
|------------|--------------|-----------|
| `balance` | `cast balance <address> --rpc-url <url>` | `address` |
| `tx` | `cast tx <txHash> --rpc-url <url>` | `txHash` |
| `receipt` | `cast receipt <txHash> --rpc-url <url>` | `txHash` |
| `call` | `cast call <to> <calldata> --rpc-url <url>` | `to`, `calldata` |

### UI Layout

```
┌─ StatusBar ─────────────────────────────────────┐
│ CAST  <subcommand>  chain: <chain>              │
├─ OutputPanel ───────────────────────────────────┤
│ <scrollable stdout/stderr from last run>        │
│                                                 │
├─ KeyHints ──────────────────────────────────────┤
│ Enter:run  Tab:subcommand  c:chain  a:address   │
└─────────────────────────────────────────────────┘
```

---

## Shell Execution Model

### Effect + Bun.spawn

The `shell.ts` module exposes an Effect-based wrapper around `Bun.spawn`:

```typescript
// Conceptual API
const runCommand: (
  cmd: string,
  args: string[]
) => Effect.Effect<CommandOutput, ShellError>
```

**Design:**
- Uses `Bun.spawn` for process creation (native Bun API, no Node child_process)
- Captures both stdout and stderr as streams
- Returns a `CommandOutput` with `{ stdout: string; stderr: string; exitCode: number }`
- Errors are typed as `ShellError` and caught at the runner level — never thrown to the UI unhandled
- The runner (forgeRunner/castRunner) calls this and pipes the result into component state

### Error Handling

All errors are caught and logged to the OutputPanel. The app never crashes silently:

1. **Process errors** (command not found, non-zero exit) — display stderr in OutputPanel with exit code
2. **Spawn errors** (binary missing, permission denied) — display error message in OutputPanel
3. **Network errors** (bad RPC URL) — these surface through forge/cast stderr, displayed as-is

No silent failures. Every error path renders visible output.

---

## Chain Registry

The `chains.ts` module defines a static registry of chain configurations:

```typescript
interface ChainConfig {
  name: ChainName;
  rpcUrl: string;
  chainId: number;
}

type ChainName = "mainnet" | "sepolia" | "base" | "arbitrum" | "optimism" | "anvil";
```

**Default chains:**

| Name | Chain ID | Default RPC |
|------|----------|-------------|
| mainnet | 1 | `https://eth.llamarpc.com` |
| sepolia | 11155111 | `https://rpc.sepolia.org` |
| base | 8453 | `https://mainnet.base.org` |
| arbitrum | 42161 | `https://arb1.arbitrum.io/rpc` |
| optimism | 10 | `https://mainnet.optimism.io` |
| anvil | 31337 | `http://127.0.0.1:8545` |

The registry is a plain array. Chain cycling iterates through this array. RPC URLs can be overridden by environment variables (e.g., `CRUCIBLE_RPC_MAINNET`).

---

## UI Component Breakdown

### StatusBar

- Renders at the top of the screen
- Shows mode name (FORGE/CAST), active parameters, and their current values
- Uses Ink's `<Box>` with `borderStyle` for framing
- Color-coded: green for enabled toggles, dim for disabled

### OutputPanel

- Scrollable area displaying the last command's stdout and stderr
- Uses a fixed height (terminal rows minus StatusBar and KeyHints height)
- Stderr is rendered in red, stdout in default color
- Shows a spinner (from Ink UI) while `isRunning === true`
- Empty state shows a dim "Press Enter to run" message

### KeyHints

- Bottom bar listing available keybindings
- Format: `key:action` separated by spaces
- Dims keybindings that are currently inactive (e.g., all keys during execution)

### TextPrompt

- Inline text input that replaces KeyHints when active
- Used for: script path (forge), address/hash input (cast)
- `Enter` confirms input, `Escape` cancels
- Uses Ink UI's text input component internally
