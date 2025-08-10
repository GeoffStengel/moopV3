
import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import UniswapV3FactoryABI from '../abis/UniswapV3Factory.json';
import deployedFactory from '../../../hardhat/saveDeployArtifacts/factory.json';
//import factoryData from '../abis/factory.json';


const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [factoryOwner, setFactoryOwner] = useState(null);

  const factoryAddress = deployedFactory.address;

  useEffect(() => {
    if (isConnected && publicClient) {
      const fetchFactoryOwner = async () => {
        try {
          // Create ethers provider from wagmi publicClient
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const factory = new ethers.Contract(factoryAddress, UniswapV3FactoryABI, signer);

          const owner = await factory.owner();
          setFactoryOwner(owner);
        } catch (err) {
          console.error('Failed to fetch factory owner:', err);
        }
      };

      fetchFactoryOwner();
    }
  }, [isConnected, publicClient]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div  className="connect_btn"><ConnectButton /></div>
      {isConnected && (
        <div>
        {factoryOwner && <p>🧑‍💼 Factory Owner: {factoryOwner}</p>}
        {isConnected && <p>🔗 Connected Address: {address}</p>}
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;

