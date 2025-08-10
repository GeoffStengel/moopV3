// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.7.6;

import './interfaces/IUniswapV3Factory.sol';
import './UniswapV3PoolDeployer.sol';
import './NoDelegateCall.sol';
import './UniswapV3Pool.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/// @title Canonical Uniswap V3 factory
/// @notice Deploys Uniswap V3 pools and manages ownership and control over pool protocol fees
contract UniswapV3Factory is IUniswapV3Factory, UniswapV3PoolDeployer, NoDelegateCall, Ownable {
    /// @inheritdoc IUniswapV3Factory
    address public override feeTo;

    /// @inheritdoc IUniswapV3Factory
    mapping(uint24 => int24) public override feeAmountTickSpacing;
    /// @inheritdoc IUniswapV3Factory
    mapping(address => mapping(address => mapping(uint24 => address))) public override getPool;

    constructor(address _feeTo) Ownable() {
        require(_feeTo != address(0), "Invalid feeTo address");
        feeTo = _feeTo;
        feeAmountTickSpacing[100] = 10; // 0.01% pool fee for stablecoins
        emit FeeAmountEnabled(100, 10);
        feeAmountTickSpacing[500] = 10; // 0.05% pool fee
        emit FeeAmountEnabled(500, 10);
        feeAmountTickSpacing[1000] = 20; // 0.1% pool fee for mid-volatility pairs
        emit FeeAmountEnabled(1000, 20);
        feeAmountTickSpacing[3000] = 60; // 0.3% pool fee
        emit FeeAmountEnabled(3000, 60);
        feeAmountTickSpacing[10000] = 200; // 1% pool fee
        emit FeeAmountEnabled(10000, 200);
    }

    /// @inheritdoc IUniswapV3Factory
    function owner() public view override(IUniswapV3Factory, Ownable) returns (address) {
        return Ownable.owner();
    }

    /// @inheritdoc IUniswapV3Factory
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external override noDelegateCall returns (address pool) {
        require(tokenA != tokenB, "Identical tokens");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Zero address token");
        int24 tickSpacing = feeAmountTickSpacing[fee];
        require(tickSpacing != 0, "Invalid fee tier");
        require(getPool[token0][token1][fee] == address(0), "Pool already exists");
        pool = deploy(address(this), token0, token1, fee, tickSpacing);
        getPool[token0][token1][fee] = pool;
        // Populate mapping in the reverse direction
        getPool[token1][token0][fee] = pool;
        emit PoolCreated(token0, token1, fee, tickSpacing, pool);
    }


    function setFeeTo(address _feeTo) external onlyOwner {
        require(_feeTo != address(0), "Invalid feeTo address");
        feeTo = _feeTo;
        emit FeeToUpdated(_feeTo);
    }

    /// @inheritdoc IUniswapV3Factory
    function enableFeeAmount(uint24 fee, int24 tickSpacing) public override onlyOwner {
        require(fee < 1000000, "Fee too large");
        require(tickSpacing > 0 && tickSpacing < 16384, "Invalid tick spacing");
        require(feeAmountTickSpacing[fee] == 0, "Fee tier exists");

        feeAmountTickSpacing[fee] = tickSpacing;
        emit FeeAmountEnabled(fee, tickSpacing);
    }

    event FeeToUpdated(address feeTo);
}