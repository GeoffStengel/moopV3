const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🛠️ Starting UniswapV3Factory deployment script... 🚀");
  console.log("🌐 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient deployer balance (< 0.1 ETH) 😢");
  }

  // Deploy UniswapV3Factory
  console.log("📚 Loading UniswapV3Factory contract factory... 🔧");
  const FactoryFactory = await ethers.getContractFactory("contracts/uniswap/UniswapV3Factory.sol:UniswapV3Factory");
  console.log("🚀 Deploying UniswapV3Factory...");
  const factory = await FactoryFactory.deploy({ gasLimit: 5000000 });
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("🎉 UniswapV3Factory deployed to:", factoryAddress);

  // Save address and ABI to artifacts
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const artifactPath = path.join(artifactDir, "UniswapV3Factory.json");
  console.log("💾 Saving UniswapV3Factory artifact to:", artifactPath);
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
    console.log("📂 Created directory:", artifactDir);
  }
  const artifact = {
    address: factoryAddress,
    abi: FactoryFactory.interface.format("json"),
  };
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  console.log("✅ UniswapV3Factory artifact saved to hardhat 🎉");

  // Copy to frontend/public/artifacts
  const frontendArtifactDir = path.resolve(__dirname, "../../frontend/public/artifacts");
  if (!fs.existsSync(frontendArtifactDir)) {
    fs.mkdirSync(frontendArtifactDir, { recursive: true });
    console.log("📂 Created frontend directory:", frontendArtifactDir);
  }
  const frontendArtifactPath = path.join(frontendArtifactDir, "UniswapV3Factory.json");
  fs.copyFileSync(artifactPath, frontendArtifactPath);
  console.log("✅ UniswapV3Factory artifact copied to:", frontendArtifactPath, "🎉");

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying UniswapV3Factory on Etherscan...");
    try {
      await hre.run("verify:verify", { address: factoryAddress, constructorArguments: [] });
      console.log("✅ UniswapV3Factory verified 🎉");
    } catch (err) {
      console.error("❌ Etherscan verification failed:", err.message);
    }
  }

  return artifact;
}

main()
  .then(() => {
    console.log("🎉 UniswapV3Factory deployment completed successfully 🥳");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });