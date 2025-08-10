// SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity ^0.7.0;

contract Multicall2 {
    struct Call {
        address target;
        bytes callData;
    }

    function aggregate(Call[] memory calls) public returns (uint256 blockNumber, bytes[] memory returnData) {
        blockNumber = block.number;
        returnData = new bytes[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            require(success, "Multicall aggregate call failed");
            returnData[i] = ret;
        }
    }

    function getBlockHash(uint256 blockNumber) public view returns (bytes32 blockHash) {
        return blockhash(blockNumber);
    }

    function getCurrentBlockTimestamp() public view returns (uint256 timestamp) {
        return block.timestamp;
    }

    function getEthBalance(address addr) public view returns (uint256 balance) {
        return addr.balance;
    }

    function getCurrentBlockDifficulty() public view returns (uint256 difficulty) {
        return block.difficulty;
    }

    function getCurrentBlockGasLimit() public view returns (uint256 gaslimit) {
        return block.gaslimit;
    }

    function getCurrentBlockCoinbase() public view returns (address coinbase) {
        return block.coinbase;
    }
}
