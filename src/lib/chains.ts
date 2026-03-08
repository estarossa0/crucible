import { Chain } from './types.ts';

const ALCHEMY_SUBDOMAINS: Record<Chain, string | null> = {
  [Chain.Mainnet]: 'eth-mainnet',
  [Chain.Blast]: 'blast-mainnet',
  [Chain.Base]: 'base-mainnet',
  [Chain.Arbitrum]: 'arb-mainnet',
  [Chain.Plasma]: 'plasma-mainnet',
  [Chain.Sepolia]: 'eth-sepolia',
  [Chain.ArbitrumSepolia]: 'arb-sepolia',
  [Chain.PlasmaTestnet]: 'plasma-testnet',
};

function getUrl(subdomain: string): string {
  return `https://${subdomain}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
}

export const RPC_URLS: Record<Chain, string> = Object.fromEntries(
  Object.values(Chain).map((chain) => {
    const subdomain = ALCHEMY_SUBDOMAINS[chain];
    return [chain, subdomain ? getUrl(subdomain) : ''];
  }),
) as Record<Chain, string>;

export const chainList: Chain[] = Object.values(Chain);
