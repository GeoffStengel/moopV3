import React, { useState, useEffect } from 'react';
import { useWriteContract, useChainId } from 'wagmi';
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
        return await factoryResponse.json();
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
    const chainId = useChainId();
    const SEPOLIA_WETH9 = '0xa904DA07A28BBa468497042f0b2D581487857971';
    const MAINNET_WETH9 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

    useEffect(() => {
        const fetchArtifacts = async () => {
            const loadedArtifacts = await loadContractArtifacts();
            if (loadedArtifacts && loadedArtifacts.address) {
                setArtifacts({
                    UniswapV3Factory: loadedArtifacts.address,
                    UniswapV3Factory_abi: loadedArtifacts.abi,
                    WETH9: loadedArtifacts.WETH9 || (chainId === 1 ? MAINNET_WETH9 : SEPOLIA_WETH9),
                    TokenMinter: loadedArtifacts.TokenMinter || '0x0000000000000000000000000000000000000000',
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

    const { writeContract, isPending } = useWriteContract();

    const handleCreatePool = async () => {
        if (!tokenA || !tokenB || !fee) {
            setError('Please fill in all fields');
            return;
        }
        try {
            await writeContract({
                address: factoryAddress,
                abi: factoryAbi || artifacts?.UniswapV3Factory_abi,
                functionName: 'createPool',
                args: [tokenA, tokenB, fee],
            });
            setSuccess('Pool creation transaction sent! Check your wallet for confirmation.');
            setError('');
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