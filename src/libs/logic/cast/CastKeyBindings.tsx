import { KeyHints } from '@ui/KeyHints';

const CAST_HINTS = [{ key: 'enter', action: 'run' }];

export function CastKeyBindings() {
  return <KeyHints hints={CAST_HINTS} />;
}
