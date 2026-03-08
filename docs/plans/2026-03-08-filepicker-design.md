# Crucible — FilePicker Component Design

Save this to `docs/plans/2026-03-08-filepicker-design.md`.

## Context

Crucible's TextPrompt currently requires manually typing file paths (script paths, ABI files, contracts). We need a fuzzy file picker — triggered by `@` in any TextPrompt — that provides hybrid browsing: fuzzy search + directory navigation. Similar to Claude Code's `@` file lookup.

## Design Decisions (from brainstorming)

- **Trigger:** `@` typed in any TextPrompt opens the picker
- **Scope:** Starts at project root (cwd), allows navigating up via `..`
- **Search:** `fzf-for-js` for fuzzy matching (port of fzf's algorithm)
- **Results:** 5 visible items, compact list
- **Browsing:** Dirs and files inline in one list; selecting a dir drills in, `..` goes up
- **Tab to fill:** Tab autocompletes the highlighted item into the input (shell-completion style), does NOT confirm
- **Arrow keys:** Up/down to navigate the result list
- **Enter:** Confirms the filled path and closes the picker
- **Escape:** Cancels and closes the picker

## Libraries

- **`fzf-for-js`** (`fzf` on npm) — fuzzy matching engine, TypeScript typed, zero deps
- **Ink UI `TextInput`** — controlled text input (`onChange`, `onSubmit`, `placeholder`, `suggestions`)
- **Ink `useInput`** — keyboard hook for arrow keys, Tab, Escape (`key.upArrow`, `key.downArrow`, `key.tab`, `key.escape`)
- Ink UI `Select` is NOT used — it doesn't support Tab-to-fill or custom keyboard handling. We build a custom result list.

## Interaction Flow

**Inspired by [`gum file`](https://github.com/charmbracelet/gum#file)** — directory-first listing, permission display, colored dirs, `..` at top.

### Default view (no query — browse mode)

```
@ ▏                                        ← search input (empty = browse current dir)
─────────────────────────────────────────
> ..                                       ← always first, go up
  drwxr-xr-x  script/                     ← dirs first, magenta colored
  drwxr-xr-x  src/
  drwxr-xr-x  lib/
  -rw-r--r--  foundry.toml                ← files after dirs, default color
```

### With fuzzy query

```
@ deploy▏                                  ← typing filters via fzf
─────────────────────────────────────────
> -rw-r--r--  script/Deploy.s.sol          ← best fuzzy match highlighted
  -rw-r--r--  script/DeployToken.s.sol
  drwxr-xr-x  src/deploy/
  -rw-r--r--  src/deploy/Deployer.sol
  ..
```

### After Tab (fill)

```
@ script/Deploy.s.sol▏                    ← Tab filled the highlighted path
─────────────────────────────────────────
> -rw-r--r--  script/Deploy.s.sol
  -rw-r--r--  script/DeployToken.s.sol
  drwxr-xr-x  src/deploy/
  -rw-r--r--  src/deploy/Deployer.sol
  ..
```

**Keys:**
- Type → fuzzy filter results
- `↑`/`↓` → move `>` cursor
- `Tab` → fill highlighted path into input
- `Enter` on dir → drill in, reset query
- `Enter` on file (or filled input) → confirm, close picker
- `Escape` → cancel, close picker

### Display conventions (from gum file)

- **`..` always first** in the list
- **Directories sorted above files**
- **Permissions shown** (`drwxr-xr-x`, `-rw-r--r--`) before each entry
- **Dirs in magenta** with trailing `/`, **files in default** color
- **`>` cursor** on highlighted item
- **5 visible entries**, scrolls if more results

**State machine:**
```
TextPrompt (normal) --[@]--> FilePicker (active)
  FilePicker --[type chars]--> fuzzy filter results
  FilePicker --[↑↓]--> move highlight
  FilePicker --[Tab]--> fill highlighted item into input
  FilePicker --[Enter on dir]--> drill into directory, reset query
  FilePicker --[Enter on file or filled input]--> confirm, return path to TextPrompt
  FilePicker --[Escape]--> cancel, back to TextPrompt
```

## Files to Create/Modify

### New files

| File | Purpose |
|------|---------|
| `src/ui/FilePicker.tsx` | Main FilePicker component |
| `src/lib/fileSearch.ts` | File listing + fzf integration (reads fs, builds file list, runs fuzzy search) |

### Modified files

| File | Change |
|------|--------|
| `src/ui/TextPrompt.tsx` | Detect `@` trigger, toggle FilePicker, receive selected path |
| `src/ui/index.ts` | Add FilePicker to barrel export |
| `src/lib/index.ts` | Add fileSearch to barrel export |
| `docs/plans/2026-03-07-crucible-design.md` | Add FilePicker section to UI component breakdown |
| `README.md` | Add FilePicker to architecture tree and feature list |

## Implementation Steps

### Step 1: Install `fzf-for-js`

```bash
bun add fzf
```

Lock version in package.json (remove `^`).

### Step 2: Create `src/lib/fileSearch.ts`

Responsibilities:
- `listEntries(dir: string): FileEntry[]` — returns immediate children + `..` entry, sorted dirs-first
- `fuzzySearch(entries: FileEntry[], query: string): FileEntry[]` — wraps `fzf-for-js`, returns ranked results capped at a configurable limit
- `getPermissions(path: string): string` — returns permission string like `drwxr-xr-x` or `-rw-r--r--` (via `fs.statSync` mode bits)
- Respects `.gitignore` patterns (use Bun's glob or a simple ignore list)
- When query is empty, returns `listEntries` (browse mode). When query has text, runs fzf across all files recursively.

```typescript
interface FileEntry {
  name: string;         // Display name: "Deploy.s.sol" or "script/"
  path: string;         // Relative path from project root: "script/Deploy.s.sol"
  isDirectory: boolean;
  permissions: string;  // e.g. "drwxr-xr-x", "-rw-r--r--"
}
```

### Step 3: Create `src/ui/FilePicker.tsx`

```typescript
interface FilePickerProps {
  isActive: boolean;
  rootDir: string;                    // Project root (cwd)
  onSelect: (filePath: string) => void;  // Called on confirm
  onCancel: () => void;              // Called on Escape
}
```

**Internal state:**
- `query: string` — current search text
- `scopeDir: string` — current browsed directory (starts at rootDir)
- `entries: FileEntry[]` — files/dirs in current scope
- `filteredEntries: FileEntry[]` — fzf-filtered results
- `highlightIndex: number` — which result is highlighted (0-based)
- `filledValue: string` — the path filled by Tab

**Keyboard handling (custom `useInput`):**
- Character input → append to `query`, re-run fuzzy search
- Backspace → remove from `query`
- `↑` / `↓` → move `highlightIndex` within filteredEntries (wrap around)
- `Tab` → fill `filteredEntries[highlightIndex].path` into the input, do NOT close
- `Enter` →
  - If highlighted item is a directory → set `scopeDir` to that dir, reset `query` and `highlightIndex`
  - If highlighted item is a file (or input has a filled value) → call `onSelect(filledValue)`
- `Escape` → call `onCancel()`

**Rendering (gum file inspired):**
- Top: text input showing `@ {query}` (or filled path after Tab)
- Separator line below input
- Below: list of 5 entries, highlighted entry marked with `>`
- Each entry shows: `[cursor] [permissions]  [name]`
- Directories sorted before files, shown in magenta with trailing `/`
- Files shown in default color
- `..` entry always first in the list (no permissions shown for `..`)
- When query is empty → browse mode (shows current dir contents)
- When query has text → fuzzy search mode (searches recursively from scope dir)

### Step 4: Integrate into `TextPrompt.tsx`

- Watch for `@` character in input
- When `@` detected: strip it from input, set `filePickerActive = true`
- Render `<FilePicker />` when active
- On `onSelect`: insert returned path into TextPrompt value, deactivate picker
- On `onCancel`: deactivate picker, restore previous input

### Step 5: Update barrel exports

- `src/ui/index.ts` — add `FilePicker`
- `src/lib/index.ts` — add `fileSearch` exports

### Step 6: Update docs

- Add FilePicker to the UI component breakdown in `docs/plans/2026-03-07-crucible-design.md`
- Add FilePicker to architecture tree and Phase 2 features in `README.md`

## Verification

1. `src/ui/FilePicker.tsx` exists and exports `FilePicker` component
2. `src/lib/fileSearch.ts` exists and exports `listEntries`, `fuzzySearch`
3. `fzf` is in `package.json` dependencies with locked version
4. TextPrompt detects `@` and opens FilePicker
5. Arrow keys navigate results, Tab fills into input, Enter confirms, Escape cancels
6. Selecting a directory drills in, `..` navigates up
7. Barrel exports updated in `src/ui/index.ts` and `src/lib/index.ts`
8. Manual test: `bun run src/index.ts forge` → press `s` → type `@dep` → see fuzzy results → Tab to fill → Enter to confirm
