import { type AppProps, useApp as useInkApp } from 'ink';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

import { Chain, chainList, type Mode, RPC_URLS } from '@utils/index';

interface AppState {
  mode: Mode;
  chain: Chain;
}

interface AppContextValue extends AppState, AppProps {
  rpcUrl: string;
  setMode: (mode: Mode) => void;
  setChain: (chain: Chain) => void;
  cycleChain: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

interface AppProviderProps {
  initialMode: Mode;
  children: ReactNode;
}

export function AppProvider({ initialMode, children }: AppProviderProps) {
  const inkApp = useInkApp();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [chain, setChain] = useState<Chain>(Chain.Mainnet);

  const cycleChain = useCallback(() => {
    setChain((current) => {
      const idx = chainList.indexOf(current);

      return chainList[(idx + 1) % chainList.length] as Chain;
    });
  }, []);

  const rpcUrl = RPC_URLS[chain];

  return (
    <AppContext
      value={{
        ...inkApp,
        mode,
        chain,
        rpcUrl,
        setMode,
        setChain,
        cycleChain,
      }}
    >
      {children}
    </AppContext>
  );
}
