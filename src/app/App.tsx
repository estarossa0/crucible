import { Text } from 'ink';

import { AppProvider, CastMode, Layout, useApp } from '@logic/index';
import { Mode } from '@utils/index';

interface AppProps {
  mode: Mode;
}

const CAST_MODE_HINTS = [{ key: 'enter', action: 'run' }];

function AppInner() {
  const { mode } = useApp();

  if (mode === Mode.Cast) {
    return (
      <Layout modeHints={CAST_MODE_HINTS}>
        <CastMode />
      </Layout>
    );
  }

  return (
    <Layout>
      <Text>Crucible ready. Mode: {mode}</Text>
    </Layout>
  );
}

export default function App({ mode }: AppProps) {
  return (
    <AppProvider initialMode={mode}>
      <AppInner />
    </AppProvider>
  );
}
