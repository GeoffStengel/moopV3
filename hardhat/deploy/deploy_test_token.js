const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const token = await TestToken.deploy();
  await token.waitForDeployment();
  console.log("TestToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});