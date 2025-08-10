import React, { useEffect, useState } from 'react';
import './TokenList.css';

function TokenList() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      const fetchedTokens = [
        { name: 'Ethereum', symbol: 'ETH' },
        { name: 'Tether', symbol: 'USDT' },
        { name: 'USD Coin', symbol: 'USDC' },
        { name: 'MOOP', symbol: 'MOOP' },
        { name: 'Wrapped Bitcoin', symbol: 'WBTC' },
      ];
      setTokens(fetchedTokens);
      setLoading(false);
    }, 1500); // 1.5 second delay
  }, []);

  if (loading) return <p className="loading">Loading tokens...</p>;

  return (
    <div className="token-list">
      <h2>Token List</h2>
      <ul>
        {tokens.map((token, index) => (
          <li key={index}>
            <span className="token-name">{token.name}</span>
            <span className="token-symbol">({token.symbol})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TokenList;
