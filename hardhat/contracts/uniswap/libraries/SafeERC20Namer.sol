// contracts/uniswap/libraries/SafeERC20Namer.sol
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;

library SafeERC20Namer {
    function tokenSymbol(address token) internal view returns (string memory) {
        (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x95d89b41)); // symbol()
        return success ? returnDataToString(data) : "UNKNOWN";
    }

    function returnDataToString(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        if (data.length >= 64) {
            return abi.decode(data, (string));
        }
        bytes memory decoded = new bytes(32);
        for (uint256 i = 0; i < 32 && i < data.length; i++) {
            decoded[i] = data[i];
        }
        return string(decoded);
    }
}