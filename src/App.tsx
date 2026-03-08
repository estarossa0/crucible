import React from "react";
import { Text, useApp, useInput } from "ink";
import { type Mode } from "./lib/index.ts";
import { AppProvider, useAppContext, Layout } from "./app/index.ts";

interface AppProps {
  mode: Mode;
}

function AppInner() {
  const { exit } = useApp();
  const { mode, cycleChain } = useAppContext();

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }
    if (input === "c") {
      cycleChain();
      return;
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
