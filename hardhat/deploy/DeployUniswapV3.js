const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  let provider, deployer;
  try {
    // Use MetaMask's provider (requires browser environment)
    provider = new ethers.BrowserProvider(window.ethereum);
    deployer = await provider.getSigner();
    const address = await deployer.getAddress();
    console.log("Deploying contracts with:", address);
  } catch (error) {
    console.error("Error getting signer: Ensure MetaMask is connected in the browser", error.message);
    process.exit(1);
  }

  // Deploy WETH9
  const WETH9 = await ethers.getContractFactory("WETH9", deployer);
  const weth9 = await WETH9.deploy();
  await weth9.waitForDeployment();
  console.log("WETH9 deployed to:", await weth9.getAddress());

  // Deploy UniswapV3Factory
  const Factory = await ethers.getContractFactory("UniswapV3Factory", deployer);
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  console.log("UniswapV3Factory deployed to:", await factory.getAddress());

  // Deploy SwapRouter
  const SwapRouter = await ethers.getContractFactory("SwapRouter", deployer);
  const swapRouter = await SwapRouter.deploy(await factory.getAddress(), await weth9.getAddress());
  await swapRouter.waitForDeployment();
  console.log("SwapRouter deployed to:", await swapRouter.getAddress());

  // Deploy NFTDescriptor
  const NFTDescriptor = await ethers.getContractFactory("NFTDescriptor", deployer);
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.waitForDeployment();
  console.log("NFTDescriptor deployed to:", await nftDescriptor.getAddress());

  // Deploy NonfungibleTokenPositionDescriptor
  const NonfungibleTokenPositionDescriptor = await ethers.getContractFactory("NonfungibleTokenPositionDescriptor", deployer);
  const positionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
    await weth9.getAddress(),
    ethers.encodeBytes32String("ETH")
  );
  await positionDescriptor.waitForDeployment();
  console.log("NonfungibleTokenPositionDescriptor deployed to:", await positionDescriptor.getAddress());

  // Deploy NonfungiblePositionManager
  const NonfungiblePositionManager = await ethers.getContractFactory("NonfungiblePositionManager", deployer);
  const positionManager = await NonfungiblePositionManager.deploy(
    await factory.getAddress(),
    await weth9.getAddress(),
    await positionDescriptor.getAddress()
  );
  await positionManager.waitForDeployment();
  console.log("NonfungiblePositionManager deployed to:", await positionManager.getAddress());

  // Create MOOP/WETH pool (Sepolia MOOP: 0x3091cd5408F5841681774f7fD6222481ccE7Fe69)
  const MOOP = "0x3091cd5408F5841681774f7fD6222481ccE7Fe69";
  const fee = 3000; // 0.3% fee tier
  const token0 = MOOP < (await weth9.getAddress()) ? MOOP : await weth9.getAddress();
  const token1 = MOOP < (await weth9.getAddress()) ? await weth9.getAddress() : MOOP;
  const tx = await factory.createPool(token0, token1, fee);
  await tx.wait();
  const poolAddress = await factory.getPool(token0, token1, fee);
  console.log("MOOP/WETH pool created at:", poolAddress);

  // Save addresses for frontend
  const addresses = {
    WETH9: await weth9.getAddress(),
    UniswapV3Factory: await factory.getAddress(),
    SwapRouter: await swapRouter.getAddress(),
    NonfungibleTokenPositionDescriptor: await positionDescriptor.getAddress(),
    NonfungiblePositionManager: await positionManager.getAddress(),
    MOOP_WETH_Pool: poolAddress
  };
  fs.writeFileSync(
    path.join(__dirname, "../frontend/src/addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Addresses saved to frontend/src/addresses.json");
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exit(1);
});