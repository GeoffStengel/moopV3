// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;

library AddressStringUtil {
    // Converts an address to the uppercase hex string, extracting only `len` bytes (up to 20, must be even)
    function toAsciiString(address addr, uint256 len) internal pure returns (string memory) {
        require(len % 2 == 0 && len > 0 && len <= 40, 'AddressStringUtil: INVALID_LEN');

        bytes memory s = new bytes(len);
        uint256 addrNum = uint256(uint160(addr)); // ✅ Safe and valid conversion

        for (uint256 i = 0; i < len / 2; i++) {
            // Extract the byte at position (19 - i) from the address
            uint8 b = uint8(addrNum >> (8 * (19 - i)));
            uint8 hi = b >> 4;
            uint8 lo = b & 0x0f;
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    // Converts a 4-bit value to its ASCII hex character (uppercase)
    function char(uint8 b) private pure returns (bytes1 c) {
        return b < 10 ? bytes1(b + 0x30) : bytes1(b + 0x37);
    }
}
