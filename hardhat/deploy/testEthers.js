// deploy/testEthers.js
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing ethers.utils.formatEther...");
  console.log("📍 Network:", hre.network.name);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
}

main()
  .then(() => {
    console.log("✅ Test completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  });