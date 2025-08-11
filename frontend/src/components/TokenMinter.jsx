import React, { useState } from 'react';
import { ethers } from 'ethers';
import TokenMinterABI from '../abis/TokenMinter.json';
import BasicTokenABI from '../abis/BasicToken.json';
import MintableTokenABI from '../abis/MintableToken.json';
import MintableBurnableTokenABI from '../abis/MintableBurnableToken.json';
import PausableTokenABI from '../abis/PausableToken.json';
import AllFeaturesTokenABI from '../abis/AllFeaturesToken.json';
import './TokenMinter.css';

const TokenMinter = () => {
  const [mode, setMode] = useState('Basic'); // Dropdown options: Basic, Mintable, MintableBurnable, Pausable, AllFeatures, MintExisting
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [status, setStatus] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintTokenAddress, setMintTokenAddress] = useState('');
  const [estimatedGas, setEstimatedGas] = useState(null);
  const moopTokenAddress = '0x3091cd5408F5841681774f7fD6222481ccE7Fe69'; // Sepolia
  const tokenMinterAddress = 'YOUR_TOKEN_MINTER_ADDRESS'; // Replace with deployed address

  const isCreateMode = () => mode !== 'MintExisting';
  const isFormValid = () => isCreateMode() ? name.trim() && symbol.trim() && supply && parseFloat(supply) > 0 : mintTokenAddress && mintAmount && parseFloat(mintAmount) > 0;

  const getTokenTypeAndBytecode = () => {
    switch (mode) {
      case 'Mintable': return { type: 'Mintable', bytecode: MintableTokenABI.bytecode };
      case 'MintableBurnable': return { type: 'MintableBurnable', bytecode: MintableBurnableTokenABI.bytecode };
      case 'Pausable': return { type: 'Pausable', bytecode: PausableTokenABI.bytecode };
      case 'AllFeatures': return { type: 'AllFeatures', bytecode: AllFeaturesTokenABI.bytecode };
      default: return { type: 'Basic', bytecode: BasicTokenABI.bytecode };
    }
  };

  const deployToken = async () => {
    try {
      setStatus('🛠 Deploying...');
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check MOOP balance
      let free = false;
      try {
        const moop = new ethers.Contract(moopTokenAddress, [
          'function balanceOf(address owner) view returns (uint256)',
        ], provider);
        const moopBalance = await moop.balanceOf(address);
        free = ethers.formatUnits(moopBalance, 18) >= 1;
      } catch (err) {
        console.warn("Could not check MOOP balance", err);
      }

      const tokenMinter = new ethers.Contract(tokenMinterAddress, TokenMinterABI.abi, signer);
      const supplyParsed = ethers.parseUnits(supply || '0', 18);
      const { type, bytecode } = getTokenTypeAndBytecode();

      const tx = await tokenMinter.createToken(
        type,
        name,
        symbol,
        supplyParsed,
        bytecode,
        { value: free ? 0 : ethers.parseEther("0.001") }
      );
      setStatus('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      const deployedAddress = receipt.events.find(e => e.event === 'TokenCreated').args.tokenAddress;
      setContractAddress(deployedAddress);
      setStatus('✅ Token deployed successfully!');
      setMode('MintExisting'); // Switch to mint mode
      setMintTokenAddress(deployedAddress); // Pre-fill mint address

      // Add to MetaMask
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: deployedAddress,
              symbol: symbol,
              decimals: 18,
              image: '',
            },
          },
        });
      } catch (err) {
        console.warn("Could not add token to MetaMask", err);
      }
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const mintToken = async () => {
    try {
      setStatus('🛠 Minting...');
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      let free = false;
      try {
        const moop = new ethers.Contract(moopTokenAddress, [
          'function balanceOf(address owner) view returns (uint256)',
        ], provider);
        const moopBalance = await moop.balanceOf(address);
        free = ethers.formatUnits(moopBalance, 18) >= 1;
      } catch (err) {
        console.warn("Could not check MOOP balance", err);
      }

      const tokenMinter = new ethers.Contract(tokenMinterAddress, TokenMinterABI.abi, signer);
      const amountParsed = ethers.parseUnits(mintAmount || '0', 18);

      const tx = await tokenMinter.mintExistingToken(
        mintTokenAddress,
        amountParsed,
        { value: free ? 0 : ethers.parseEther("0.001") }
      );
      setStatus('⏳ Waiting for confirmation...');
      await tx.wait();
      setStatus('✅ Tokens minted successfully!');
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const estimateDeploymentGas = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenMinter = new ethers.Contract(tokenMinterAddress, TokenMinterABI.abi, signer);
      const supplyParsed = ethers.parseUnits(supply || '0', 18);
      const { type, bytecode } = getTokenTypeAndBytecode();

      const estimate = await tokenMinter.estimateGas.createToken(type, name, symbol, supplyParsed, bytecode);
      const fee = ethers.formatEther(estimate * BigInt(10000000000)); // 10 gwei
      setEstimatedGas(fee);
      setStatus(`💸 Estimated gas: ~${fee} ETH`);
    } catch (err) {
      console.error('Gas estimate error:', err);
      setStatus('❌ Could not estimate gas');
    }
  };

  return (
    <div className="swap-container">
      <h2>🪄 Token Minter</h2>
      <div className="token-section">
        <label>Action</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
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
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="MyToken" />
            <label>Symbol</label>
            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="MTK" />
            <label>Total Supply</label>
            <input type="number" value={supply} onChange={e => setSupply(e.target.value)} placeholder="1000000" />
            <div className="swap-button-wrapper">
              <button onClick={deployToken} disabled={!isFormValid()}>🚀 Deploy Token</button>
              <button onClick={estimateDeploymentGas} disabled={!isFormValid()}>⛽ Estimate Gas</button>
            </div>
          </>
        ) : (
          <>
            <label>Token Address</label>
            <input type="text" value={mintTokenAddress} onChange={e => setMintTokenAddress(e.target.value)} placeholder="0x..." />
            <label>Amount to Mint</label>
            <input type="number" value={mintAmount} onChange={e => setMintAmount(e.target.value)} placeholder="1000" />
            <div className="swap-button-wrapper">
              <button onClick={mintToken} disabled={!isFormValid()}>🪙 Mint Tokens</button>
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