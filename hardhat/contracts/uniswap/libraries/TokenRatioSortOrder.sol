// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;

library TokenRatioSortOrder {
    int256 constant NUMERATOR_VERY_MOST = 6; // MOOP
    int256 constant NUMERATOR_MOST = 5;      // USDC
    int256 constant NUMERATOR_MORE = 4;      // USDT
    int256 constant NUMERATOR = 3;           // DAI
    int256 constant DENOMINATOR = -3;        // WETH9
    int256 constant DENOMINATOR_MORE = -4;   // TBTC
    int256 constant DENOMINATOR_MOST = -5;   // WBTC
}