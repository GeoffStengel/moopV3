// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "./BasicToken.sol";

contract BasicTokenFactory {
    function deploy(string memory name, string memory symbol, uint256 initialSupply) public returns (address) {
        return address(new BasicToken(name, symbol, initialSupply));
    }
}