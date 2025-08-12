// deploy/NonfungibleTokenPositionDescriptor.js
async function deployNonfungibleTokenPositionDescriptor(ethers, deployedAddresses, SEPOLIA_WETH9, MAINNET_WETH9, fetchArtifact, saveArtifacts, checkWallet) {
  const output = document.getElementById('output');
  try {
    if (deployedAddresses.NonfungibleTokenPositionDescriptor) {
      output.innerText += `📚 NonfungibleTokenPositionDescriptor already deployed at: ${deployedAddresses.NonfungibleTokenPositionDescriptor} ✅\n`;
      return;
    }
    const weth9Input = document.getElementById('weth9Address').value || (document.getElementById('networkSelect').value === '11155111' ? SEPOLIA_WETH9 : MAINNET_WETH9);
    if (!ethers.isAddress(weth9Input)) {
      output.innerText += `❌ Error: Invalid WETH9 address provided.\n`;
      return;
    }
    deployedAddresses.WETH9 = weth9Input;
    if (!deployedAddresses.NFTDescriptor) {
      output.innerText += `❌ Error: NFTDescriptor must be deployed first.\n`;
      return;
    }
    if (!deployedAddresses.ChainId) {
      output.innerText += `❌ Error: ChainId library must be deployed first.\n`;
      return;
    }
    const { provider, signer } = await checkWallet();
    output.innerText += `📚 Fetching artifact for NonfungibleTokenPositionDescriptor... 🔎\n`;
    const { abi, bytecode } = await fetchArtifact('NonfungibleTokenPositionDescriptor', 'uniswap');
    output.innerText += `📜 Artifact fetched: ABI length=${abi.length}, Bytecode length=${bytecode.length}\n`;

    // Check for library placeholders
    let linkedBytecode = bytecode;
    const libraries = [
      { name: 'NFTDescriptor', address: deployedAddresses.NFTDescriptor, placeholder: '__$2a3b8736d1a1c8bb027729408c45042c82$__' },
      { name: 'ChainId', address: deployedAddresses.ChainId },
    ];

    for (const lib of libraries) {
      if (lib.address) {
        const placeholder = lib.placeholder || `__$${ethers.utils.keccak256(ethers.utils.toUtf8Bytes(lib.name)).slice(2, 36)}$__`;
        linkedBytecode = linkedBytecode.replace(placeholder, lib.address.slice(2).toLowerCase());
        output.innerText += `🔗 Linked ${lib.name} at ${lib.address}\n`;
      } else {
        output.innerText += `⚠️ Warning: ${lib.name} address not found in deployedAddresses\n`;
      }
    }

    // Check for remaining placeholders
    if (linkedBytecode.includes('__$')) {
      throw new Error(`Bytecode contains unresolved library placeholders: ${linkedBytecode.match(/__\$[a-f0-9]{34}\$__/g)}`);
    }

    const factory = new ethers.ContractFactory(abi, linkedBytecode, signer);
    output.innerText += `🚀 Deploying NonfungibleTokenPositionDescriptor with libraries linked...\n`;
    const network = await provider.getNetwork();
    output.innerText += `🌐 Current network chainId: ${network.chainId}\n`;
    const deployTx = await factory.getDeployTransaction(
      deployedAddresses.WETH9,
      ethers.utils.formatBytes32String("ETH"),
      { gasLimit: 7000000 }
    );
    output.innerText += `📜 Deployment transaction data: ${deployTx.data.slice(0, 50)}...\n`;
    const contract = await factory.deploy(
      deployedAddresses.WETH9,
      ethers.utils.formatBytes32String("ETH"),
      { gasLimit: 7000000 }
    );
    const txResponse = await contract.deploymentTransaction();
    if (!txResponse) {
      throw new Error('Failed to retrieve transaction response');
    }
    output.innerText += `📦 Transaction sent: ${txResponse.hash}\n`;
    const txReceipt = await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    output.innerText += `🎉 NonfungibleTokenPositionDescriptor deployed to: ${contractAddress}\n`;
    output.innerText += `📦 Transaction hash: ${txReceipt.transactionHash}\n`;
    deployedAddresses.NonfungibleTokenPositionDescriptor = contractAddress;
    deployedAddresses.NonfungibleTokenPositionDescriptor_abi = abi;
    await saveArtifacts();
  } catch (error) {
    console.error(error);
    output.innerText += `\n❌ Error: ${error.message}\n`;
    if (error.transaction) {
      output.innerText += `📜 Transaction details: ${JSON.stringify(error.transaction, null, 2)}\n`;
    }
    if (error.receipt) {
      output.innerText += `📦 Receipt details: ${JSON.stringify(error.receipt, null, 2)}\n`;
      if (error.code === 'CALL_EXCEPTION') {
        output.innerText += `❌ Transaction failed on chain. Check Etherscan for details: https://sepolia.etherscan.io/tx/${error.receipt.transactionHash}\n`;
      }
    }
  }
}

window.deployNonfungibleTokenPositionDescriptor = deployNonfungibleTokenPositionDescriptor;