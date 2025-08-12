import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import TokenMinterABI from '../abis/TokenMinter.json';
import BasicTokenABI from '../abis/BasicToken.json';
import MintableTokenABI from '../abis/MintableToken.json';
import MintableBurnableTokenABI from '../abis/MintableBurnableToken.json';
import PausableTokenABI from '../abis/PausableToken.json';
import AllFeaturesTokenABI from '../abis/AllFeaturesToken.json';
import './TokenMinter.css';

const TokenMinter = ({ isConnected, signer, connectWallet }) => {
  const [mode, setMode] = useState('Basic');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [status, setStatus] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintTokenAddress, setMintTokenAddress] = useState('');
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const moopTokenAddress = import.meta.env.VITE_MOOP_TOKEN_ADDRESS || '0x3091cd5408F5841681774f7fD6222481ccE7Fe69';
  const tokenMinterAddress = import.meta.env.VITE_TOKEN_MINTER_ADDRESS || '0xYourDeployedAddress';

  const isCreateMode = () => mode !== 'MintExisting';
  const isFormValid = useCallback(() => {
    if (isCreateMode()) {
      return name.trim() && symbol.trim() && supply && parseFloat(supply) > 0;
    }
    return ethers.isAddress(mintTokenAddress) && mintAmount && parseFloat(mintAmount) > 0;
  }, [mode, name, symbol, supply, mintTokenAddress, mintAmount]);

  const getTokenTypeAndBytecode = useCallback(() => {
    switch (mode) {
      case 'Mintable': return { type: 'Mintable', bytecode: MintableTokenABI.bytecode };
      case 'MintableBurnable': return { type: 'MintableBurnable', bytecode: MintableBurnableTokenABI.bytecode };
      case 'Pausable': return { type: 'Pausable', bytecode: PausableTokenABI.bytecode };
      case 'AllFeatures': return { type: 'AllFeatures', bytecode: AllFeaturesTokenABI.bytecode };
      default: return { type: 'Basic', bytecode: BasicTokenABI.bytecode };
    }
  }, [mode]);

  useEffect(() => {
    if (!isConnected || !signer) {
      setStatus('❌ Please connect wallet via the top button');
    } else {
      setStatus('');
    }
  }, [isConnected, signer]);

  const deployToken = async () => {
    if (!isFormValid() || !isConnected || !signer) {
      if (!isConnected || !signer) {
        connectWallet();
        setStatus('❌ Please connect wallet via the top button');
      }
      return;
    }
    setIsLoading(true);
    let contract;
    try {
      setStatus('🛠 Deploying...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111n) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }]
        });
        throw new Error('Switched to Sepolia, please retry');
      }

      contract = new ethers.Contract(tokenMinterAddress, TokenMinterABI.abi, signer);
      const address = await signer.getAddress();
      let free = false;
      try {
        const moop = new ethers.Contract(moopTokenAddress, ['function balanceOf(address) view returns (uint256)'], provider);
        const moopBalance = await moop.balanceOf(address);
        free = ethers.formatUnits(moopBalance, 18) >= 1;
      } catch (err) {
        console.warn('Could not check MOOP balance:', err);
      }

      const supplyParsed = ethers.parseUnits(supply || '0', 18);
      const { type, bytecode } = getTokenTypeAndBytecode();
      const tx = await contract.createToken(type, name, symbol, supplyParsed, bytecode, {
        value: free ? 0n : ethers.parseEther('0.001')
      });
      setStatus('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      const event = receipt.logs
        .map(log => contract.interface.parseLog(log))
        .find(e => e?.name === 'TokenCreated');
      if (!event) throw new Error('TokenCreated event not found');
      const deployedAddress = event.args.tokenAddress;
      setContractAddress(deployedAddress);
      setStatus('✅ Token deployed successfully!');
      setMode('MintExisting');
      setMintTokenAddress(deployedAddress);

      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: deployedAddress,
              symbol: symbol,
              decimals: 18,
              image: 'https://your-token-logo.png'
            }
          }
        });
      } catch (err) {
        console.warn('Could not add token to MetaMask:', err);
      }
    } catch (err) {
      const reason = err.reason || (contract ? contract.interface.parseError(err.data)?.name : null) || err.message;
      setStatus(`❌ Error: ${reason}`);
    } finally {
      setIsLoading(false);
    }
  };

  const mintToken = async () => {
    if (!isFormValid() || !isConnected || !signer) {
      if (!isConnected || !signer) {
        connectWallet();
        setStatus('❌ Please connect wallet via the top button');
      }
      return;
    }
    setIsLoading(true);
    let contract;
    try {
      setStatus('🛠 Minting...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111n) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }]
        });
        throw new Error('Switched to Sepolia, please retry');
      }

      contract = new ethers.Contract(tokenMinterAddress, TokenMinterABI.abi, signer);
      const address = await signer.getAddress();
      let free = false;
      try {
        const moop = new ethers.Contract(moopTokenAddress, ['function balanceOf(address) view returns (uint256)'], provider);
        const moopBalance = await moop.balanceOf(address);
        free = ethers.formatUnits(moopBalance, 18) >= 1;
      } catch (err) {
        console.warn('Could not check MOOP balance:', err);
      }

      const amountParsed = ethers.parseUnits(mintAmount || '0', 18);
      const tx = await contract.mintExistingToken(mintTokenAddress, amountParsed, {
        value: free ? 0n : ethers.parseEther('0.001')
      });
      setStatus('⏳ Waiting for confirmation...');
      await tx.wait();
      setStatus('✅ Tokens minted successfully!');
    } catch (err) {
      const reason = err.reason || (contract ? contract.interface.parseError(err.data)?.name : null) || err.message;
      setStatus(`❌ Error: ${reason}`);
    } finally {
      setIsLoading(false);
    }
  };

  const estimateDeploymentGas = async () => {
    if (!isFormValid() || !isConnected || !signer) {
      if (!isConnected || !signer) {
        connectWallet();
        setStatus('❌ Please connect wallet via the top button');
      }
      return;
    }
    setIsLoading(true);
    let contract;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111n) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }]
        });
        throw new Error('Switched to Sepolia, please retry');
      }

      contract = new ethers.Contract(tokenMinterAddress, TokenMinterABI.abi, signer);
      const address = await signer.getAddress();
      let free = false;
      try {
        const moop = new ethers.Contract(moopTokenAddress, ['function balanceOf(address) view returns (uint256)'], provider);
        const moopBalance = await moop.balanceOf(address);
        free = ethers.formatUnits(moopBalance, 18) >= 1;
      } catch (err) {
        console.warn('Could not check MOOP balance:', err);
      }

      const supplyParsed = ethers.parseUnits(supply || '0', 18);
      const { type, bytecode } = getTokenTypeAndBytecode();
      const estimate = await contract.estimateGas.createToken(type, name, symbol, supplyParsed, bytecode, {
        value: free ? 0n : ethers.parseEther('0.001')
      });
      const gasPrice = await provider.getFeeData().gasPrice;
      const fee = ethers.formatEther(estimate * (gasPrice || 10n**9n));
      setEstimatedGas(fee);
      setStatus(`💸 Estimated gas: ~${fee} ETH`);
    } catch (err) {
      const reason = err.reason || (contract ? contract.interface.parseError(err.data)?.name : null) || err.message;
      setStatus(`❌ Error: ${reason}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="swap-container">
      <h2>🪄 Token Minter</h2>
      {!isConnected && <p className="swap-result error">Please connect wallet via the top button</p>}
      <div className="token-section">
        <label>Action</label>
        <select value={mode} onChange={e => setMode(e.target.value)} disabled={isLoading || !isConnected}>
          <option value="Basic">Basic Token</option>
          <option value="Mintable">Mintable Token</option>
          <option value="MintableBurnable">Mintable & Burnable Token</option>
          <option value="Pausable">Pausable Token</option>
          <option value="AllFeatures">All Features Token</option>
          <option value="MintExisting">Mint Existing Token</option>
        </select>
        {isCreateMode() ? (
          <>
            <label>Token Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 32))}
              placeholder="MyToken"
              disabled={isLoading || !isConnected}
              aria-label="Token Name"
            />
            <label>Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={e => setSymbol(e.target.value.slice(0, 10))}
              placeholder="MTK"
              disabled={isLoading || !isConnected}
              aria-label="Token Symbol"
            />
            <label>Total Supply</label>
            <input
              type="number"
              value={supply}
              onChange={e => setSupply(e.target.value)}
              placeholder="1000000"
              disabled={isLoading || !isConnected}
              aria-label="Total Supply"
            />
            <div className="swap-button-wrapper">
              <button onClick={deployToken} disabled={!isFormValid() || isLoading || !isConnected}>
                🚀 {isLoading ? 'Deploying...' : 'Deploy Token'}
              </button>
              <button onClick={estimateDeploymentGas} disabled={!isFormValid() || isLoading || !isConnected}>
                ⛽ {isLoading ? 'Estimating...' : 'Estimate Gas'}
              </button>
            </div>
          </>
        ) : (
          <>
            <label>Token Address</label>
            <input
              type="text"
              value={mintTokenAddress}
              onChange={e => setMintTokenAddress(e.target.value)}
              placeholder="0x..."
              disabled={isLoading || !isConnected}
              aria-label="Token Address"
            />
            <label>Amount to Mint</label>
            <input
              type="number"
              value={mintAmount}
              onChange={e => setMintAmount(e.target.value)}
              placeholder="1000"
              disabled={isLoading || !isConnected}
              aria-label="Amount to Mint"
            />
            <div className="swap-button-wrapper">
              <button onClick={mintToken} disabled={!isFormValid() || isLoading || !isConnected}>
                🪙 {isLoading ? 'Minting...' : 'Mint Tokens'}
              </button>
            </div>
          </>
        )}
      </div>
      {status && <div className="swap-result">{status}</div>}
      {contractAddress && (
        <div className="swap-result">
          <p>
            View on{' '}
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Etherscan
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenMinter;