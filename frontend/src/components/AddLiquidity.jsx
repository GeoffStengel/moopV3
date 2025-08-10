import React, { useState, useEffect } from 'react';
import './AddLiquidity.css';
import { Link } from 'react-router-dom';

const AddLiquidity = () => {
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    const savedPools = JSON.parse(localStorage.getItem('pools') || '[]');
    setPools(savedPools);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Error handling
    if (!selectedPool) {
      setResultMessage('⚠️ Please select a pool first.');
      return;
    }

    if (Number(amountA) <= 0 || Number(amountB) <= 0) {
      setResultMessage('🚫 Please enter amounts greater than 0.');
      return;
    }

    // Update matched pool
    const updatedPools = pools.map((pool) => {
      const matchKey = `${pool.tokenAAddress}-${pool.tokenBAddress}`;
      if (matchKey === selectedPool) {
        return {
          ...pool,
          tokenAAmount: Number(pool.tokenAAmount) + Number(amountA),
          tokenBAmount: Number(pool.tokenBAmount) + Number(amountB),
          lastUpdated: new Date().toISOString(), // Optional tracking
        };
      }
      return pool;
    });

    // Save to localStorage
    localStorage.setItem('pools', JSON.stringify(updatedPools));
    setPools(updatedPools);

    // Clear form and show success
    setAmountA('');
    setAmountB('');
    setSelectedPool('');
    setResultMessage('✅ Tokens successfully added to the pool!');
  };

  return (
    <div className="add-liquidity">
      <h2>Add Liquidity</h2>
      <p>Select a pool to add liquidity to:</p>
      {pools.length === 0 ? (
        <div className="no-pools">
        <p>No pools found.</p>
    <Link to="/create-pool" className="create-pool-link">
      ➕ Create a Pool
    </Link>
  </div>
) : (
        <form onSubmit={handleSubmit}>
          <label>
            Pool:
            <select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              required
            >
              <option value="">-- Select a Pool --</option>
              {pools.map((pool, i) => (
                <option key={i} value={`${pool.tokenAAddress}-${pool.tokenBAddress}`}>
                  {pool.tokenAAddress.slice(0, 6)}... / {pool.tokenBAddress.slice(0, 6)}...
                </option>
              ))}
            </select>
          </label>

          <label>
            Token A Amount:
            <input
              type="number"
              min="0"
              step="any"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              required
            />
          </label>

          <label>
            Token B Amount:
            <input
              type="number"
              min="0"
              step="any"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              required
            />
          </label>

          <button type="submit">Add Liquidity</button>
        </form>
      )}

      {resultMessage && <p className="result-message">{resultMessage}</p>}
    </div>
  );
};

export default AddLiquidity;
