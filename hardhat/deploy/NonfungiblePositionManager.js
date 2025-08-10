// deploy/NonfungiblePositionManager.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting NonfungiblePositionManager deployment script...");
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
  const descriptorPath = path.join(artifactDir, "positionDescriptor.json");
  const librariesPath = path.join(artifactDir, "libraries.json");

  if (!fs.existsSync(factoryPath) || !fs.existsSync(wethPath) || !fs.existsSync(descriptorPath)) {
    throw new Error("Required artifacts (factory.json, weth9.json, or positionDescriptor.json) not found");
  }
  if (!fs.existsSync(librariesPath)) {
    throw new Error("libraries.json not found. Deploy libraries first.");
  }

  const { factoryAddress } = JSON.parse(fs.readFileSync(factoryPath));
  const { wethAddress } = JSON.parse(fs.readFileSync(wethPath));
  const { descriptorAddress } = JSON.parse(fs.readFileSync(descriptorPath));
  const libraries = JSON.parse(fs.readFileSync(librariesPath));
  console.log("🏭 Factory address:", factoryAddress);
  console.log("💸 WETH9 address:", wethAddress);
  console.log("📚 Descriptor address:", descriptorAddress);
  console.log("📚 Libraries:", Object.keys(libraries));

  if ((await ethers.provider.getCode(factoryAddress)) === "0x") {
    throw new Error("Invalid factory address: no code deployed");
  }
  if ((await ethers.provider.getCode(wethAddress)) === "0x") {
    throw new Error("Invalid WETH9 address: no code deployed");
  }
  if ((await ethers.provider.getCode(descriptorAddress)) === "0x") {
    throw new Error("Invalid descriptor address: no code deployed");
  }

  // Deploy NonfungiblePositionManager
  console.log("📚 Loading NonfungiblePositionManager contract factory...");
  const PositionManagerFactory = await ethers.getContractFactory(
    "contracts/uniswap/NonfungiblePositionManager.sol:NonfungiblePositionManager",
    { libraries }
  );
  console.log("🚀 Deploying NonfungiblePositionManager...");
  const positionManager = await PositionManagerFactory.deploy(factoryAddress, wethAddress, descriptorAddress);
  await positionManager.waitForDeployment();
  const positionManagerAddress = await positionManager.getAddress();
  console.log("🎉 NonfungiblePositionManager deployed to:", positionManagerAddress);

  // Save address to artifacts
  const artifactPath = path.join(artifactDir, "positionManager.json");
  console.log("💾 Saving positionManager address to:", artifactPath);
  console.log("📋 Directory contents before writing:", fs.readdirSync(artifactDir));
  fs.writeFileSync(
    artifactPath,
    JSON.stringify({ positionManagerAddress, factoryAddress, wethAddress, descriptorAddress }, null, 2)
  );
  console.log("✅ PositionManager address saved");
  console.log("📋 Directory contents after writing:", fs.readdirSync(artifactDir));

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying NonfungiblePositionManager on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: positionManagerAddress,
        constructorArguments: [factoryAddress, wethAddress, descriptorAddress],
      });
      console.log("✅ NonfungiblePositionManager verified");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return positionManagerAddress;
}

main()
  .then(() => {
    console.log("🎉 NonfungiblePositionManager deployment completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });