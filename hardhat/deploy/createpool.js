// test2_swap/frontend/src/CreatePool.jsx
import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import UniswapV3FactoryABI from '../abis/UniswapV3FactoryABI.json';

export default function CreatePool() {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [fee, setFee] = useState('3000');
  const [poolAddress, setPoolAddress] = useState('');
  const [error, setError] = useState('');
  const factoryAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  const positionManagerAddress = '0xPositionManagerAddress'; // Update NonFungiblePositionManager Address 

  const createPool = async () => {
    if (!isConnected || !signer) {
      setError('Please connect wallet');
      return;
    }

    if (!ethers.utils.isAddress(tokenA) || !ethers.utils.isAddress(tokenB)) {
      setError('Invalid token addresses');
      return;
    }

    try {
      const chainId = (await signer.provider.getNetwork()).chainId;
      if (chainId !== 31337 && chainId !== 11155111) {
        setError('Switch to Hardhat (31337) or Sepolia (11155111)');
        return;
      }

      setError('');
      const factory = new ethers.Contract(factoryAddress, UniswapV3FactoryABI.abi, signer);
      const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
      const tx = await factory.createPool(token0, token1, fee);
      const receipt = await tx.wait();
      const poolAddress = receipt.events[0].args.pool;
      setPoolAddress(poolAddress);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const initializePool = async () => {
    if (!poolAddress) {
      setError('No pool created');
      return;
    }
    try {
      const pool = new ethers.Contract(
        poolAddress,
        ["function initialize(uint160 sqrtPriceX96) external"],
        signer
      );
      const sqrtPriceX96 = "79228162514264337593543950336"; // 1:1 price
      const tx = await pool.initialize(sqrtPriceX96);
      await tx.wait();
      setError('Pool initialized');
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const approveTokens = async () => {
    try {
      const tokenContract = new ethers.Contract(
        tokenA,
        ["function approve(address spender, uint256 amount) external"],
        signer
      );
      const tx = await tokenContract.approve(positionManagerAddress, ethers.utils.parseEther("1000"));
      await tx.wait();
      setError('Tokens approved');
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const addLiquidity = async () => {
    if (!poolAddress) {
      setError('No pool created');
      return;
    }
    try {
      const positionManager = new ethers.Contract(
        positionManagerAddress,
        [
          "function mint((address pool, address recipient, int24 tickLower, int24 tickUpper, uint128 amount) params) external returns (uint256 tokenId)"
        ],
        signer
      );
      const params = {
        pool: poolAddress,
        recipient: address,
        tickLower: -887220,
        tickUpper: 887220,
        amount: ethers.utils.parseEther("100")
      };
      const tx = await positionManager.mint(params);
      await tx.wait();
      setError('Liquidity added');
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h1>Create Uniswap V3 Pool</h1>
      <ConnectButton />
      {isConnected && (
        <>
          <p>Connected: {address}</p>
          <div>
            <input
              type="text"
              placeholder="Token A Address (e.g., 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0)"
              value={tokenA}
              onChange={(e) => setTokenA(e.target.value)}
            />
            <input
              type="text"
              placeholder="Token B Address (e.g., 0xTestTokenBAddress)"
              value={tokenB}
              onChange={(e) => setTokenB(e.target.value)}
            />
            <select value={fee} onChange={(e) => setFee(e.target.value)}>
              <option value="500">0.05% (500)</option>
              <option value="3000">0.3% (3000)</option>
              <option value="10000">1% (10000)</option>
            </select>
            <button onClick={createPool}>Create Pool</button>
            {poolAddress && <button onClick={initializePool}>Initialize Pool</button>}
            {poolAddress && <button onClick={approveTokens}>Approve Tokens</button>}
            {poolAddress && <button onClick={addLiquidity}>Add Liquidity</button>}
          </div>
          {poolAddress && <p>Pool created: {poolAddress}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
}