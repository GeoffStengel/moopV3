// src/components/BlockchainTest.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { RPC_URL } from '../config';

const BlockchainTest = () => {
  const [blockNumber, setBlockNumber] = useState(null);

  useEffect(() => {
    const fetchBlock = async () => {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const block = await provider.getBlockNumber();
      setBlockNumber(block);
    };

    fetchBlock();
  }, []);

  return (
    <div style={{ color: 'white' }}>
      <h3>Live Block Number (via Infura): {blockNumber}</h3>
    </div>
  );
};

export default BlockchainTest;
