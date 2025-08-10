// src/hooks/useWallet.js
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { getWalletClient } from '@wagmi/core';
import { config } from '../wagmi-config';
import { useRef, useCallback } from 'react';


export const useWallet = () => {
  const providerMode = import.meta.env.VITE_WALLET_PROVIDER || 'wagmi'; // or 'thirdweb'

  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

    
    
  const warnedRef = useRef(false);

  const getSigner = useCallback(async () => {
  if (providerMode === 'thirdweb') {
    if (!warnedRef.current) {
      console.warn('Thirdweb mode not yet implemented.');
      warnedRef.current = true;
    }
    return null;
  }

  const walletClient = await getWalletClient(config);

  const { ethers } = await import('ethers');
  const provider = new ethers.BrowserProvider(walletClient);
  return await provider.getSigner();
}, [providerMode, config]);


  return {
    address,
    isConnected,
    getSigner,
    connect,
    disconnect,
    connectors,
    connectError,
  };
};
