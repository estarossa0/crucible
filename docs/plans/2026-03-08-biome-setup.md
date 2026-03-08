# Plan: Install Biome with Minimal Config

## Context
The project has zero linting/formatting tooling. Adding Biome as a fast, all-in-one linter+formatter. Config inspired by the usdai-frontend ESLint setup, adapted for our TUI use case (no DOM, no a11y, no Next.js, no Tailwind rules needed).

## Steps

### 1. Install Biome
```bash
bun add --dev --exact @biomejs/biome
```

### 2. Create `biome.json` at project root

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "includes": ["src/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": {
          "level": "warn",
          "options": { "ignorePattern": "^_" }
        }
      },
      "style": {
        "useConst": "error",
        "noVar": "error",
        "useSelfClosingElements": "warn",
        "noNonNullAssertion": "warn"
      },
      "suspicious": {
        "noDebugger": "error",
        "noConsole": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "indentStyle": "space",
      "indentWidth": 2
    }
  }
}
```

**Decisions from reference config:**
- **Single quotes** — matches reference
- **Semicolons always, trailing commas all** — matches reference
- **`recommended: true`** — covers the bulk: `noVar`, `eqeqeq` equivalent, `noDebugger`, React hooks rules, etc.
- **`noUnusedImports: error`** — from `unused-imports/no-unused-imports: error`
- **`noUnusedVariables: warn`** with `^_` ignore — from `unused-imports/no-unused-vars` with `varsIgnorePattern: "^_"`
- **`useConst: error`** — from `prefer-const: warn` (bumped to error since biome auto-fixes it)
- **`noConsole: off`** — reference has it as warn, but we're a TUI app where console output is normal
- **`noNonNullAssertion: warn`** — from `@typescript-eslint/no-non-null-assertion: error` (softer for now)
- **`useSelfClosingElements: warn`** — from `react/self-closing-comp: warn`
- **Skipped**: a11y rules (TUI, not browser), curly multi-or-nest (no biome equivalent), import ordering (add later), consistent-type-imports (add later)

### 3. Add scripts to `package.json`
```json
{
  "lint": "biome lint .",
  "format": "biome format --write .",
  "check": "biome check --write ."
}
```

### 4. Run `bun run check` to auto-fix formatting + lint

### 5. Fix any remaining lint errors that can't be auto-fixed

## Files to modify
- `package.json` — add devDependency + scripts
- `biome.json` — new file (project root)
- `src/**` — any files reformatted by the initial run

## Verification
1. `bun run check` exits cleanly with no errors
2. `bun run src/index.ts forge` still works (smoke test)