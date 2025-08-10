import React, { useState } from 'react';
import './Liquidity.css';

const Liquidity = () => {
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [result, setResult] = useState('');

  const handleAddLiquidity = () => {
    if (!amountA || !amountB) {
      setResult('❌ Please enter valid amounts for both tokens.');
      return;
    }

    // Example logic to interact with your smart contract or API
    setResult('✅ Liquidity successfully added!');
  };

  return (
    <div className="liquidity-container">
      <h2>Add Liquidity</h2>
      <div className="input-group">
        <label htmlFor="tokenA">Token A Amount</label>
        <input
          id="tokenA"
          type="number"
          value={amountA}
          onChange={(e) => setAmountA(e.target.value)}
          placeholder="Enter Token A amount"
        />
      </div>
      <div className="input-group">
        <label htmlFor="tokenB">Token B Amount</label>
        <input
          id="tokenB"
          type="number"
          value={amountB}
          onChange={(e) => setAmountB(e.target.value)}
          placeholder="Enter Token B amount"
        />
      </div>
      <button className="add-button" onClick={handleAddLiquidity}>
        Add Liquidity
      </button>
      {result && <div className="result">{result}</div>}
    </div>
  );
};

export default Liquidity;
