// deploy/TestTokens.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("contracts/TestToken.sol:TestToken");

  const tokenA = await Token.deploy();
  await tokenA.waitForDeployment();

  const tokenB = await Token.deploy();
  await tokenB.waitForDeployment();

  console.log("🧪 Test Token A:", tokenAAddress);
  console.log("🧪 Test Token B:", tokenBAddress);

  const outputPath = path.resolve(__dirname, "../saveDeployArtifacts/testTokens.json");
  fs.writeFileSync(outputPath, JSON.stringify({ tokenAAddress, tokenBAddress }, null, 2));
  console.log("✅ Test token addresses saved.");
}

main().catch((err) => {
  console.error("❌ Token deploy failed:", err.message);
  process.exit(1);
});
