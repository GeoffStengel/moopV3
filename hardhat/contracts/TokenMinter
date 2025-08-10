// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenMinter is Ownable {
    address public immutable moopToken = 0x75965be2a4c8ba0e9003a512c1914b71e4101ef0; // Mainnet
    address public immutable feeRecipient = 0xc4042DfAbF63F9d32849ca257b1EE1699a21a134;
    uint256 public constant mintFee = 0.001 ether;

    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol);

    function createERC20(string memory name, string memory symbol, uint256 initialSupply) external payable {
        // Check MOOP balance
        bool isMoopHolder = IERC20(moopToken).balanceOf(msg.sender) >= 1e18; // 1 MOOP
        if (!isMoopHolder) {
            require(msg.value >= mintFee, "Must pay 0.001 ETH if not holding MOOP");
            payable(feeRecipient).transfer(msg.value);
        }

        // Deploy new ERC20 token
        ERC20 newToken = new ERC20(name, symbol);
        newToken.mint(msg.sender, initialSupply);
        emit TokenCreated(msg.sender, address(newToken), name, symbol);
    }

    // Extend for other token types (e.g., Mintable, Burnable)
    function createMintableBurnableERC20(string memory name, string memory symbol, uint256 initialSupply) external payable {
        // Similar logic with appropriate contract deployment
    }
}