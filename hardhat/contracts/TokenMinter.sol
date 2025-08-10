// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TokenMinter is Ownable, ReentrancyGuard, Pausable {
    address public constant moopToken = 0x75965BE2a4C8bA0E9003A512c1914B71e4101EF0; // Mainnet
    address public feeRecipient = 0xc4042DfAbF63F9d32849ca257b1EE1699a21a134;
    uint256 public mintFee = 0.001 ether;
    uint256 public constant MIN_MOOP_BALANCE = 1e18; // 1 MOOP
    mapping(string => address) public tokenFactories; // Token type to factory address
    mapping(address => bool) public supportedTokens;

    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol, string tokenType);
    event TokenMinted(address indexed user, address tokenAddress, uint256 amount);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);
    event TokenTypeAdded(string tokenType, address factory);
    event TokenTypeRemoved(string tokenType);

    constructor() {
        supportedTokens[moopToken] = true;
    }

    function addTokenType(string memory tokenType, address factory) external onlyOwner {
        require(factory != address(0), "Invalid factory address");
        tokenFactories[tokenType] = factory;
        emit TokenTypeAdded(tokenType, factory);
    }

    function removeTokenType(string memory tokenType) external onlyOwner {
        delete tokenFactories[tokenType];
        emit TokenTypeRemoved(tokenType);
    }

    function createToken(string memory tokenType, string memory name, string memory symbol, uint256 initialSupply) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (address) 
    {
        bool isMoopHolder = IERC20(moopToken).balanceOf(msg.sender) >= MIN_MOOP_BALANCE;
        if (!isMoopHolder) {
            require(msg.value >= mintFee, "Insufficient fee: 0.001 ETH required");
            if (msg.value > mintFee) {
                payable(msg.sender).transfer(msg.value - mintFee);
            }
            payable(feeRecipient).transfer(mintFee);
        }

        address factory = tokenFactories[tokenType];
        require(factory != address(0), "Invalid token type");
        (bool success, bytes memory result) = factory.call(
            abi.encodeWithSignature("deploy(string,string,uint256)", name, symbol, initialSupply)
        );
        require(success, "Token creation failed");
        address newToken = abi.decode(result, (address));
        supportedTokens[newToken] = true;
        emit TokenCreated(msg.sender, newToken, name, symbol, tokenType);
        return newToken;
    }

    function mintExistingToken(address token, uint256 amount) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(supportedTokens[token], "Token not supported");
        bool isMoopHolder = IERC20(moopToken).balanceOf(msg.sender) >= MIN_MOOP_BALANCE;
        if (!isMoopHolder) {
            require(msg.value >= mintFee, "Insufficient fee: 0.001 ETH required");
            if (msg.value > mintFee) {
                payable(msg.sender).transfer(msg.value - mintFee);
            }
            payable(feeRecipient).transfer(mintFee);
        }

        uint256 codeSize;
        assembly {
            codeSize := extcodesize(token)
        }
        require(codeSize > 0, "Token not a contract");
        (bool success, ) = token.call(abi.encodeWithSignature("mint(address,uint256)", msg.sender, amount));
        require(success, "Minting failed");
        emit TokenMinted(msg.sender, token, amount);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    function setMintFee(uint256 _mintFee) external onlyOwner {
        emit MintFeeUpdated(mintFee, _mintFee);
        mintFee = _mintFee;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(token != moopToken, "Cannot remove MOOP token");
        supportedTokens[token] = false;
    }

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}