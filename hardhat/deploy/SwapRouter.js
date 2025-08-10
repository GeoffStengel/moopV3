// deploy/SwapRouter.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting SwapRouter deployment script...");
  console.log("🌐 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient deployer balance (< 0.1 ETH)");
  }

  // Load required artifacts
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const factoryPath = path.join(artifactDir, "factory.json");
  const wethPath = path.join(artifactDir, "weth9.json");
  const librariesPath = path.join(artifactDir, "libraries.json");

  if (!fs.existsSync(factoryPath) || !fs.existsSync(wethPath)) {
    throw new Error("Required artifacts (factory.json or weth9.json) not found");
  }
  if (!fs.existsSync(librariesPath)) {
    throw new Error("libraries.json not found. Deploy libraries first.");
  }

  const { factoryAddress } = JSON.parse(fs.readFileSync(factoryPath));
  const { wethAddress } = JSON.parse(fs.readFileSync(wethPath));
  const libraries = JSON.parse(fs.readFileSync(librariesPath));
  console.log("🏭 Factory address:", factoryAddress);
  console.log("💸 WETH9 address:", wethAddress);
  console.log("📚 Libraries:", Object.keys(libraries));

  if ((await ethers.provider.getCode(factoryAddress)) === "0x") {
    throw new Error("Invalid factory address: no code deployed");
  }
  if ((await ethers.provider.getCode(wethAddress)) === "0x") {
    throw new Error("Invalid WETH9 address: no code deployed");
  }

  // Deploy SwapRouter
  console.log("📚 Loading SwapRouter contract factory...");
  const SwapRouterFactory = await ethers.getContractFactory(
    "contracts/uniswap/SwapRouter.sol:SwapRouter",
    { libraries }
  );
  console.log("🚀 Deploying SwapRouter...");
  const router = await SwapRouterFactory.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("🎉 SwapRouter deployed to:", routerAddress);

  // Save address to artifacts
  const artifactPath = path.join(artifactDir, "swapRouter.json");
  console.log("💾 Saving SwapRouter address to:", artifactPath);
  console.log("📋 Directory contents before writing:", fs.readdirSync(artifactDir));
  fs.writeFileSync(artifactPath, JSON.stringify({ routerAddress, factoryAddress, wethAddress }, null, 2));
  console.log("✅ SwapRouter address saved");
  console.log("📋 Directory contents after writing:", fs.readdirSync(artifactDir));

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying SwapRouter on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: routerAddress,
        constructorArguments: [factoryAddress, wethAddress],
      });
      console.log("✅ SwapRouter verified");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return routerAddress;
}

main()
  .then(() => {
    console.log("🎉 SwapRouter deployment completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });