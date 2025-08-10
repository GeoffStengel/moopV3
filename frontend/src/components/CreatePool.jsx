import React, { useState, useEffect } from 'react';
     import { ConnectButton } from '@rainbow-me/rainbowkit';
     import { useAccount, useWalletClient, useChainId } from 'wagmi';
     import { ethers } from 'ethers';
     import UniswapV3FactoryABI from '../abis/UniswapV3Factory.json';
     import UniswapV3PoolABI from '../abis/UniswapV3Pool.json';
     import ERC20ABI from '../abis/IERC20.json';
     import NonfungiblePositionManagerABI from '../abis/NonfungiblePositionManager.json';

     // Hardcode contract addresses temporarily (replace with your deployed addresses)
     const factoryAddress = '0xYOUR_DEPLOYED_FACTORY_ADDRESS'; // Replace with actual factory address
     const positionManagerAddress = '0xYOUR_DEPLOYED_POSITION_MANAGER_ADDRESS'; // Replace with actual position manager address

     export default function CreatePool() {
       const { address, isConnected } = useAccount();
       const { data: walletClient } = useWalletClient();
       const chainId = useChainId();
       const [tokenA, setTokenA] = useState('');
       const [tokenB, setTokenB] = useState('');
       const [fee, setFee] = useState('3000');
       const [initialPrice, setInitialPrice] = useState('1');
       const [poolAddress, setPoolAddress] = useState('');
       const [error, setError] = useState('');
       const [status, setStatus] = useState('');

       useEffect(() => {
         if (chainId && chainId !== 1 && chainId !== 11155111 && chainId !== 31337) {
           setError('Please switch to Ethereum Mainnet (1), Sepolia (11155111), or Hardhat (31337)');
         } else {
           setError('');
         }
       }, [chainId]);

       const createPool = async () => {
         if (!isConnected || !walletClient) {
           setError('Please connect wallet');
           return;
         }

         if (!ethers.utils.isAddress(tokenA) || !ethers.utils.isAddress(tokenB)) {
           setError('Invalid token addresses');
           return;
         }

         try {
           setError('');
           setStatus('Creating pool...');
           const provider = new ethers.providers.Web3Provider(walletClient.transport);
           const signer = provider.getSigner();
           const factory = new ethers.Contract(factoryAddress, UniswapV3FactoryABI.abi, signer);
           const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
           const tx = await factory.createPool(token0, token1, fee);
           const receipt = await tx.wait();
           const poolAddress = receipt.events.find(e => e.event === 'PoolCreated').args.pool;
           setPoolAddress(poolAddress);
           setStatus(`Pool created: ${poolAddress}`);
         } catch (err) {
           setError(`Error creating pool: ${err.message}`);
           setStatus('');
         }
       };

       const initializePool = async () => {
         if (!poolAddress) {
           setError('No pool created');
           return;
         }
         try {
           setError('');
           setStatus('Initializing pool...');
           const provider = new ethers.providers.Web3Provider(walletClient.transport);
           const signer = provider.getSigner();
           const pool = new ethers.Contract(poolAddress, UniswapV3PoolABI.abi, signer);
           const sqrtPriceX96 = ethers.BigNumber.from(Math.sqrt(parseFloat(initialPrice)) * (2 ** 96)).toString();
           const tx = await pool.initialize(sqrtPriceX96);
           await tx.wait();
           setStatus('Pool initialized');
         } catch (err) {
           setError(`Error initializing pool: ${err.message}`);
           setStatus('');
         }
       };

       const approveTokens = async () => {
         if (!poolAddress) {
           setError('No pool created');
           return;
         }
         try {
           setError('');
           setStatus('Approving tokens...');
           const provider = new ethers.providers.Web3Provider(walletClient.transport);
           const signer = provider.getSigner();
           const tokenContractA = new ethers.Contract(tokenA, ERC20ABI.abi, signer);
           const tokenContractB = new ethers.Contract(tokenB, ERC20ABI.abi, signer);
           const amount = ethers.utils.parseEther("1000");
           const txA = await tokenContractA.approve(positionManagerAddress, amount);
           const txB = await tokenContractB.approve(positionManagerAddress, amount);
           await txA.wait();
           await txB.wait();
           setStatus('Tokens approved');
         } catch (err) {
           setError(`Error approving tokens: ${err.message}`);
           setStatus('');
         }
       };

       const addLiquidity = async () => {
         if (!poolAddress) {
           setError('No pool created');
           return;
         }
         try {
           setError('');
           setStatus('Adding liquidity...');
           const provider = new ethers.providers.Web3Provider(walletClient.transport);
           const signer = provider.getSigner();
           const positionManager = new ethers.Contract(positionManagerAddress, NonfungiblePositionManagerABI.abi, signer);
           const params = {
             token0: tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB,
             token1: tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA,
             fee: parseInt(fee),
             recipient: address,
             tickLower: -887220,
             tickUpper: 887220,
             amount0Desired: ethers.utils.parseEther("100"),
             amount1Desired: ethers.utils.parseEther("100"),
             amount0Min: 0,
             amount1Min: 0,
             deadline: Math.floor(Date.now() / 1000) + 60 * 20,
           };
           const tx = await positionManager.mint(params);
           await tx.wait();
           setStatus('Liquidity added');
         } catch (err) {
           setError(`Error adding liquidity: ${err.message}`);
           setStatus('');
         }
       };

       return (
         <div>
           <h1>Create Uniswap V3 Pool</h1>
           <ConnectButton />
           {isConnected && (
             <div>
               <p>Connected: {address}</p>
               <div>
                 <input
                   type="text"
                   placeholder="Token A Address"
                   value={tokenA}
                   onChange={(e) => setTokenA(e.target.value)}
                 />
                 <input
                   type="text"
                   placeholder="Token B Address"
                   value={tokenB}
                   onChange={(e) => setTokenB(e.target.value)}
                 />
                 <select value={fee} onChange={(e) => setFee(e.target.value)}>
                   <option value="500">0.05% (500)</option>
                   <option value="3000">0.3% (3000)</option>
                   <option value="10000">1% (10000)</option>
                 </select>
                 <input
                   type="text"
                   placeholder="Initial Price (TokenA/TokenB)"
                   value={initialPrice}
                   onChange={(e) => setInitialPrice(e.target.value)}
                 />
                 <button onClick={createPool}>Create Pool</button>
                 {poolAddress && <button onClick={initializePool}>Initialize Pool</button>}
                 {poolAddress && <button onClick={approveTokens}>Approve Tokens</button>}
                 {poolAddress && <button onClick={addLiquidity}>Add Liquidity</button>}
               </div>
               {poolAddress && <p>Pool created: {poolAddress}</p>}
               {status && <p style={{ color: 'green' }}>{status}</p>}
               {error && <p style={{ color: 'red' }}>{error}</p>}
             </div>
           )}
         </div>
       );
     }