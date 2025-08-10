const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const testToken = await ethers.getContractFactory("TestToken");
  const testTokenInstance = await testToken.deploy();

  await testTokenInstance.waitForDeployment(); // Ensure deployment is complete

  const address = await testTokenInstance.getAddress();
  console.log("TestToken deployed to:", address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
