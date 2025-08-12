// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IMintable {
    function mint(address to, uint256 amount) external;
}

contract TokenMinter is Ownable, ReentrancyGuard, Pausable {
    address public immutable moopToken; // Dynamic, set in constructor
    address public feeRecipient;
    uint256 public mintFee = 0.001 ether;
    uint256 public constant MIN_MOOP_BALANCE = 1e18; // 1 MOOP
    mapping(address => bool) public supportedTokens;

    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol, string tokenType);
    event TokenMinted(address indexed user, address tokenAddress, uint256 amount);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _moopToken, address _feeRecipient) {
        require(_moopToken != address(0), "Invalid MOOP token address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        moopToken = _moopToken;
        feeRecipient = _feeRecipient;
        supportedTokens[_moopToken] = true;
    }

    function createToken(string memory tokenType, string memory name, string memory symbol, uint256 initialSupply, bytes memory bytecode) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (address) 
    {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than zero");
        require(bytecode.length > 0 && bytecode.length <= 24576, "Invalid bytecode size");

        bool isMoopHolder = IERC20(moopToken).balanceOf(msg.sender) >= MIN_MOOP_BALANCE;
        if (!isMoopHolder) {
            require(msg.value >= mintFee, "Insufficient fee: 0.001 ETH required");
            uint256 excess = msg.value - mintFee;
            if (excess > 0) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
                require(refundSuccess, "Refund failed");
            }
            (bool feeSuccess, ) = payable(feeRecipient).call{value: mintFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        address newToken;
        bytes memory constructorArgs = abi.encode(name, symbol, initialSupply);
        bytes memory deploymentData = abi.encodePacked(bytecode, constructorArgs);
        
        assembly {
            newToken := create(0, add(deploymentData, 0x20), mload(deploymentData))
        }
        require(newToken != address(0), "Token creation failed");

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
        require(amount > 0, "Amount must be greater than zero");

        bool isMoopHolder = IERC20(moopToken).balanceOf(msg.sender) >= MIN_MOOP_BALANCE;
        if (!isMoopHolder) {
            require(msg.value >= mintFee, "Insufficient fee: 0.001 ETH required");
            uint256 excess = msg.value - mintFee;
            if (excess > 0) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
                require(refundSuccess, "Refund failed");
            }
            (bool feeSuccess, ) = payable(feeRecipient).call{value: mintFee}("");
            require(feeSuccess, "Fee transfer failed");
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