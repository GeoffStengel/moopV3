// deploy/UniswapV3PoolDeployer.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting UniswapV3PoolDeployer deployment script...");
  console.log("🌐 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient deployer balance (< 0.1 ETH)");
  }

  // Load factory address
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const factoryPath = path.join(artifactDir, "factory.json");
  console.log("🔍 Looking for factory.json at:", factoryPath);
  if (!fs.existsSync(factoryPath)) {
    throw new Error("factory.json not found. Deploy UniswapV3Factory first.");
  }
  const { factoryAddress } = JSON.parse(fs.readFileSync(factoryPath));
  console.log("🏭 Using factory address:", factoryAddress);
  if ((await ethers.provider.getCode(factoryAddress)) === "0x") {
    throw new Error("Invalid factory address: no code deployed");
  }

  // Deploy UniswapV3PoolDeployer
  console.log("📚 Loading UniswapV3PoolDeployer contract factory...");
  const PoolDeployerFactory = await ethers.getContractFactory("UniswapV3PoolDeployer");
  console.log("🚀 Deploying UniswapV3PoolDeployer...");
  const poolDeployer = await PoolDeployerFactory.deploy();
  await poolDeployer.waitForDeployment();
  const poolDeployerAddress = await poolDeployer.getAddress();
  console.log("🎉 UniswapV3PoolDeployer deployed to:", poolDeployerAddress);

  // Save address to artifacts
  console.log("💾 Saving poolDeployer address to:", path.join(artifactDir, "poolDeployer.json"));
  console.log("📋 Directory contents before writing:", fs.readdirSync(artifactDir));
  fs.writeFileSync(
    path.join(artifactDir, "poolDeployer.json"),
    JSON.stringify({ poolDeployerAddress, factoryAddress }, null, 2)
  );
  console.log("✅ PoolDeployer address saved");
  console.log("📋 Directory contents after writing:", fs.readdirSync(artifactDir));

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying UniswapV3PoolDeployer on Etherscan...");
    try {
      await hre.run("verify:verify", { address: poolDeployerAddress, constructorArguments: [] });
      console.log("✅ UniswapV3PoolDeployer verified");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return poolDeployerAddress;
}

main()
  .then(() => {
    console.log("🎉 UniswapV3PoolDeployer deployment completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });