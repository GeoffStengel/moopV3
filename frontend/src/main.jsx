import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected } from '@wagmi/connectors';
import { http } from 'viem';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

import { mainnet, sepolia } from 'wagmi/chains';  // official chains

// Your custom Hardhat chain stays as-is
import { defineChain } from 'viem';

const hardhatChain = defineChain({
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Hardhat Explorer', url: '' },
  },
});

const chains = [mainnet, sepolia, hardhatChain];

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'moop-dapp',
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
  chains,
  ssr: false,
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`),
    [hardhatChain.id]: http('http://127.0.0.1:8545'),
  },
  connectors: [
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
      metadata: {
        name: 'moop-dapp',
        description: 'Uniswap V3 Clone',
        url: 'http://localhost:3000',
        icons: ['https://uniswap.org/favicon.ico'],
      },
      showQrModal: true,
      chains,  // include chains here as well
    }),
    injected({ chains }),
  ],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider chains={chains}>
            <App />
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
