# Chain Select Menu Design

## Context

Currently pressing 'c' cycles through chains sequentially via `cycleChain()`. With 8 chains, this is tedious — you may need to press 'c' 7 times to reach the chain you want. We're replacing this with an inline dropdown select menu that appears below the chain name in the StatusBar, with arrow navigation, Enter to confirm, Esc to cancel, and type-to-filter.

This is the first select usage in the app, so we're building a reusable `Select` component as a foundation for future selects.

## Decision: Custom Select (no `@inkjs/ui`)

`@inkjs/ui` has a `Select` component, but it's a poor fit:
- `onChange` fires on every highlight move, not on Enter confirm
- No Esc/dismiss support
- No type-to-filter

Building our own is ~80 lines, zero new dependencies, and gives us exactly the UX we need.

## Visual Design

Select just opened (cursor at start, highlighted chain shown dimmed):
```
╭──────────────────────────────────╮
│ FORGE | ▌mainnet                 │
│   > mainnet                      │
│     blast                        │
│     base                         │
│     arbitrum                     │
│     plasma                       │
│     sepolia                      │
│     arbitrumSepolia              │
│     plasmaTestnet                │
│                                  │
│  ↑↓:navigate  enter:select  esc:close │
╰──────────────────────────────────╯
```
Cursor appears at the **start** of the text. The dimmed text shows the currently highlighted option.

User presses arrow down (dimmed text updates to match highlight):
```
╭──────────────────────────────────╮
│ FORGE | ▌blast                   │
│     mainnet                      │
│   > blast                        │
│     base                         │
│     arbitrum                     │
│                                  │
│  ↑↓:navigate  enter:select  esc:close │
╰──────────────────────────────────╯
```

User starts typing (typed text replaces dimmed text, list filters):
```
╭──────────────────────────────────╮
│ FORGE | sep▌                     │
│   > sepolia                      │
│     arbitrumSepolia              │
│                                  │
│  ↑↓:navigate  enter:select  esc:close │
╰──────────────────────────────────╯
```
Typed filter text is shown normally (not dimmed). No separate "filter:" line.

## Architecture

### Select Component (`src/libs/ui/Select.tsx`) — Reusable, Generic

```ts
interface SelectOption<T extends string = string> {
  label: ReactNode;
  value: T;
}

interface SelectProps<T extends string = string> {
  options: SelectOption<T>[];
  value: T;                        // controlled — determines highlighted option
  onChange: (value: T) => void;    // called on arrow up/down
  onConfirm: (value: T) => void;
  onCancel: () => void;
}
```

**Controlled, no filtering.** Receives pre-filtered options and renders them. Parent owns all state. No internal state.

**Key handling (via `useInput`):**
- Arrow up/down: call `onChange` with prev/next option's value (wrap around)
- Enter: call `onConfirm(value)`
- Esc: call `onCancel`

**Rendering:**
- Highlighted (matching `value`): `> ` prefix, bold cyan
- Other items: `  ` prefix, normal text
- Only renders the options list — filtering, typing, and input display handled by `SelectedChain`

### Overlay State — Lives in AppContext

```ts
enum OverlayType {
  ChainSelect = 'chainSelect',
}
```

Added to `AppContextValue`:
- `enabledOverlay: OverlayType | null` — current open overlay (default `null`)
- `openOverlay: (type: OverlayType) => void`
- `closeOverlay: () => void`

**Remove** `cycleChain` from context — it's replaced by the select.

The overlay state must be in AppContext because:
1. `AppKeyBindings` needs to suppress 'c'/'q' when select is open
2. `StatusBar` needs to know whether to render the dropdown
3. `Layout` needs to swap key hints

### Rendering Flow

**SelectedChain.tsx** (new component — `src/libs/ui/SelectedChain.tsx`):
- Always rendered by StatusBar in place of the old inline chain `<Text>`
- Reads `enabledOverlay`, `chain`, `setChain`, `closeOverlay` from `useApp()`
- **When overlay inactive**: renders chain name in yellow (current behavior)
- **When overlay active**:
  - Owns local state: `highlightedValue` (init to `chain`), `filterText` (init to `""`)
  - Has `useInput` for typing/backspace → updates `filterText`
  - Filters `chainList` by `filterText` (case-insensitive match on label)
  - Auto-resets `highlightedValue` to first filtered option when filter changes
  - **Inline input** (top row):
    - If `filterText` is empty: cursor `▌` at start + highlighted option label **dimmed**
    - If typing: typed `filterText` (normal color) + cursor `▌`
  - Renders `<ChainSelect />` with pre-filtered options, `value={highlightedValue}`, `onChange={setHighlightedValue}`

**ChainSelect.tsx** (new component — `src/libs/ui/ChainSelect.tsx`):
- The dropdown list portion, renders `<Select>` with chain options
- Receives controlled `value` and `onChange` from `SelectedChain`
- `onConfirm` = `setChain(value)` + `closeOverlay()`
- `onCancel` = `closeOverlay()`

**StatusBar.tsx:**
- Renders `<SelectedChain />` instead of inline chain `<Text>`
- StatusBar stays thin — just composes components

**AppKeyBindings.tsx:**
- When `overlay !== null`: skip all key handling (Select component owns input)
- 'c' key: call `openOverlay('chainSelect')` instead of `cycleChain()`

**Layout.tsx:**
- When `overlay !== null`: render select-specific hints (`↑↓:navigate  enter:select  esc:close`)
- Otherwise: render normal hints via `<AppKeyBindings />`

## Files Changed

| File | Action | Changes |
|---|---|---|
| `src/libs/ui/Select.tsx` | Create | Reusable select with arrow nav, Enter confirm, Esc cancel, type-to-filter |
| `src/libs/ui/SelectedChain.tsx` | Create | Chain text + inline input when active, contains ChainSelect |
| `src/libs/ui/ChainSelect.tsx` | Create | Chain dropdown list using Select |
| `src/libs/ui/index.ts` | Modify | Export `Select`, `SelectedChain`, `ChainSelect` |
| `src/libs/logic/AppContext.tsx` | Modify | Add `enabledOverlay`/`openOverlay`/`closeOverlay`, remove `cycleChain` |
| `src/libs/logic/AppKeyBindings.tsx` | Modify | 'c' opens overlay, guard all keys when overlay active |
| `src/libs/ui/StatusBar.tsx` | Modify | Use `<SelectedChain />` instead of inline chain text |
| `src/libs/logic/Layout.tsx` | Modify | Swap key hints when overlay active |

## Input Conflict Resolution

When Select is open, both `AppKeyBindings.useInput` and `Select.useInput` fire. The fix:
- `AppKeyBindings`: check `if (overlay !== null) return;` at top of `useInput` callback
- This lets Select own all input while it's mounted

## Verification

1. Run `bun run src/index.ts forge`
2. Press 'c' — dropdown should appear inline below chain name in StatusBar
3. Arrow up/down — highlight should move between chains
4. Type characters — list should filter, highlight resets to first match
5. Backspace — removes filter characters
6. Enter — selects highlighted chain, dropdown closes, StatusBar shows new chain
7. Press 'c' again, then Esc — dropdown closes, chain unchanged
8. Key hints at bottom should swap between normal and select-specific
9. 'q' should not quit while select is open