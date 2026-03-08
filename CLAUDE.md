# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crucible is a persistent interactive TUI wrapping Foundry's `forge` and `cast` CLI tools. It eliminates repetitive retyping of commands by providing an interactive interface for toggling parameters (broadcast, chain, verbosity) and running commands.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **TUI Framework:** Ink (React for terminal)
- **CLI Parsing:** Commander.js
- **Error Handling / Process Management:** Effect
- **UI Components:** Ink UI

## Commands

```bash
bun install                              # Install dependencies
bun run src/index.ts forge               # Run forge mode
bun run src/index.ts cast                # Run cast mode
bun build src/index.ts --outdir dist --target bun  # Build
```

## Architecture

Two main modes routed via Commander.js subcommands:

```
CLI → Commander.js (src/index.ts) → Ink App (src/app.tsx)
  ├── "forge" → ForgeMode — interactive script runner (broadcast, chain, verbosity toggles)
  └── "cast"  → CastMode  — interactive command runner (balance, tx, receipt, call)
```

### Key directories

- `src/app/` — App entry point, and high level components, like layout, also routes to ForgeMode or CastMode
- `src/forge/` — Forge mode UI, state, and Effect-based runner
- `src/cast/` — Cast mode UI, state, and Effect-based runner
- `src/ui/` — Shared components (StatusBar, OutputPanel, KeyHints, TextPrompt, FilePicker)
- `src/lib/` — Shell execution (Bun.spawn + Effect), chain registry, types, completions

### Patterns

- Shell commands run via `Bun.spawn` wrapped in Effect services
- Chain registry is a static map of chain names → RPC URLs (mainnet, sepolia, base, arbitrum, optimism, anvil)
- Keybindings handled via Ink's `useInput` hook
- All errors displayed in OutputPanel, never silent

## Conventions

- **Components and .tsx files:** PascalCase filenames (`StatusBar.tsx`, `ForgeMode.tsx`)
- **Utilities/Services and .ts files:** camelCase filenames (`forgeRunner.ts`, `shell.ts`)
- **Barrel exports:** Every directory has an `index.ts` re-exporting public APIs
- **Locked Version:** Every installed package must be stripped out of "^" to lock the version

## Implementation preference:

- Only try to implement what's asked to the letter, if other things need to be implemented before you can do what you're, use placeholder functions and components
- Don't ask for permission to do small changes one by one, figure the whole file changes needed, and ask only once.
- Every time you create a plan in plan mode, always save it in ./docs/plans. Right after writing it up.
