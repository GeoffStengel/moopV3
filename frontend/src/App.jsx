// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ethers } from "ethers";

import ConnectWalletButton from "./components/ConnectWalletButton";
import Swap from "./components/Swap";
import Pools from "./components/Pools";
import CreatePool from "./components/CreatePool";
import AddLiquidity from "./components/AddLiquidity";
import Modal from "./components/modal";
import { RPC_URL } from "./infuraConfig";
import "./App.css";
import TokenMinter from "./components/TokenMinter";

function App() {
  const [blockNumber, setBlockNumber] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle wallet connection globally using BrowserProvider (ethers v6)
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const s = await browserProvider.getSigner();
        setSigner(s);
        setIsConnected(true);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      console.warn("No injected wallet detected (window.ethereum)");
    }
  };

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const fetchBlock = async () => {
      try {
        const latestBlock = await provider.getBlockNumber();
        setBlockNumber(latestBlock);
        console.log("Connected to Infura. Latest block:", latestBlock);
      } catch (err) {
        console.error("Error connecting to Infura:", err);
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
        <a href="/">
          <h1>
            <span className="emoji">🦉</span> MOOP SWAP
          </h1>
        </a>

        <nav>
          <Link to="/">Swap</Link>
          <Link to="/pools">Pools</Link>
          <Link to="/add-liquidity">Add Liquidity</Link>
          <Link to="/create-pool">Create Pool</Link>
          <Link to="/TokenMinter">Mint Token</Link>
        </nav>

        <ConnectWalletButton connectWallet={connectWallet} />

        <div className="infura-status">
          {blockNumber !== null ? (
            <p style={{ color: "lime" }}>🟢 Connected to Infura (Block {blockNumber})</p>
          ) : (
            <p style={{ color: "red" }}>🔴 Connecting to Infura...</p>
          )}
        </div>

        <Routes>
          <Route path="/" element={<Swap />} />
          <Route path="/pools" element={<Pools />} />
          <Route
            path="/create-pool"
            element={<CreatePool signer={signer} isConnected={isConnected} connectWallet={connectWallet} />}
          />
          <Route path="/TokenMinter" element={<TokenMinter />} />
          <Route path="/add-liquidity" element={<AddLiquidity />} />
        </Routes>

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
          <CreatePool signer={signer} isConnected={isConnected} connectWallet={connectWallet} />
        </Modal>

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
          <AddLiquidity />
        </Modal>
      </div>
    </Router>
  );
}

export default App;
