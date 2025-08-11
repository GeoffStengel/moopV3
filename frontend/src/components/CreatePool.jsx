import React, { useState, useEffect } from 'react';
import { useWriteContract, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import './CreatePool.css';

const loadContractArtifacts = async () => {
    try {
        const artifactsJson = localStorage.getItem('moopV3Artifacts');
        if (artifactsJson) {
            return JSON.parse(artifactsJson);
        }
        const factoryResponse = await fetch('/artifacts/UniswapV3Factory.json');
        if (!factoryResponse.ok) {
            throw new Error('Failed to fetch UniswapV3Factory artifact');
        }
        const factoryArtifact = await factoryResponse.json();
        return {
            UniswapV3Factory: factoryArtifact.address,
            UniswapV3Factory_abi: factoryArtifact.abi,
            TokenMinter: factoryArtifact.TokenMinter || '0x0000000000000000000000000000000000000000',
            WETH9: factoryArtifact.WETH9,
        };
    } catch (error) {
        console.error('Error loading contract artifacts:', error);
        return null;
    }
};

const CreatePool = ({ factoryAddress: propFactoryAddress, factoryAbi, defaultTokenA, defaultTokenB, defaultFee }) => {
    const [artifacts, setArtifacts] = useState(null);
    const [loadingError, setLoadingError] = useState('');
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [fee, setFee] = useState(defaultFee || 3000);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [poolAddress, setPoolAddress] = useState('');
    const chainId = useChainId();
    const SEPOLIA_WETH9 = '0xa904DA07A28BBa468497042f0b2D581487857971';
    const MAINNET_WETH9 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const FEE_TO = '0xc4042DfAbF63F9d32849ca257b1EE1699a21a134';

    const { writeContract, isPending } = useWriteContract();

    useEffect(() => {
        const fetchArtifacts = async () => {
            const loadedArtifacts = await loadContractArtifacts();
            if (loadedArtifacts && loadedArtifacts.UniswapV3Factory) {
                setArtifacts({
                    ...loadedArtifacts,
                    WETH9: loadedArtifacts.WETH9 || (chainId === 1 ? MAINNET_WETH9 : SEPOLIA_WETH9),
                });
                setTokenA(defaultTokenA || loadedArtifacts.TokenMinter || '0x0000000000000000000000000000000000000000');
                setTokenB(defaultTokenB || (chainId === 1 ? MAINNET_WETH9 : SEPOLIA_WETH9));
            } else {
                setLoadingError('Unable to load contracts. Please try again later or contact support.');
            }
        };
        fetchArtifacts();
    }, [defaultTokenA, defaultTokenB, chainId]);

    if (loadingError) {
        return <div className="error-message">{loadingError}</div>;
    }

    if (!artifacts && !propFactoryAddress) {
        return <div>Loading contract configurations...</div>;
    }

    const factoryAddress = propFactoryAddress || artifacts?.UniswapV3Factory;
    const factoryAbiFinal = factoryAbi || artifacts?.UniswapV3Factory_abi;

    const handleCreatePool = async () => {
        if (!tokenA || !tokenB || !fee) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await writeContract({
                address: factoryAddress,
                abi: factoryAbiFinal,
                functionName: 'createPool',
                args: [tokenA, tokenB, fee],
            });
            const token0 = tokenA < tokenB ? tokenA : tokenB;
            const token1 = tokenA < tokenB ? tokenB : tokenA;
            // Fetch pool address from getPool
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const factoryContract = new ethers.Contract(factoryAddress, factoryAbiFinal, provider);
            const pool = await factoryContract.getPool(token0, token1, fee);
            setPoolAddress(pool);
            setSuccess(`Pool created at: ${pool}! Transaction hash: ${result.hash}`);
            setError('');

            // Enable protocol fees (1/6 of swap fees)
            await writeContract({
                address: pool,
                abi: [
                    {
                        "inputs": [
                            { "internalType": "uint8", "name": "feeProtocol0", "type": "uint8" },
                            { "internalType": "uint8", "name": "feeProtocol1", "type": "uint8" }
                        ],
                        "name": "setFeeProtocol",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ],
                functionName: 'setFeeProtocol',
                args: [6, 6], // 1/6 of swap fees to FEE_TO
            });
            setSuccess(prev => `${prev}\nProtocol fees enabled for pool to ${FEE_TO}!`);
        } catch (err) {
            setError(`Error: ${err.message}`);
            setSuccess('');
        }
    };

    return (
        <div className="create-pool-container">
            <h2>Create Liquidity Pool</h2>
            <div className="form-group">
                <label>Token A Address (default: MOOP)</label>
                <input
                    type="text"
                    value={tokenA}
                    onChange={(e) => setTokenA(e.target.value)}
                    placeholder="Enter Token A address"
                />
            </div>
            <div className="form-group">
                <label>Token B Address (default: WETH)</label>
                <input
                    type="text"
                    value={tokenB}
                    onChange={(e) => setTokenB(e.target.value)}
                    placeholder="Enter Token B address"
                />
            </div>
            <div className="form-group">
                <label>Fee Tier (%)</label>
                <select value={fee} onChange={(e) => setFee(Number(e.target.value))}>
                    <option value={100}>0.01% (Stablecoins)</option>
                    <option value={500}>0.05%</option>
                    <option value={3000}>0.3%</option>
                    <option value={10000}>1%</option>
                </select>
            </div>
            <button onClick={handleCreatePool} disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Pool'}
            </button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default CreatePool;