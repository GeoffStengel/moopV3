import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { JsonRpcProvider } from 'ethers';

import ConnectWalletButton from './components/ConnectWalletButton';
import Swap from './components/Swap';
import Pools from './components/Pools';
import CreatePool from './components/CreatePool';
import AddLiquidity from './components/AddLiquidity';
import Modal from './components/modal';
import { RPC_URL, provider } from './infuraConfig';
import './App.css';

import { ethers } from 'ethers';
import TokenMinter from './components/TokenMinter';



function App() {
  const [blockNumber, setBlockNumber] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle wallet connection globally
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        setIsConnected(true);
      } catch (err) {
        console.error('Wallet connection failed:', err);
      }
    }
  };



  useEffect(() => {
    const provider = new JsonRpcProvider(RPC_URL);

    const fetchBlock = async () => {
      try {
        const latestBlock = await provider.getBlockNumber();
        setBlockNumber(latestBlock);
        console.log('Connected to Infura. Latest block:', latestBlock);
      } catch (err) {
        console.error('Error connecting to Infura:', err);
      }
    };

    fetchBlock();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <Router>
      <div className="app_main_div">
        <a href='/'><h1><span className="emoji">🦉</span> MOOP SWAP</h1></a>
        

        {/* Main Navigation */}
        <nav>
          <Link to="/">Swap</Link>
          <Link to="/pools">Pools</Link>
          <Link to="/add-liquidity">Add Liquidity</Link>
          <Link to="/create-pool">Create Pool</Link>
          <Link to="/TokenMinter">Mint Token</Link>
        </nav>

        <ConnectWalletButton />
        
        {/* Dropdown Quick Actions */} {/*
        <div className="quick_actions" style={{ position: 'relative', marginTop: '1rem', textAlign: 'center' }}>
          <button onClick={toggleDropdown} className="dropdown-toggle">
            ⚙️ Quick Actions ▼
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { setShowCreate(true); setDropdownOpen(false); }}>➕ Create Pool (Modal)</button>
              <button onClick={() => { setShowAdd(true); setDropdownOpen(false); }}>💧 Add Liquidity (Modal)</button>
            </div>
          )}
        </div>  */}

        {/* Infura Status */}
        <div className="infura-status">
          {blockNumber !== null ? (
            <p style={{ color: 'lime' }}>🟢 Connected (Block {blockNumber})</p>
          ) : (
            <p style={{ color: 'red' }}>🔴 Connecting to Infura...</p>
          )}
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Swap />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/create-pool" element={<CreatePool signer={signer} isConnected={isConnected} connectWallet={connectWallet} />} />
          <Route path="/TokenMinter" element={<TokenMinter />} />
          <Route path="/add-liquidity" element={<AddLiquidity />} />
        </Routes>

        
        {/* Modals */}
          <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
          <CreatePool
            signer={signer}
            isConnected={isConnected}
            connectWallet={connectWallet}
          />
          </Modal>
        
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
          <AddLiquidity />
        </Modal>
      </div>
    </Router>
  );
}

export default App;
