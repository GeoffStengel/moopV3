// contracts/uniswap/libraries/ChainId.sol
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;

library ChainId {
    function get() internal pure returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
    }
}