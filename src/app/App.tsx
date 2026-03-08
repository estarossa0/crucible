import { Text } from 'ink';

import { AppProvider, Layout, useApp } from '@logic/index';
import { type Mode } from '@utils/index';

interface AppProps {
  mode: Mode;
}

function AppInner() {
  const { mode } = useApp();

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
