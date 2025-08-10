// utils/linkLibraries.js
const { ethers } = require("hardhat");
const hre = require("hardhat");

const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  console.log("🔗 Attempting to link libraries...");
  if (!linkReferences || Object.keys(linkReferences).length === 0) {
    throw new Error("🚨 No linkReferences found in artifact");
  }

  for (const fileName of Object.keys(linkReferences)) {
    for (const libName of Object.keys(linkReferences[fileName])) {
      const libAddress = libraries[libName];
      if (!libAddress) {
        throw new Error(`🚨 Missing address for library: ${libName}`);
      }

      for (const { length, start } of linkReferences[fileName][libName]) {
        const address = libAddress.replace("0x", "");
        if (address.length !== 40) {
          throw new Error(`🚨 Invalid address for library ${libName}: ${libAddress}`);
        }
        bytecode =
          bytecode.substring(0, 2 + start * 2) +
          address +
          bytecode.substring(2 + (start + length) * 2);
      }
    }
  }

  console.log("✅ Libraries linked successfully");
  return bytecode;
};

const getLinkedFactory = async (contractPath, libraries = {}) => {
  console.log("📚 Linking libraries for contract:", contractPath);
  try {
    const contractFactory = await ethers.getContractFactory(contractPath);
    const artifactName = contractPath.split(":")[1] || contractPath.split("/").pop().replace(".sol", "");
    const artifact = await hre.artifacts.readArtifact(artifactName);

    if (Object.keys(libraries).length > 0) {
      console.log("🔗 Libraries provided:", Object.keys(libraries));
      const linkedBytecode = linkLibraries(
        {
          bytecode: artifact.bytecode,
          linkReferences: artifact.linkReferences,
        },
        libraries
      );
      return ethers.getContractFactory(linkedBytecode, contractFactory.signer);
    }

    console.log("ℹ️ No libraries to link, returning standard factory");
    return contractFactory;
  } catch (err) {
    throw new Error(`🚨 Failed to create linked factory for ${contractPath}: ${err.message}`);
  }
};

module.exports = { linkLibraries, getLinkedFactory };