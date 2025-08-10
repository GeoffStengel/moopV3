const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

module.exports = async () => {
  const hre = require("hardhat");
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Starting UniswapV3Pool setup (production version)...");
  console.log("🌐 Network:", hre.network.name);
  console.log("👤 Deployer address:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  const formatEther = ethers.utils?.formatEther || ethers.formatEther;
  console.log("💰 Deployer balance:", formatEther(balance), "ETH");

  // Load deployed factory address
  const artifactPath = path.resolve(__dirname, "../saveDeployArtifacts/factory.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("❌ factory.json not found in saveDeployArtifacts");
  }

  const { factoryAddress } = JSON.parse(fs.readFileSync(artifactPath));
  console.log("🏭 Loaded UniswapV3Factory address:", factoryAddress);

  console.log("✅ Setup complete. Pools will be created dynamically by users via frontend.");

  // Optional: Save info for frontend
  const outputPath = path.resolve(__dirname, "../saveDeployArtifacts/productionInfo.json");
  fs.writeFileSync(outputPath, JSON.stringify({ factoryAddress }, null, 2));
  console.log("💾 Saved production info to:", outputPath);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    try {
      console.log("🔍 Verifying factory contract (if needed)...");
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [],
      });
      console.log("✅ Verified on Etherscan");
    } catch (err) {
      console.warn("⚠️ Verification skipped or failed:", err.message);
    }
  }
};

// Support direct execution via CLI
if (require.main === module) {
  module.exports().catch((err) => {
    console.error("❌ Deployment script failed:", err.message);
    process.exit(1);
  });
}
