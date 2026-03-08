# Crucible

**A persistent interactive TUI for Forge and Cast.**

## Problem

When working with Foundry tools (`forge`, `cast`), you constantly re-run commands with slight parameter changes — toggling `--broadcast`, switching chains, changing addresses, bumping verbosity. This means manually editing terminal history, polluting your scrollback, and wasting time on repetitive edits.

## How It Works

Crucible is a persistent terminal UI that wraps `forge` and `cast`. Instead of retyping commands, you toggle parameters with keybindings and re-run instantly. Two modes:

- **`crucible forge`** — Interactive forge script runner with toggleable broadcast, chain selection, and verbosity
- **`crucible cast`** — Interactive cast command runner with switchable subcommands and chain selection

Parameters stay visible in a status bar. Output streams into a scrollable panel. Keybinding hints sit at the bottom. Change a parameter, hit Enter, see results.

## Stack

| Layer | Tool |
|---|---|
| Runtime | Bun |
| Language | TypeScript |
| TUI Framework | Ink (React for the terminal) |
| CLI Entry Parsing | Commander.js |
| Error Handling / Process Mgmt | Effect |
| UI Components | Ink UI (selects, text inputs, spinners) |

## Usage

### Forge Mode

```
$ crucible forge
```

```
┌─────────────────────────────────────────────────┐
│ FORGE  script/Deploy.s.sol                      │
│ chain: sepolia  broadcast: ON  verbosity: -vvv  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Compiler run successful]                      │
│  Script ran successfully.                       │
│  Gas used: 142312                               │
│                                                 │
│  == Return ==                                   │
│  deployed: 0xAbC...123                          │
│                                                 │
├─────────────────────────────────────────────────┤
│ Enter:run  s:script  b:broadcast  c:chain       │
│ v:verbosity  q:quit                             │
└─────────────────────────────────────────────────┘
```

**Keybindings:**

- `Enter` — Run forge script with current params
- `s` — Edit script path
- `b` — Toggle broadcast on/off
- `c` — Cycle/select chain
- `v` — Cycle verbosity (0-4)
- `q` — Quit

### Cast Mode

```
$ crucible cast
```

```
┌─────────────────────────────────────────────────┐
│ CAST  balance  chain: mainnet                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  1.234567890000000000 ETH                       │
│                                                 │
├─────────────────────────────────────────────────┤
│ Enter:run  Tab:subcommand  c:chain  a:address   │
│ q:quit                                          │
└─────────────────────────────────────────────────┘
```

**Keybindings:**

- `Enter` — Run cast command with current params
- `Tab` — Switch between subcommands (balance, tx, receipt, call)
- `c` — Cycle/select chain
- `a` — Set address/hash
- `q` — Quit

## Architecture

```
crucible/
├── src/
│   ├── index.ts              # Entry point — Commander.js parses "forge" or "cast"
│   ├── app.tsx               # Root Ink app — routes to ForgeMode or CastMode
│   ├── forge/
│   │   ├── ForgeMode.tsx     # Forge REPL UI component
│   │   ├── forgeRunner.ts    # Effect service: builds & runs forge commands
│   │   ├── forgeState.ts     # State types for forge mode
│   │   └── index.ts          # Barrel export
│   ├── cast/
│   │   ├── CastMode.tsx      # Cast REPL UI component
│   │   ├── castRunner.ts     # Effect service: builds & runs cast commands
│   │   ├── castState.ts      # State types for cast mode
│   │   └── index.ts          # Barrel export
│   ├── ui/
│   │   ├── StatusBar.tsx     # Top bar showing current params
│   │   ├── OutputPanel.tsx   # Scrollable output area
│   │   ├── KeyHints.tsx      # Bottom bar with keybinding hints
│   │   ├── TextPrompt.tsx    # Inline text input for addresses/paths
│   │   └── index.ts          # Barrel export
│   └── lib/
│       ├── shell.ts          # Effect wrapper around Bun.spawn
│       ├── chains.ts         # Chain name → RPC URL mapping
│       ├── types.ts          # Shared types
│       └── index.ts          # Barrel export
├── package.json
├── tsconfig.json
└── README.md
```

## Features (Phased)

### Phase 1 — Core

- [ ] Project scaffolding (Bun, TypeScript, Ink, Commander.js, Effect)
- [ ] CLI entry point with `forge` and `cast` subcommands
- [ ] Root Ink app routing to ForgeMode or CastMode
- [ ] Chain registry (mainnet, sepolia, anvil + custom RPC)

### Phase 2 — Forge Mode

- [ ] Forge state management (script, chain, broadcast, verbosity)
- [ ] StatusBar, OutputPanel, KeyHints UI components
- [ ] Keybinding handling (Enter, s, b, c, v, q)
- [ ] forgeRunner: build command string and execute via Effect + Bun.spawn
- [ ] Stream stdout/stderr into OutputPanel

### Phase 3 — Cast Mode

- [ ] Cast state management (subcommand, chain, args)
- [ ] Subcommand switching (balance, tx, receipt, call)
- [ ] castRunner: build command string and execute
- [ ] TextPrompt for inline address/hash input

### Phase 4 — Polish

- [ ] Error display in OutputPanel (catch and log, never fail silently)
- [ ] Loading spinners during command execution
- [ ] Scrollable output with overflow handling
- [ ] Edge cases: missing forge/cast binary, invalid script path, bad RPC

## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast)

### Setup

```bash
git clone <repo-url> crucible
cd crucible
bun install
```

### Run

```bash
bun run src/index.ts forge
bun run src/index.ts cast
```

### Build

```bash
bun build src/index.ts --outdir dist --target bun
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Follow existing conventions (PascalCase components, camelCase utils, barrel exports)
4. Submit a PR

## License

MIT
