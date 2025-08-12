const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  console.log("🌐 Starting library deployment script... 🚀");
  console.log("📍 Network:", hre.network.name);
  const chainId = await ethers.provider.getNetwork().then(net => net.chainId);
  console.log("📍 Chain ID:", chainId);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.utils.formatEther(balance), "ETH");

  const libraries = {};

  // Deploy ChainId
  console.log("📚 Deploying ChainId... 🔧");
  try {
    const ChainIdFactory = await ethers.getContractFactory("contracts/uniswap/libraries/ChainId.sol:ChainId");
    const chainIdContract = await ChainIdFactory.deploy({ gasLimit: 5000000 });
    await chainIdContract.waitForDeployment();
    const chainIdAddress = await chainIdContract.getAddress();
    console.log("🎉 ChainId deployed to:", chainIdAddress);
    libraries.ChainId = { address: chainIdAddress, abi: ChainIdFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ ChainId deployment failed:", error.message);
    throw error;
  }

  // Deploy TickMath
  console.log("📚 Deploying TickMath... 🔧");
  try {
    const TickMathFactory = await ethers.getContractFactory("TickMath");
    const tickMath = await TickMathFactory.deploy({ gasLimit: 5000000 });
    await tickMath.waitForDeployment();
    const tickMathAddress = await tickMath.getAddress();
    console.log("🎉 TickMath deployed to:", tickMathAddress);
    libraries.TickMath = { address: tickMathAddress, abi: TickMathFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ TickMath deployment failed:", error.message);
    throw error;
  }

  // Deploy SqrtPriceMath
  console.log("📚 Deploying SqrtPriceMath... 🔧");
  try {
    const SqrtPriceMathFactory = await ethers.getContractFactory("SqrtPriceMath");
    const sqrtPriceMath = await SqrtPriceMathFactory.deploy({ gasLimit: 5000000 });
    await sqrtPriceMath.waitForDeployment();
    const sqrtPriceMathAddress = await sqrtPriceMath.getAddress();
    console.log("🎉 SqrtPriceMath deployed to:", sqrtPriceMathAddress);
    libraries.SqrtPriceMath = { address: sqrtPriceMathAddress, abi: SqrtPriceMathFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ SqrtPriceMath deployment failed:", error.message);
    throw error;
  }

  // Deploy FullMath
  console.log("📚 Deploying FullMath... 🔧");
  try {
    const FullMathFactory = await ethers.getContractFactory("FullMath");
    const fullMath = await FullMathFactory.deploy({ gasLimit: 5000000 });
    await fullMath.waitForDeployment();
    const fullMathAddress = await fullMath.getAddress();
    console.log("🎉 FullMath deployed to:", fullMathAddress);
    libraries.FullMath = { address: fullMathAddress, abi: FullMathFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ FullMath deployment failed:", error.message);
    throw error;
  }

  // Deploy SwapMath
  console.log("📚 Deploying SwapMath... 🔧");
  try {
    const SwapMathFactory = await ethers.getContractFactory("SwapMath");
    const swapMath = await SwapMathFactory.deploy({ gasLimit: 5000000 });
    await swapMath.waitForDeployment();
    const swapMathAddress = await swapMath.getAddress();
    console.log("🎉 SwapMath deployed to:", swapMathAddress);
    libraries.SwapMath = { address: swapMathAddress, abi: SwapMathFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ SwapMath deployment failed:", error.message);
    throw error;
  }

  // Deploy Tick
  console.log("📚 Deploying Tick... 🔧");
  try {
    const TickFactory = await ethers.getContractFactory("Tick");
    const tick = await TickFactory.deploy({ gasLimit: 5000000 });
    await tick.waitForDeployment();
    const tickAddress = await tick.getAddress();
    console.log("🎉 Tick deployed to:", tickAddress);
    libraries.Tick = { address: tickAddress, abi: TickFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ Tick deployment failed:", error.message);
    throw error;
  }

  // Deploy Position
  console.log("📚 Deploying Position... 🔧");
  try {
    const PositionFactory = await ethers.getContractFactory("Position");
    const position = await PositionFactory.deploy({ gasLimit: 5000000 });
    await position.waitForDeployment();
    const positionAddress = await position.getAddress();
    console.log("🎉 Position deployed to:", positionAddress);
    libraries.Position = { address: positionAddress, abi: PositionFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ Position deployment failed:", error.message);
    throw error;
  }

  // Deploy Oracle
  console.log("📚 Deploying Oracle... 🔧");
  try {
    const OracleFactory = await ethers.getContractFactory("Oracle");
    const oracle = await OracleFactory.deploy({ gasLimit: 5000000 });
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log("🎉 Oracle deployed to:", oracleAddress);
    libraries.Oracle = { address: oracleAddress, abi: OracleFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ Oracle deployment failed:", error.message);
    throw error;
  }

  // Deploy HexStrings
  console.log("📚 Deploying HexStrings... 🔧");
  try {
    const HexStringsFactory = await ethers.getContractFactory("HexStrings");
    const hexStrings = await HexStringsFactory.deploy({ gasLimit: 5000000 });
    await hexStrings.waitForDeployment();
    const hexStringsAddress = await hexStrings.getAddress();
    console.log("🎉 HexStrings deployed to:", hexStringsAddress);
    libraries.HexStrings = { address: hexStringsAddress, abi: HexStringsFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ HexStrings deployment failed:", error.message);
    throw error;
  }

  // Deploy SVGUtils
  console.log("📚 Deploying SVGUtils... 🔧");
  try {
    const SVGUtilsFactory = await ethers.getContractFactory("SVGUtils", {
      libraries: {
        HexStrings: libraries.HexStrings.address,
      },
    });
    const svgUtils = await SVGUtilsFactory.deploy({ gasLimit: 5000000 });
    await svgUtils.waitForDeployment();
    const svgUtilsAddress = await svgUtils.getAddress();
    console.log("🎉 SVGUtils deployed to:", svgUtilsAddress);
    libraries.SVGUtils = { address: svgUtilsAddress, abi: SVGUtilsFactory.interface.format("json") };
  } catch (error) {
    console.error("❌ SVGUtils deployment failed:", error.message);
    throw error;
  }

  // Save artifacts
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  const librariesPath = path.join(artifactDir, "libraries.json");
  console.log("💾 Saving library artifacts to:", librariesPath);
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
    console.log("📂 Created directory:", artifactDir);
  }
  fs.writeFileSync(librariesPath, JSON.stringify(libraries, null, 2));
  console.log("✅ Library artifacts saved to hardhat 🎉");

  // Copy to frontend
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
        await hre.run("verify:verify", {
          address,
          constructorArguments: [],
        });
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
    console.error("Error details:", err);
    process.exit(1);
  });