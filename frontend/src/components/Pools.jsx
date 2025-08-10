import React, { useState, useEffect } from 'react';
     import { useNavigate } from 'react-router-dom';
     import { useReadContracts, useChainId } from 'wagmi';
     import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
     import PoolCard from './PoolCard';
     import CreatePool from './CreatePool';
     import factoryAbi from '../abis/UniswapV3Factory.json';
     import './Pools.css';

     // Hardcode factory address temporarily (replace with your deployed address)
     const FACTORY_ADDRESS = '0xYOUR_DEPLOYED_FACTORY_ADDRESS'; // Replace with actual factory address

     // Initialize The Graph client
     const client = new ApolloClient({
       uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
       cache: new InMemoryCache(),
     });

     const POOLS_QUERY = gql`
       {
         pools(first: 100) {
           id
           token0 { id, symbol, name }
           token1 { id, symbol, name }
           fee
           liquidity
           tick
         }
       }
     `;

     const Pools = () => {
       const [activeView, setActiveView] = useState('view');
       const [pools, setPools] = useState([]);
       const navigate = useNavigate();
       const chainId = useChainId();

       // Fetch pools from The Graph
       useEffect(() => {
         const fetchPools = async () => {
           try {
             const { data } = await client.query({ query: POOLS_QUERY });
             const fetchedPools = data.pools.map((pool, index) => ({
               id: index + 1,
               poolAddress: pool.id,
               tokenAAddress: pool.token0.id,
               tokenAName: pool.token0.name,
               tokenASymbol: pool.token0.symbol,
               tokenBAddress: pool.token1.id,
               tokenBName: pool.token1.name,
               tokenBSymbol: pool.token1.symbol,
               fee: pool.fee,
               liquidity: pool.liquidity,
               tick: pool.tick,
             }));
             setPools(fetchedPools);
           } catch (err) {
             console.error('Error fetching pools from The Graph:', err);
             setPools([]);
           }
         };

         if (chainId && (chainId === 1 || chainId === 11155111)) {
           fetchPools();
         }
       }, [chainId]);

       // Example token pairs for on-chain queries (optional fallback)
       const tokenPairs = [
         {
           tokenA: chainId === 1 ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' : '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH (Sepolia WETH for testnet)
           tokenB: chainId === 1 ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' : '0xYOUR_SEPOLIA_USDC', // USDC (replace with Sepolia USDC or MOOP)
           fee: 3000,
         },
       ];

       // Fetch pool addresses on-chain as a fallback
       const poolQueries = tokenPairs.map((pair) => ({
         address: FACTORY_ADDRESS,
         abi: factoryAbi.abi,
         functionName: 'getPool',
         args: [pair.tokenA, pair.tokenB, pair.fee],
       }));

       const { data: poolAddresses } = useReadContracts({
         contracts: poolQueries,
         query: { enabled: !!chainId && (chainId === 1 || chainId === 11155111 || chainId === 31337) },
       });

       // Combine on-chain pools with The Graph data
       useEffect(() => {
         if (poolAddresses) {
           const onChainPools = poolAddresses.map((result, index) => ({
             id: pools.length + index + 1,
             poolAddress: result.data,
             tokenAAddress: tokenPairs[index].tokenA,
             tokenBAddress: tokenPairs[index].tokenB,
             fee: tokenPairs[index].fee,
           })).filter(pool => pool.poolAddress !== '0x0000000000000000000000000000000000000000');
           setPools(prev => [...prev, ...onChainPools]);
         }
       }, [poolAddresses]);

       const handleViewPool = (pool) => {
         navigate(`/pool/${pool.poolAddress}`);
       };

       return (
         <div className="liquidity-container">
           <div className="view-toggle">
             <button
               className={activeView === 'view' ? 'active' : ''}
               onClick={() => setActiveView('view')}
             >
               View Pools
             </button>
             <button onClick={() => setActiveView('add')}>
               Add Liquidity
             </button>
           </div>

           {activeView === 'view' && (
             <div className="pool-view">
               <h2>Liquidity Pools</h2>
               <div className="pools-grid">
                 {pools.length ? (
                   pools.map((pool) => (
                     <PoolCard key={pool.id} pool={pool} onView={handleViewPool} />
                   ))
                 ) : (
                   <p>No pools available.</p>
                 )}
               </div>
             </div>
           )}

           {activeView === 'add' && <CreatePool />}
         </div>
       );
     };

     export default Pools;