// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title The interface for the Uniswap V3 Factory
/// @notice The Uniswap V3 Factory facilitates creation of Uniswap V3 pools and control over the protocol fees
interface IUniswapV3Factory {
    /// @notice Emitted when a pool is created
    event PoolCreated(
        address indexed token0,
        address indexed token1,
        uint24 indexed fee,
        int24 tickSpacing,
        address pool
    );

    /// @notice Emitted when a new fee amount is enabled for pool creation via the factory
    event FeeAmountEnabled(uint24 indexed fee, int24 indexed tickSpacing);

    /// @notice Returns the current owner of the factory
    function owner() external view returns (address);

    /// @notice Returns the address that collects protocol fees
    function feeTo() external view returns (address);

    /// @notice Returns the tick spacing for a given fee amount, if enabled, or 0 if not enabled
    function feeAmountTickSpacing(uint24 fee) external view returns (int24);

    /// @notice Returns the pool address for a given pair of tokens and a fee, or address 0 if it does not exist
    function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool);

    /// @notice Creates a pool for the given two tokens and fee
    function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool);

    /// @notice Enables a fee amount with the given tickSpacing
    function enableFeeAmount(uint24 fee, int24 tickSpacing) external;
}