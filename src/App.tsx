import { Text } from 'ink';
import { AppProvider, Layout, useApp } from './app/index.ts';
import { type Mode } from './lib/index.ts';

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
