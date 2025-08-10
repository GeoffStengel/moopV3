import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected } from '@wagmi/connectors';
import { http } from 'viem';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Define the Hardhat chain
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

// Create QueryClient
const queryClient = new QueryClient();

// Create Wagmi config with refined WalletConnect options
const config = getDefaultConfig({
  appName: 'Test2 Swap',
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
  chains: [hardhatChain],
  ssr: false,
  transports: {
    [hardhatChain.id]: http('http://127.0.0.1:8545'),
  },
  connectors: [
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
      metadata: {
        name: 'Test2 Swap',
        description: 'Uniswap V3 Clone',
        url: 'http://localhost:3000',
        icons: ['https://uniswap.org/favicon.ico'],
      },
      showQrModal: true, // Ensure QR code works for mobile wallets
      chains: [hardhatChain], // Explicitly set supported chains
    }),
    injected(),
  ],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider chains={[hardhatChain]}>
            <App />
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);