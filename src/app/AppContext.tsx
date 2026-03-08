import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Chain, Mode, RPC_URLS, chainList } from "../lib/index.ts";

interface AppState {
  mode: Mode;
  chain: Chain;
}

interface AppContextValue extends AppState {
  rpcUrl: string;
  setMode: (mode: Mode) => void;
  setChain: (chain: Chain) => void;
  cycleChain: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

interface AppProviderProps {
  initialMode: Mode;
  children: ReactNode;
}

export function AppProvider({ initialMode, children }: AppProviderProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [chain, setChain] = useState<Chain>(Chain.Mainnet);

  const cycleChain = useCallback(() => {
    setChain((current) => {
      const idx = chainList.indexOf(current);
      return chainList[(idx + 1) % chainList.length]!;
    });
  }, []);

  const rpcUrl = RPC_URLS[chain];

  return (
    <AppContext value={{
      mode,
      chain,
      rpcUrl,
      setMode,
      setChain,
      cycleChain,
    }}>
      {children}
    </AppContext>
  );
}
