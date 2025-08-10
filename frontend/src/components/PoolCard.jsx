import React, { useEffect, useState } from 'react';
     import { useChainId } from 'wagmi';
     import { ethers } from 'ethers';
     import { loadTokenList } from '../utils/loadTokenList';
     import UniswapV3PoolABI from '../abis/UniswapV3Pool.json';
     import './PoolCard.css';

     const PoolCard = ({ pool, onView }) => {
       const chainId = useChainId(); // Correctly use useChainId
       const [tokenData, setTokenData] = useState([]);
       const [isLoading, setIsLoading] = useState(true);
       const [metrics, setMetrics] = useState({ liquidity: '0', price: '0' });

       useEffect(() => {
         const fetchTokenList = async () => {
           try {
             const list = await loadTokenList(chainId || 11155111); // Use chainId
             setTokenData(list.tokens || []);
           } catch (err) {
             console.error('Failed to load token list:', err);
             setTokenData([]);
           } finally {
             setIsLoading(false);
           }
         };

         fetchTokenList();
       }, [chainId]);

       useEffect(() => {
         const fetchMetrics = async () => {
           if (pool.poolAddress && chainId) {
             try {
               const provider = new ethers.providers.Web3Provider(window.ethereum);
               const poolContract = new ethers.Contract(pool.poolAddress, UniswapV3PoolABI.abi, provider);
               const [slot0, liquidity] = await Promise.all([
                 poolContract.slot0(),
                 poolContract.liquidity(),
               ]);
               const price = ((slot0.sqrtPriceX96 ** 2) / (2 ** 192)).toFixed(6);
               setMetrics({ liquidity: liquidity.toString(), price });
             } catch (err) {
               console.error('Failed to fetch pool metrics:', err);
             }
           }
         };

         if (pool.poolAddress !== '0x0000000000000000000000000000000000000000') {
           fetchMetrics();
         }
       }, [pool.poolAddress, chainId]);

       const getTokenMeta = (address) => {
         if (!address) return null;
         return tokenData.find(
           (token) => token.address && token.address.toLowerCase() === address.toLowerCase()
         ) || { name: 'Unknown', symbol: 'UNK', logoURI: '' };
       };

       if (isLoading) {
         return (
           <div className="pool-card loading">
             <p>Loading pool data...</p>
           </div>
         );
       }

       const tokenA = getTokenMeta(pool.tokenAAddress);
       const tokenB = getTokenMeta(pool.tokenBAddress);

       if (!tokenA || !tokenB) {
         return (
           <div className="pool-card fallback">
             <div className="pool-info">
               <span className="pool-name">🔍 No valid tokens found</span>
               <p>It seems like there is no valid token information. You can create a new pool to get started.</p>
             </div>
             <button className="view-pool-button" onClick={() => onView(pool)}>
               View Pool
             </button>
           </div>
         );
       }

       return (
         <div className="pool-card">
           <div className="pool-info">
             <span className="pool-name">
               🔍 Pool {tokenA.symbol} - {tokenB.symbol}
             </span>
             <div className="token-icons">
               {tokenA.logoURI && (
                 <img src={tokenA.logoURI} alt={tokenA.symbol} className="token-icon" />
               )}
               {tokenB.logoURI && (
                 <img src={tokenB.logoURI} alt={tokenB.symbol} className="token-icon" />
               )}
             </div>
             <div className="pool-metrics">
               <p><strong>Liquidity:</strong> {metrics.liquidity}</p>
               <p><strong>Price:</strong> {metrics.price} {tokenA.symbol}/{tokenB.symbol}</p>
               <p><strong>Fee:</strong> {pool.fee / 10000}%</p>
             </div>
           </div>
           <button className="view-pool-button" onClick={() => onView(pool)}>
             View Pool
           </button>
         </div>
       );
     };

     export default PoolCard;