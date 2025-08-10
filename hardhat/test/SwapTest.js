const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniswapV3 Swap Test", function () {
  let factory, deployer;

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    try {
      const Factory = await ethers.getContractFactory("UniswapV3Factory");
      const tx = await Factory.deploy();
      factory = await tx.waitForDeployment();
      console.log("Factory deployed at:", factory.address);
    } catch (error) {
      console.error("Factory deployment failed:", error);
      throw error;
    }
  });

  it("should deploy factory", async function () {
    expect(factory.address).to.properAddress;
  });
});