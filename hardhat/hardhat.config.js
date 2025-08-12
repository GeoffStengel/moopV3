require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

task("compile", "Compiles the project and copies ABIs and artifacts")
  .setAction(async (taskArgs, hre, runSuper) => {
    // run the built-in compile task
    await runSuper();

    console.log("📝 Copying ABIs to frontend/src/abis...");
    const contracts = [
      { name: "UniswapV3Factory", path: "uniswap/UniswapV3Factory.sol" },
      { name: "NonfungibleTokenPositionDescriptor", path: "uniswap/NonfungibleTokenPositionDescriptor.sol" },
      { name: "NFTDescriptor", path: "uniswap/libraries/NFTDescriptor.sol" },
      { name: "WETH9", path: "WETH9.sol" },
      { name: "SwapRouter", path: "uniswap/SwapRouter.sol" },
      { name: "UniswapV3Pool", path: "uniswap/UniswapV3Pool.sol" },
      { name: "UniswapV3PoolDeployer", path: "uniswap/UniswapV3PoolDeployer.sol" },
      { name: "IERC20", path: "uniswap/interfaces/IERC20.sol" },
      { name: "NonfungiblePositionManager", path: "uniswap/NonfungiblePositionManager.sol" },
      { name: "TokenMinter", path: "minter_contracts/TokenMinter.sol" },
      { name: "BasicToken", path: "minter_contracts/BasicToken.sol" },
      { name: "MintableToken", path: "minter_contracts/ERC20TokenMintable.sol" },
      { name: "MintableBurnableToken", path: "minter_contracts/ERC20TokenMintableBurnable.sol" },
      { name: "PausableToken", path: "minter_contracts/ERC20Pausable.sol" },
      { name: "AllFeaturesToken", path: "minter_contracts/ERC20TokenAllFeaturesToken.sol" },
      { name: "ChainId", path: "uniswap/libraries/ChainId.sol" },
      { name: "TickMath", path: "uniswap/libraries/TickMath.sol" },
      { name: "SqrtPriceMath", path: "uniswap/libraries/SqrtPriceMath.sol" },
      { name: "FullMath", path: "uniswap/libraries/FullMath.sol" },
      { name: "SwapMath", path: "uniswap/libraries/SwapMath.sol" },
      { name: "Tick", path: "uniswap/libraries/Tick.sol" },
      { name: "Position", path: "uniswap/libraries/Position.sol" },
      { name: "Oracle", path: "uniswap/libraries/Oracle.sol" },
      { name: "SVGUtils", path: "uniswap/libraries/SVGUtils.sol" },
    ];

    const srcDir = path.join(__dirname, "../frontend/src/abis");
    const artifactsDir = path.join(__dirname, "artifacts/contracts");
    const publicDir = path.join(__dirname, "../frontend/public/artifacts");

    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    for (const contract of contracts) {
      const artifactPath = path.join(artifactsDir, contract.path, `${contract.name}.json`);
      const abiPath = path.join(srcDir, `${contract.name}.json`);
      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath));
        fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
        console.log(`📝 Copied ABI for ${contract.name}`);
      } else {
        console.error(`❌ Artifact for ${contract.name} not found at ${artifactPath}`);
      }
    }

    // Copy the entire artifacts folder into frontend/public/artifacts for easier debug & frontend access.
    console.log("📝 Copying artifacts to frontend/public/artifacts...");
    if (fs.existsSync(path.join(__dirname, "artifacts"))) {
      fs.cpSync(path.join(__dirname, "artifacts"), publicDir, { recursive: true });
      console.log("✅ Artifacts copied successfully");
    } else {
      console.error("❌ Artifacts directory not found");
    }
  });

module.exports = {
  solidity: {
    version: "0.7.6",
    settings: {
      evmVersion: "istanbul",
      optimizer: { enabled: true, runs: 1000 },
      metadata: { bytecodeHash: "none" },
      outputSelection: {
        "*": {
          "*": ["*"],
          "": ["ast"],
        },
      },
      debug: {
        revertStrings: "strip",
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    sepolia: {
      // prefer VITE_INFURA_API_KEY in env; fallback string left empty if not set
      url: process.env.SEPOLIA_URL || `https://sepolia.infura.io/v3/${process.env.VITE_INFURA_API_KEY || ""}`,
      // No private key supplied here (MetaMask/browser signing assumed).
      // If you want to deploy from the CLI, set DEPLOYER_KEY in .env and uncomment:
      // accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      accounts: [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_URL || `https://mainnet.infura.io/v3/${process.env.VITE_INFURA_API_KEY || ""}`,
      accounts: [],
      chainId: 1,
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    deployments: "./deploy",
    exclude: ["node_modules/base64-sol/**"],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  // Optional helper: gas reporter (enable via env)
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true" || false,
    currency: "USD",
    coinmarketcap: process.env.CMC_API_KEY || "",
  },
};
