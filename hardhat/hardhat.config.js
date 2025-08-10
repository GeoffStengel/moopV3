const fs = require("fs");
const path = require("path");

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

task("compile", "Compiles the project and copies ABIs and artifacts")
  .setAction(async (taskArgs, hre, runSuper) => {
    await runSuper();
    console.log("Copying ABIs to frontend/src/abis...");
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
      { name: "ChainId", path: "uniswap/libraries/ChainId.sol" }, // Updated path
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

    // Copy ABIs to frontend/src/abis
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    for (const contract of contracts) {
      const artifactPath = path.join(artifactsDir, `${contract.path}/${contract.name}.json`);
      const abiPath = path.join(srcDir, `${contract.name}.json`);
      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath));
        fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
        console.log(`Copied ABI for ${contract.name}`);
      } else {
        console.error(`Artifact for ${contract.name} not found at ${artifactPath}`);
      }
    }

    // Copy artifacts to frontend/public/artifacts
    console.log("Copying artifacts to frontend/public/artifacts...");
    if (fs.existsSync(artifactsDir)) {
      fs.cpSync(artifactsDir, publicDir, { recursive: true });
      console.log("Artifacts copied successfully");
    } else {
      console.error("Artifacts directory not found");
    }
  });

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      {
        version: "0.8.0",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
    ],
    overrides: {
      "contracts/uniswap/NonfungibleTokenPositionDescriptor.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/NFTDescriptor.sol": {
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
      "contracts/WETH9.sol": {
        version: "0.8.0",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/UniswapV3Factory.sol": {
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
      "contracts/uniswap/UniswapV3Pool.sol": {
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
      "contracts/uniswap/NonfungiblePositionManager.sol": {
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
      "contracts/uniswap/SwapRouter.sol": {
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
      "contracts/uniswap/libraries/ChainId.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/TickMath.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/SqrtPriceMath.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/FullMath.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/SwapMath.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/Tick.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/Position.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/Oracle.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
      },
      "contracts/uniswap/libraries/SVGUtils.sol": {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: { enabled: true, runs: 1000 },
          metadata: { bytecodeHash: "none" },
        },
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
      url: "https://sepolia.infura.io/v3/ffa5449f44f34b01ab51c931e9687049",
      accounts: [], // MetaMask handles signing
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    deployments: "./deploy",
    exclude: ["node_modules/base64-sol/**"],
  },
  etherscan: {
    apiKey: "",
  },
};