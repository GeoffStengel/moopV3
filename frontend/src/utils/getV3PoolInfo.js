import { ethers } from 'ethers';
import { UNISWAP_V3_POOL_ABI } from '../abis/uniswapV3PoolAbi';
import { RPC_URL } from '../infuraConfig';

const V3_POOL_ADDRESS = '0xYourPoolAddress'; // Replace this

const provider = new ethers.JsonRpcProvider(RPC_URL);

export const getV3PoolInfo = async () => {
  try {
    const poolContract = new ethers.Contract(V3_POOL_ADDRESS, UNISWAP_V3_POOL_ABI, provider);

    const [token0, token1, liquidity, slot0] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.liquidity(),
      poolContract.slot0()
    ]);

    return {
      token0,
      token1,
      liquidity: ethers.formatUnits(liquidity, 18),
      sqrtPriceX96: slot0.sqrtPriceX96.toString(),
      tick: slot0.tick
    };
  } catch (err) {
    console.error("Error fetching V3 pool data:", err);
    return null;
  }
};
