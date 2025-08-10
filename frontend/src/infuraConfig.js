// test2_swap/hardhat/frontend/src/infuraConfig.js
//import { ethers } from 'ethers';
//
//export const INFURA_PROJECT_ID = "ffa5449f44f34b01ab51c931e9687049";
//export const SEPOLIA_RPC_URL = `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`;
//export const HARDHAT_RPC_URL = "http://127.0.0.1:8545";
//export const RPC_URL = HARDHAT_RPC_URL; // Use Hardhat for testing
//export const provider = new ethers.JsonRpcProvider(RPC_URL);
//
//export default provider;
// src/infuraConfig.js
// src/infuraConfig.js
// src/infuraConfig.js
import { ethers } from 'ethers';

// 👇 Set network statically for now (can be dynamic later via import.meta.env.VITE_NETWORK)
export const NETWORK = 'sepolia'; // or 'localhost' or 'mainnet'

// 👇 Export project ID so wagmi-config.js can use it
export const INFURA_PROJECT_ID = 'ffa5449f44f34b01ab51c931e9687049';

export const RPC_URLS = {
  localhost: 'http://127.0.0.1:8545',
  sepolia: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
  mainnet: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
};

// 👇 The selected URL based on network (used by `ethers` and other modules)
export const RPC_URL = RPC_URLS[NETWORK];

// 👇 Reusable Ethers provider
export const provider = new ethers.JsonRpcProvider(RPC_URL);

//export default provider;
