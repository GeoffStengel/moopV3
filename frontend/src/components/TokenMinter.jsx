// TokenMinter.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ERC20BasicToken from '../abis/ERC20TokenBasic.json';
import ERC20MintableToken from '../abis/ERC20TokenMintable.json';
import ERC20PausableToken from '../abis/ERC20TokenPausable.json';
import ERC20MintableBurnableToken from '../abis/ERC20TokenMintableBurnable.json';
import ERC20AllFeaturesToken from '../abis/ERC20TokenAllFeatures.json';

//import './Swap.css'; // reuse styles
import './TokenMinter.css';

//const moopTokenAddress = '0x75965be2a4c8ba0e9003a512c1914b71e4101ef0'; // MOOP Mainnet Contract Address
  const moopTokenAddress = '0x3091cd5408F5841681774f7fD6222481ccE7Fe69'
const TokenMinter = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [status, setStatus] = useState('');
  const [contractAddress, setContractAddress] = useState('');

   // Added This For More Contract Options START
  const [mintable, setMintable] = useState(true);
  const [burnable, setBurnable] = useState(true);
  const [pausable, setPausable] = useState(false);
  const [votes, setVotes] = useState(false);
  const [ownable, setOwnable] = useState(true);

  const [estimatedGas, setEstimatedGas] = useState(null);
// Added This For More Contract Options END
  
  //Warn if user selects incompatible combos START
  useEffect(() => {
    if (votes && !ownable) {
      setStatus("⚠️ Governance requires Ownable to be enabled.");
    }
  }, [votes, ownable]);
  //Warn if user selects incompatible combos END    
    
    
// Retrieves correct contract ABI Depending On Users Choice 
  const getSelectedContract = () => {
    if (mintable && burnable && pausable && ownable && votes) return ERC20AllFeaturesToken;
    if (mintable && burnable) return ERC20MintableBurnableToken;
      if (mintable) return ERC20MintableToken;
      if (pausable) return ERC20PausableToken;
    return ERC20BasicToken;
  };
    
     
  const deployToken = async () => {
    try {
      setStatus('🛠 Deploying...');

      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if user holds 1 MOOP
      let free = false;
      try {
        const moop = new ethers.Contract(moopTokenAddress, [
          'function balanceOf(address owner) view returns (uint256)',
        ], provider);

        const moopBalance = await moop.balanceOf(address);
        const moopBalanceFormatted = ethers.formatUnits(moopBalance, 18);
        free = parseFloat(moopBalanceFormatted) >= 1;
      } catch (err) {
        console.warn("Could not check MOOP balance", err);
      }

      const selected = getSelectedContract();
      const factory = new ethers.ContractFactory(selected.abi, selected.bytecode, signer);

      const supplyParsed = ethers.parseUnits(supply || '0', 18);

      const feeRecipient = '0xc4042DfAbF63F9d32849ca257b1EE1699a21a134';
      
      if (!free) {
        const tx = await signer.sendTransaction({
          to: feeRecipient,
          value: free ? 0n : ethers.parseEther("0.001"),
        });
        await tx.wait();
      }
      // 
      const tokenContract = await factory.deploy(
        name,
        symbol,
        supplyParsed,
        {
          value: free ? 0n : ethers.parseEther("0.001"),
        }
      );

      setStatus('⏳ Waiting for confirmation...');
      const receipt = await tokenContract.waitForDeployment();
      const deployedAddress = await tokenContract.getAddress();
      setContractAddress(deployedAddress);
      setStatus('✅ Token deployed successfully!');

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
              image: '', // optional
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
  //Gas Estimate START
const estimateDeploymentGas = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const selected = getSelectedContract();
    const factory = new ethers.ContractFactory(selected.abi, selected.bytecode, signer);

    const supplyParsed = ethers.parseUnits(supply || '0', 18);

    const deployTx = await factory.getDeployTransaction(name, symbol, supplyParsed);
    const estimate = await provider.estimateGas(deployTx);

    const fee = ethers.formatEther(estimate * BigInt(10000000000)); // 10 gwei estimate
    setEstimatedGas(fee);
    setStatus(`💸 Estimated gas: ~${fee} ETH`);
  } catch (err) {
    console.error('Gas estimate error:', err);
    setStatus('❌ Could not estimate gas');
  }
};
  //GasEstimate END


    
  return (
    <div className="swap-container">
      <h2>🪄 Mint Your Own Token</h2>

      <div className="token-section">
        <label>Token Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="MyToken" />

        <label>Symbol</label>
        <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="MTK" />

        <label>Total Supply</label>
        <input type="number" value={supply} onChange={e => setSupply(e.target.value)} placeholder="1000000" />
      </div>

    <div className="feature-options">
      <h4>🔧 Optional Features</h4>
      <label>
        <input type="checkbox" checked={mintable} onChange={() => setMintable(!mintable)} /> Mintable
      </label>
      <label>
        <input type="checkbox" checked={burnable} onChange={() => setBurnable(!burnable)} /> Burnable
      </label>
      <label>
        <input type="checkbox" checked={pausable} onChange={() => setPausable(!pausable)} /> Pausable
      </label>
      <label>
        <input type="checkbox" checked={votes} onChange={() => setVotes(!votes)} /> Governance / Votes
      </label>
      <label>
        <input type="checkbox" checked={ownable} onChange={() => setOwnable(!ownable)} /> Ownable Access
      </label>
    </div>

          

    <div className="swap-button-wrapper" style={{ marginTop: '20px' }}>
      <button onClick={deployToken}>🚀 Deploy Token</button>
      <button onClick={estimateDeploymentGas} style={{ marginLeft: '10px' }}>
        ⛽ Estimate Gas
      </button>
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
