// deploy/NonfungibleTokenPositionDescriptor.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting NonfungibleTokenPositionDescriptor deployment script...");
  console.log("🌐 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient deployer balance (< 0.1 ETH)");
  }

  // Load WETH9 address
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const wethPath = path.join(artifactDir, "weth9.json");
  if (!fs.existsSync(wethPath)) {
    throw new Error("weth9.json not found. Deploy WETH9 first.");
  }
  const { wethAddress } = JSON.parse(fs.readFileSync(wethPath));
  console.log("💸 WETH9 address:", wethAddress);
  if ((await ethers.provider.getCode(wethAddress)) === "0x") {
    throw new Error("Invalid WETH9 address: no code deployed");
  }

  // Load library addresses
  const librariesPath = path.join(artifactDir, "libraries.json");
  if (!fs.existsSync(librariesPath)) {
    throw new Error("libraries.json not found. Deploy libraries first.");
  }
  const libraries = JSON.parse(fs.readFileSync(librariesPath));
  console.log("📚 Libraries:", Object.keys(libraries));

  // Deploy NonfungibleTokenPositionDescriptor
  console.log("📚 Loading NonfungibleTokenPositionDescriptor contract factory...");
  const DescriptorFactory = await ethers.getContractFactory(
    "contracts/uniswap/NonfungibleTokenPositionDescriptor.sol:NonfungibleTokenPositionDescriptor",
    { libraries }
  );
  console.log("🚀 Deploying NonfungibleTokenPositionDescriptor...");
  const descriptor = await DescriptorFactory.deploy(wethAddress);
  await descriptor.waitForDeployment();
  const descriptorAddress = await descriptor.getAddress();
  console.log("🎉 NonfungibleTokenPositionDescriptor deployed to:", descriptorAddress);

  // Save address to artifacts
  const artifactPath = path.join(artifactDir, "positionDescriptor.json");
  console.log("💾 Saving descriptor address to:", artifactPath);
  console.log("📋 Directory contents before writing:", fs.readdirSync(artifactDir));
  fs.writeFileSync(artifactPath, JSON.stringify({ descriptorAddress }, null, 2));
  console.log("✅ Descriptor address saved");
  console.log("📋 Directory contents after writing:", fs.readdirSync(artifactDir));

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying NonfungibleTokenPositionDescriptor on Etherscan...");
    try {
      await hre.run("verify:verify", { address: descriptorAddress, constructorArguments: [wethAddress] });
      console.log("✅ NonfungibleTokenPositionDescriptor verified");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return descriptorAddress;
}

main()
  .then(() => {
    console.log("🎉 NonfungibleTokenPositionDescriptor deployment completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });