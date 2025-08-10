import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadContracts, useChainId } from 'wagmi';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import PoolCard from './PoolCard';
import CreatePool from './CreatePool';
import './Pools.css';

// Load contract addresses and ABIs dynamically
const loadContractArtifacts = async () => {
    try {
        // Try localStorage first
        const artifactsJson = localStorage.getItem('moopV3Artifacts');
        if (artifactsJson) {
            return JSON.parse(artifactsJson);
        }
        // Fallback to fetching from public/artifacts/
        const factoryResponse = await fetch('/artifacts/UniswapV3Factory.json');
        if (!factoryResponse.ok) {
            throw new Error('Failed to fetch UniswapV3Factory artifact');
        }
        const factoryArtifact = await factoryResponse.json();
        return {
            UniswapV3Factory: factoryArtifact.address,
            UniswapV3Factory_abi: factoryArtifact.abi,
            // Load other artifacts if needed (e.g., TokenMinter)
        };
    } catch (error) {
        console.error('Error loading contract artifacts:', error);
        return null;
    }
};

// Initialize The Graph client
const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', // Update to MOOP subgraph
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
    const [artifacts, setArtifacts] = useState(null);
    const [loadingError, setLoadingError] = useState('');
    const navigate = useNavigate();
    const chainId = useChainId();
    const SEPOLIA_WETH9 = '0xa904DA07A28BBa468497042f0b2D581487857971';
    const MAINNET_WETH9 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

    // Load artifacts on mount
    useEffect(() => {
        const fetchArtifacts = async () => {
            const loadedArtifacts = await loadContractArtifacts();
            if (loadedArtifacts && loadedArtifacts.UniswapV3Factory) {
                setArtifacts({
                    ...loadedArtifacts,
                    WETH9: loadedArtifacts.WETH9 || (chainId === 1 ? MAINNET_WETH9 : SEPOLIA_WETH9),
                });
            } else {
                setLoadingError('Unable to load contracts. Please try again later or contact support.');
            }
        };
        fetchArtifacts();
    }, [chainId]);

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
        if (chainId && (chainId === 1 || chainId === 11155111) && artifacts) {
            fetchPools();
        }
    }, [chainId, artifacts]);

    if (loadingError) {
        return <div className="error-message">{loadingError}</div>;
    }

    if (!artifacts) {
        return <div>Loading contract configurations...</div>;
    }

    const { UniswapV3Factory, WETH9, UniswapV3Factory_abi } = artifacts;

    // Default MOOP/WETH pool for display (no automatic creation)
    const tokenPairs = [
        {
            tokenA: artifacts.TokenMinter || '0x0000000000000000000000000000000000000000', // Placeholder
            tokenB: WETH9,
            fee: 3000,
        },
    ];

    // Fetch pool addresses on-chain (read-only)
    const poolQueries = tokenPairs.map((pair) => ({
        address: UniswapV3Factory,
        abi: UniswapV3Factory_abi,
        functionName: 'getPool',
        args: [pair.tokenA, pair.tokenB, pair.fee],
    }));

    const { data: poolAddresses } = useReadContracts({
        contracts: poolQueries,
        query: { enabled: !!chainId && (chainId === 1 || chainId === 11155111 || chainId === 31337) && !!UniswapV3Factory },
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
            })).filter(pool => pool.poolAddress && pool.poolAddress !== '0x0000000000000000000000000000000000000000');
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
            {activeView === 'add' && (
                <CreatePool
                    factoryAddress={UniswapV3Factory}
                    factoryAbi={UniswapV3Factory_abi}
                    defaultTokenA={artifacts.TokenMinter || '0x0000000000000000000000000000000000000000'}
                    defaultTokenB={WETH9}
                    defaultFee={3000}
                />
            )}
        </div>
    );
};

export default Pools;