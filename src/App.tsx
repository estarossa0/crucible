import React from 'react';
import { Text, useInput } from 'ink';
import { type Mode } from './lib/index.ts';
import { AppProvider, useApp, Layout } from './app/index.ts';

interface AppProps {
  mode: Mode;
}

function AppInner() {
  const { mode, cycleChain } = useApp();

  useInput((input) => {
    if (input === 'c') {
      cycleChain();
    }
  });

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
