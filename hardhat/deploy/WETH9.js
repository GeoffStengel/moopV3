// deploy/deployWETH9.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting WETH9 deployment script...");
  console.log("🌐 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient deployer balance (< 0.1 ETH)");
  }

  let wethAddress;
  if (hre.network.name === "mainnet") {
    // Use official mainnet WETH address
    wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    console.log("🌐 Using mainnet WETH9 address:", wethAddress);
    if ((await ethers.provider.getCode(wethAddress)) === "0x") {
      throw new Error("Invalid mainnet WETH9 address: no code deployed");
    }
  } else {
    // Deploy WETH9 for testnets or local networks
    console.log("📚 Loading WETH9 contract factory...");
    const WETH9Factory = await ethers.getContractFactory("WETH9");
    console.log("🚀 Deploying WETH9...");
    const weth = await WETH9Factory.deploy();
    await weth.waitForDeployment();
    wethAddress = await weth.getAddress();
    console.log("🎉 WETH9 deployed to:", wethAddress);
  }

  // Save address to artifacts
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const artifactPath = path.join(artifactDir, "weth9.json");
  console.log("💾 Saving WETH9 address to:", artifactPath);

  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
    console.log("📂 Created directory:", artifactDir);
  }

  console.log("📋 Directory contents before writing:", fs.readdirSync(artifactDir));
  fs.writeFileSync(artifactPath, JSON.stringify({ wethAddress }, null, 2));
  console.log("✅ WETH9 address saved");
  console.log("📋 Directory contents after writing:", fs.readdirSync(artifactDir));

  // Etherscan verification (skip for mainnet or local networks)
  if (hre.network.name !== "mainnet" && hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying WETH9 on Etherscan...");
    try {
      await hre.run("verify:verify", { address: wethAddress, constructorArguments: [] });
      console.log("✅ WETH9 verified");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return wethAddress;
}

main()
  .then(() => {
    console.log("🎉 WETH9 deployment completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });