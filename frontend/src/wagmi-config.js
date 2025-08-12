import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

import { INFURA_PROJECT_ID } from './infuraConfig';

// Define the chains you want to support
const chains = [mainnet, sepolia, localhost];

export const config = createConfig({
  chains,
  connectors: [
    injected({ chains }), // MetaMask & browser wallets
    walletConnect({
      projectId: INFURA_PROJECT_ID, // You can also use a dedicated WC projectId
      metadata: {
        name: 'moop-dapp',
        description: 'My decentralized app',
        url: 'https://mydapp.com',
        icons: ['https://mydapp.com/icon.png'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`),
    [localhost.id]: http(), // default localhost RPC
  },
  ssr: false,
});

export { chains };
