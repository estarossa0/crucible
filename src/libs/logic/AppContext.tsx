import { type AppProps, useApp as useInkApp } from 'ink';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

import { Chain, type Mode, RPC_URLS } from '@utils/index';

export enum OverlayType {
  ChainSelect = 'chainSelect',
}

interface AppState {
  mode: Mode;
  chain: Chain;
  enabledOverlay: OverlayType | null;
}

interface AppContextValue extends AppState, AppProps {
  rpcUrl: string;
  setMode: (mode: Mode) => void;
  setChain: (chain: Chain) => void;
  openOverlay: (type: OverlayType) => void;
  closeOverlay: () => void;
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
  const [enabledOverlay, setEnabledOverlay] = useState<OverlayType | null>(null);

  const openOverlay = useCallback((type: OverlayType) => {
    setEnabledOverlay(type);
  }, []);

  const closeOverlay = useCallback(() => {
    setEnabledOverlay(null);
  }, []);

  const rpcUrl = RPC_URLS[chain];

  return (
    <AppContext
      value={{
        ...inkApp,
        mode,
        chain,
        rpcUrl,
        enabledOverlay,
        setMode,
        setChain,
        openOverlay,
        closeOverlay,
      }}
    >
      {children}
    </AppContext>
  );
}
