const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🌐 Starting library deployment script... 🚀");
  console.log("📍 Network:", hre.network.name);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.utils.formatEther(balance), "ETH");

  const libraries = {};

  // Deploy ChainId
  console.log("📚 Deploying ChainId... 🔧");
  const ChainIdFactory = await ethers.getContractFactory("contracts/uniswap/libraries/ChainId.sol:ChainId");
  const chainId = await ChainIdFactory.deploy({ gasLimit: 5000000 });
  await chainId.waitForDeployment();
  const chainIdAddress = await chainId.getAddress();
  console.log("🎉 ChainId deployed to:", chainIdAddress);
  libraries.ChainId = { address: chainIdAddress, abi: ChainIdFactory.interface.format("json") };

  // Deploy TickMath
  console.log("📚 Deploying TickMath... 🔧");
  const TickMathFactory = await ethers.getContractFactory("TickMath");
  const tickMath = await TickMathFactory.deploy({ gasLimit: 5000000 });
  await tickMath.waitForDeployment();
  const tickMathAddress = await tickMath.getAddress();
  console.log("🎉 TickMath deployed to:", tickMathAddress);
  libraries.TickMath = { address: tickMathAddress, abi: TickMathFactory.interface.format("json") };

  // Deploy SqrtPriceMath
  console.log("📚 Deploying SqrtPriceMath... 🔧");
  const SqrtPriceMathFactory = await ethers.getContractFactory("SqrtPriceMath");
  const sqrtPriceMath = await SqrtPriceMathFactory.deploy({ gasLimit: 5000000 });
  await sqrtPriceMath.waitForDeployment();
  const sqrtPriceMathAddress = await sqrtPriceMath.getAddress();
  console.log("🎉 SqrtPriceMath deployed to:", sqrtPriceMathAddress);
  libraries.SqrtPriceMath = { address: sqrtPriceMathAddress, abi: SqrtPriceMathFactory.interface.format("json") };

  // Deploy FullMath
  console.log("📚 Deploying FullMath... 🔧");
  const FullMathFactory = await ethers.getContractFactory("FullMath");
  const fullMath = await FullMathFactory.deploy({ gasLimit: 5000000 });
  await fullMath.waitForDeployment();
  const fullMathAddress = await fullMath.getAddress();
  console.log("🎉 FullMath deployed to:", fullMathAddress);
  libraries.FullMath = { address: fullMathAddress, abi: FullMathFactory.interface.format("json") };

  // Deploy SwapMath
  console.log("📚 Deploying SwapMath... 🔧");
  const SwapMathFactory = await ethers.getContractFactory("SwapMath");
  const swapMath = await SwapMathFactory.deploy({ gasLimit: 5000000 });
  await swapMath.waitForDeployment();
  const swapMathAddress = await swapMath.getAddress();
  console.log("🎉 SwapMath deployed to:", swapMathAddress);
  libraries.SwapMath = { address: swapMathAddress, abi: SwapMathFactory.interface.format("json") };

  // Deploy Tick
  console.log("📚 Deploying Tick... 🔧");
  const TickFactory = await ethers.getContractFactory("Tick");
  const tick = await TickFactory.deploy({ gasLimit: 5000000 });
  await tick.waitForDeployment();
  const tickAddress = await tick.getAddress();
  console.log("🎉 Tick deployed to:", tickAddress);
  libraries.Tick = { address: tickAddress, abi: TickFactory.interface.format("json") };

  // Deploy Position
  console.log("📚 Deploying Position... 🔧");
  const PositionFactory = await ethers.getContractFactory("Position");
  const position = await PositionFactory.deploy({ gasLimit: 5000000 });
  await position.waitForDeployment();
  const positionAddress = await position.getAddress();
  console.log("🎉 Position deployed to:", positionAddress);
  libraries.Position = { address: positionAddress, abi: PositionFactory.interface.format("json") };

  // Deploy Oracle
  console.log("📚 Deploying Oracle... 🔧");
  const OracleFactory = await ethers.getContractFactory("Oracle");
  const oracle = await OracleFactory.deploy({ gasLimit: 5000000 });
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("🎉 Oracle deployed to:", oracleAddress);
  libraries.Oracle = { address: oracleAddress, abi: OracleFactory.interface.format("json") };

  // Deploy SVGUtils
  console.log("📚 Deploying SVGUtils... 🔧");
  const SVGUtilsFactory = await ethers.getContractFactory("SVGUtils");
  const svgUtils = await SVGUtilsFactory.deploy({ gasLimit: 5000000 });
  await svgUtils.waitForDeployment();
  const svgUtilsAddress = await svgUtils.getAddress();
  console.log("🎉 SVGUtils deployed to:", svgUtilsAddress);
  libraries.SVGUtils = { address: svgUtilsAddress, abi: SVGUtilsFactory.interface.format("json") };

  // Deploy NFTDescriptor
  console.log("📚 Deploying NFTDescriptor... 🔧");
  const NFTDescriptorFactory = await ethers.getContractFactory("NFTDescriptor");
  const nftDescriptor = await NFTDescriptorFactory.deploy({ gasLimit: 5000000 });
  await nftDescriptor.waitForDeployment();
  const nftDescriptorAddress = await nftDescriptor.getAddress();
  console.log("🎉 NFTDescriptor deployed to:", nftDescriptorAddress);
  libraries.NFTDescriptor = { address: nftDescriptorAddress, abi: NFTDescriptorFactory.interface.format("json") };

  // Save to JSON in hardhat
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const librariesPath = path.join(artifactDir, "libraries.json");
  console.log("💾 Saving library artifacts to:", librariesPath);
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
    console.log("📂 Created directory:", artifactDir);
  }
  fs.writeFileSync(librariesPath, JSON.stringify(libraries, null, 2));
  console.log("✅ Library artifacts saved to hardhat 🎉");

  // Copy to frontend/public/artifacts
  const frontendArtifactDir = path.resolve(__dirname, "../../frontend/public/artifacts");
  if (!fs.existsSync(frontendArtifactDir)) {
    fs.mkdirSync(frontendArtifactDir, { recursive: true });
    console.log("📂 Created frontend directory:", frontendArtifactDir);
  }
  const frontendLibrariesPath = path.join(frontendArtifactDir, "libraries.json");
  fs.copyFileSync(librariesPath, frontendLibrariesPath);
  console.log("✅ Library artifacts copied to:", frontendLibrariesPath, "🎉");

  // Etherscan verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    for (const [name, { address }] of Object.entries(libraries)) {
      try {
        console.log(`🔍 Verifying ${name} at ${address}...`);
        await hre.run("verify:verify", { address, constructorArguments: [] });
        console.log(`✅ ${name} verified 🎉`);
      } catch (err) {
        console.error(`❌ Verification failed for ${name}:`, err.message);
      }
    }
  }

  return libraries;
}

main()
  .then(() => {
    console.log("🎉 Library deployment completed successfully 🥳");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
  });