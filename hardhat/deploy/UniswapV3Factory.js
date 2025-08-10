// deploy/UniswapV3Factory.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting UniswapV3Factory deployment script...");
  console.log("🌐 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient deployer balance (< 0.1 ETH)");
  }

  // Load library addresses
  const librariesPath = path.resolve(__dirname, "../saveDeployArtifacts/libraries.json");
  if (!fs.existsSync(librariesPath)) {
    throw new Error("libraries.json not found. Deploy libraries first.");
  }
  const libraries = JSON.parse(fs.readFileSync(librariesPath));
  console.log("📚 Libraries:", Object.keys(libraries));

  // Deploy UniswapV3Factory
  console.log("📚 Loading UniswapV3Factory contract factory...");
  const FactoryFactory = await ethers.getContractFactory("UniswapV3Factory", {
    libraries: {
      ChainId: libraries.ChainId, // Add other libraries if required
    },
  });
  console.log("🚀 Deploying UniswapV3Factory...");
  const factory = await FactoryFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("🎉 UniswapV3Factory deployed to:", factoryAddress);

  // Enable fee tiers (e.g., 0.05%, 0.3%, 1%)
  console.log("📚 Enabling fee tiers...");
  await factory.enableFeeAmount(500, 10); // 0.05%
  await factory.enableFeeAmount(3000, 60); // 0.3%
  await factory.enableFeeAmount(10000, 200); // 1%
  console.log("✅ Fee tiers enabled");

  // Save address to artifacts
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const artifactPath = path.join(artifactDir, "factory.json");
  console.log("💾 Saving factory address to:", artifactPath);

  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
    console.log("📂 Created directory:", artifactDir);
  }

  console.log("📋 Directory contents before writing:", fs.readdirSync(artifactDir));
  fs.writeFileSync(artifactPath, JSON.stringify({ factoryAddress }, null, 2));
  console.log("✅ Factory address saved");
  console.log("📋 Directory contents after writing:", fs.readdirSync(artifactDir));

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying UniswapV3Factory on Etherscan...");
    try {
      await hre.run("verify:verify", { address: factoryAddress, constructorArguments: [] });
      console.log("✅ UniswapV3Factory verified");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return factoryAddress;
}

main()
  .then(() => {
    console.log("🎉 UniswapV3Factory deployment completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });