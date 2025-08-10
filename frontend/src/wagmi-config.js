// src/wagmi-config.js
//import { configureChains, createConfig } from 'wagmi';
//import { publicProvider } from 'wagmi/providers/public';
//import { mainnet, sepolia, localhost } from 'wagmi/chains';
//import { injectedConnector } from 'wagmi/connectors/injected';
//
//const { chains, publicClient } = configureChains(
//  [localhost, sepolia],
//  [publicProvider()]
//);
//
//export const config = createConfig({
//  autoConnect: true,
//  connectors: [
//    injectedConnector({ chains }),
//  ],
//  publicClient,
//});
//
//export { chains };
//

// src/wagmi-config.js
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

import { INFURA_PROJECT_ID } from './infuraConfig'; // ✅ use from config

const chains = [mainnet, sepolia, localhost];

export const config = createConfig({
  connectors: [injected({ chains })],
  chains,
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`),
    [localhost.id]: http(), // default
  },
  ssr: false,
});

export { chains };
