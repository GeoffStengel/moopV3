// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        uint256 i = 0;
        uint256 j = 0;
        while (i < len) {
            uint256 triplet = uint8(data[i]);
            i++;
            if (i < len) triplet = triplet | (uint8(data[i]) << 8);
            i++;
            if (i < len) triplet = triplet | (uint8(data[i]) << 16);
            i++;
            result[j] = TABLE[(triplet >> 18) & 0x3F];
            result[j + 1] = TABLE[(triplet >> 12) & 0x3F];
            result[j + 2] = TABLE[(triplet >> 6) & 0x3F];
            result[j + 3] = TABLE[triplet & 0x3F];
            j += 4;
        }
        if (len % 3 == 1) {
            result[encodedLen - 2] = "=";
            result[encodedLen - 1] = "=";
        } else if (len % 3 == 2) {
            result[encodedLen - 1] = "=";
        }
        return string(result);
    }
}