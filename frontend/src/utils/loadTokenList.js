export const loadTokenList = async (_chainId) => {
    const chainId = Number(_chainId); // <-- Coerce it to a number
    console.log("Loading token list for chainId:", chainId);
  
    switch (chainId) {
    case 11155111: // Sepolia
      return await import('../tokenlists/tokenlist.sepolia.json');
    case 31337: // Hardhat
    case 1337: // Also Hardhat (MetaMask)
      return await import('../tokenlists/tokenlist.hardhat.json');
    case 1: // Mainnet
      return await import('../tokenlists/tokenlist.mainnet.json');
    default:
      console.warn('Unsupported network', chainId);
      return { tokens: [] };
  }
};
