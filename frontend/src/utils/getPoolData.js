// src/utils/getPoolData.js
import { ethers } from 'ethers';
import IUniswapV3PoolABI from './abis/IUniswapV3Pool.json'; // Keep it small

export async function getPoolData(poolAddress, provider) {
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);

  const [token0, token1, fee, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0()
  ]);

  return {
    token0,
    token1,
    fee,
    liquidity: ethers.formatUnits(liquidity, 18),
    sqrtPriceX96: slot0[0].toString(),
    tick: slot0[1]
  };
}
