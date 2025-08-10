// Swap.jsx
import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useChainId } from 'wagmi';

import { ethers } from 'ethers';
import './Swap.css';
import SwapRouterABI from '../abis/SwapRouter.json';
import { loadTokenList } from '../utils/loadTokenList';


const tokenAbi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

const ROUTER_ADDRESSES = {
  mainnet: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  sepolia: '0xYourSepoliaRouterAddress', // replace with actual
};

const Swap = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
 

  const [amountIn, setAmountIn] = useState('');
  const [swapResult, setSwapResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tokenInSymbol, setTokenInSymbol] = useState('MOOP');
  const [tokenOutSymbol, setTokenOutSymbol] = useState('WETH');
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');

  const [moopBalance, setMoopBalance] = useState('');
  const [wethBalance, setWethBalance] = useState('');
  const [networkLabel, setNetworkLabel] = useState('');
  const [tokenList, setTokenList] = useState([]);

  const [amountOutPreview, setAmountOutPreview] = useState('');

  const [slippage, setSlippage] = useState('0.5'); // default to 0.5%
 const slippageToleranceBps = Math.floor(parseFloat(slippage) * 100);

  const uniqueTokenList = [...new Map(tokenList.map(t => [t.address, t])).values()];
  
  //FOR APPROVING SWAPS
  const [isApproved, setIsApproved] = useState(false);

 

  useEffect(() => {
    const selectedIn = tokenList.find((t) => t.symbol === tokenInSymbol);
    const selectedOut = tokenList.find((t) => t.symbol === tokenOutSymbol);
    if (selectedIn) setTokenIn(selectedIn.address);
    if (selectedOut) setTokenOut(selectedOut.address);
  }, [tokenInSymbol, tokenOutSymbol]);

  useEffect(() => {
    if (amountIn && !isNaN(amountIn) && parseFloat(amountIn) > 0) {
      fetchQuote();
    } else {
      setAmountOutPreview('');
    }
  }, [amountIn, tokenIn, tokenOut]);

  useEffect(() => {
    setAmountOutPreview('');
  }, [tokenIn, tokenOut]);

  useEffect(() => {
  if (!isConnected || !walletClient) return;
  fetchBalances();
}, [isConnected, walletClient, tokenIn, tokenOut]);

  
  useEffect(() => {
    if (!isConnected || !walletClient) return;

  const setupTokenList = async () => {
    try {
      const list = await loadTokenList(chainId || 31337); // Use chainId directly
      const uniqueList = [...new Map(list.tokens.map(t => [t.address, t])).values()];
      setTokenList(uniqueList);
    } catch (err) {
      console.error('Failed to load token list:', err);
    }
  };

  setupTokenList();
}, [isConnected, walletClient, chainId]);

  
  useEffect(() => {
  if (!chainId) return;

  const networkNames = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    31337: 'Hardhat Local',
    1337: 'Hardhat (Metamask)',
  };

  const name = networkNames[Number(chainId)] || `Unknown (${chainId})`;
  setNetworkLabel(name);
}, [chainId]);





  const getRouterAddress = async () => {
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const network = await provider.getNetwork();
      return ROUTER_ADDRESSES[network.name] ?? ROUTER_ADDRESSES.mainnet;
    } catch (err) {
      console.error('Could not resolve router address. Using default.');
      return ROUTER_ADDRESSES.mainnet;
    }
  };


  //Adujsted Here START
  const fetchQuote = async () => {
  if (!walletClient) return;

  try {
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();

    let decimals = 18;
    if (ethers.isAddress(tokenIn)) {
      try {
        const token = new ethers.Contract(tokenIn, ['function decimals() view returns (uint8)'], signer);
        decimals = await token.decimals();
      } catch (err) {
        console.warn('Could not fetch decimals for tokenIn:', tokenIn, err);
      }
    }

    const amountParsed = ethers.parseUnits(amountIn, decimals);
  
    // Use mock fallback for preview
    const mockOutAmount = amountParsed * 98n / 100n; // 2% loss
    const formatted = ethers.formatUnits(mockOutAmount, decimals);
    setAmountOutPreview(formatted);
  
    // Optional: print mock log for clarity
    console.log(`Mock quote: ${formatted}`);
  } catch (err) {
    console.error('Quote fetch failed:', err);
    setAmountOutPreview('');
  }
};
//Adjusted Here END

  



//ADDED To fetchbalances if theres a new mistake START  
const [error, setError] = useState("");
const fetchBalances = async () => {
  setError(""); // clear previous error

  if (!isConnected || !walletClient || !tokenIn || !tokenOut) return;

  const provider = new ethers.BrowserProvider(walletClient.transport);

  const tokenInCode = await provider.getCode(tokenIn);
  const tokenOutCode = await provider.getCode(tokenOut);
  if (tokenInCode === '0x' || tokenOutCode === '0x') {
    setError("⚠️ One of the token addresses is invalid or not deployed on this network.");
    return;
  }

  try {
    //const provider = new ethers.BrowserProvider(walletClient.transport);
    const moop = new ethers.Contract(tokenIn, tokenAbi, provider);
    const weth = new ethers.Contract(tokenOut, tokenAbi, provider);

    const [moopRaw, moopDecimals] = await Promise.all([
      moop.balanceOf(address),
      moop.decimals()
    ]);

    const [wethRaw, wethDecimals] = await Promise.all([
      weth.balanceOf(address),
      weth.decimals()
    ]);

    setMoopBalance(ethers.formatUnits(moopRaw, moopDecimals));
    setWethBalance(ethers.formatUnits(wethRaw, wethDecimals));
  } catch (err) {
    console.error("Failed to fetch balances:", err);
    setError("⚠️ Unable to fetch balance. Check token address or network.");
  }
};
//ADDED To fetchbalances if theres a new mistake END


  const handleSwap = async () => {
    if (!isConnected || !walletClient) return setSwapResult('Please connect wallet');
    if (!amountIn || isNaN(amountIn) || parseFloat(amountIn) <= 0) return setSwapResult('❌ Enter a valid amount');

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      let decimals = 18;
      try {
        if (ethers.isAddress(tokenIn)) {
          const token = new ethers.Contract(tokenIn, ['function decimals() view returns (uint8)'], signer);
          decimals = await token.decimals();
        }
      } catch (err) {
        console.warn('Could not fetch decimals for tokenIn:', tokenIn, err);
      }

      const amountParsed = ethers.parseUnits(amountIn, decimals);
      const swapRouterAddress = await getRouterAddress();

      const router = new ethers.Contract(swapRouterAddress, SwapRouterABI, signer);
      const quote = await router.quoteExactInputSingle(tokenIn, tokenOut, 3000, amountParsed, 0);
      const amountOutMinimum = quote.mul(10000 - slippageToleranceBps).div(10000);

      const tokenContract = new ethers.Contract(tokenIn, ['function approve(address spender, uint256 amount) external returns (bool)'], signer);
      

      const params = {
        tokenIn,
        tokenOut,
        fee: 3000,
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 5,
        amountIn: amountParsed,
        amountOutMinimum,
        sqrtPriceLimitX96: 0,
      };

      const gasEstimate = await router.estimateGas.exactInputSingle(params);
      const tx = await router.exactInputSingle(params, {
        gasLimit: gasEstimate.add(100000),
      });

      const receipt = await tx.wait();
      setSwapResult(`✅ Swap successful! Tx hash: ${receipt.hash}`);
      fetchBalances();
    } catch (err) {
      console.error('Swap failed:', err);
      setSwapResult(`❌ Swap failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!walletClient || !tokenIn || !amountIn) return;

    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const decimals = await new ethers.Contract(tokenIn, ['function decimals() view returns (uint8)'], signer).decimals();
      const amountParsed = ethers.parseUnits(amountIn, decimals);
      const routerAddress = await getRouterAddress();

      const tokenContract = new ethers.Contract(tokenIn, ['function approve(address spender, uint256 amount) external returns (bool)'], signer);
      const tx = await tokenContract.approve(routerAddress, amountParsed);
      await tx.wait();

      setIsApproved(true);
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const handleReverse = () => {
    const tempSymbol = tokenInSymbol;
    setTokenInSymbol(tokenOutSymbol);
    setTokenOutSymbol(tempSymbol);
    setAmountIn('');
    setAmountOutPreview('');
  };


///////RETURN STATEMENT STARTS////////
  return (
    <div className="swap-container">
      <h2>Token Swap</h2>
      {isConnected ? (
        <>
          <div className="token-section">
            <label>From ({tokenInSymbol})</label>
            <div className="input-group">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
              />
              <div className="token-meta">
                <span className="token-symbol">{tokenInSymbol}</span>
                <select
                  value={tokenInSymbol}
                  onChange={(e) => setTokenInSymbol(e.target.value)}
                  className="token-select"
                >
                  {uniqueTokenList.map((token) => (
                    <option key={token.address} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <small>
              Balance: {moopBalance || '0.0'} {tokenInSymbol}
            </small>

            {error && <small style={{ color: "red" }}>{error}</small>}
          </div>

          <div className="reverse-btn-wrapper">
            <button className="reverse-button" onClick={handleReverse}>
              🔄
            </button>
          </div>

          <div className="token-section">
            <label>To ({tokenOutSymbol})</label>
            <div className="input-group">
              <input type="text" value={amountOutPreview} disabled placeholder="0.0" />
              <div className="token-meta">
                <span className="token-symbol">{tokenOutSymbol}</span>
                <select
                  value={tokenOutSymbol}
                  onChange={(e) => setTokenOutSymbol(e.target.value)}
                  className="token-select"
                >
                  {uniqueTokenList.map((token) => (
                    <option key={token.address} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <small>Balance: {wethBalance || '0.0'} {tokenOutSymbol}</small>
            {error && <small style={{ color: "red" }}>{error}</small>}
          </div>

          <div className="extra_info_and_swap_btn_grid">
            <div className="extra-info network">
              <p>🌐 <strong>Network:</strong> {networkLabel}</p>
            </div>
            <div className="extra-info slippage">
              <label>
                ⚙️ <strong>Slippage:</strong>
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  step="0.1"
                  min="0.1"
                  max="5"
                  style={{ width: '60px', marginLeft: '6px' }}
                />%
              </label>
            </div>



          <div className="swap-button-wrapper">
            <button onClick={handleApprove} disabled={isApproved}>
              {isApproved ? '✅ Approved' : 'Approve'}
            </button>
            <button onClick={handleSwap} disabled={!isApproved || isLoading}>
              {isLoading ? 'Swapping...' : 'Swap'}
            </button>
</div>

          </div>
          



          {swapResult && <div className="swap-result">{swapResult}</div>}
        </>
      ) : (
        <p className="connect-warning">🔌 Connect your wallet to begin swapping</p>
      )}
    </div>
  );
};

export default Swap;
