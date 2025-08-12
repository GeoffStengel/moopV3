// contracts/uniswap/libraries/SVGUtils.sol
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;

import './HexStrings.sol';
import './NFTSVG.sol';
import './Strings.sol';

library SVGUtils {
    using HexStrings for uint256;
    using Strings for uint256;

    struct ConstructTokenURIParams {
        address quoteTokenAddress;
        address baseTokenAddress;
        address poolAddress;
        string quoteTokenSymbol;
        string baseTokenSymbol;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        int24 tickCurrent;
        int24 tickSpacing;
        uint256 tokenId;
    }

    function generateSVGImage(ConstructTokenURIParams memory params) internal pure returns (string memory) {
        NFTSVG.SVGParams memory svgParams = NFTSVG.SVGParams({
            quoteToken: HexStrings.toHexString(uint256(params.quoteTokenAddress), 20),
            baseToken: HexStrings.toHexString(uint256(params.baseTokenAddress), 20),
            poolAddress: params.poolAddress,
            quoteTokenSymbol: params.quoteTokenSymbol,
            baseTokenSymbol: params.baseTokenSymbol,
            feeTier: feeToPercentString(params.fee),
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            tickSpacing: params.tickSpacing,
            overRange: overRange(params.tickLower, params.tickUpper, params.tickCurrent),
            tokenId: params.tokenId,
            color0: tokenToColorHex(uint256(params.quoteTokenAddress), 136),
            color1: tokenToColorHex(uint256(params.baseTokenAddress), 136),
            color2: tokenToColorHex(uint256(params.quoteTokenAddress), 0),
            color3: tokenToColorHex(uint256(params.baseTokenAddress), 0),
            x1: scale(getCircleCoord(uint256(params.quoteTokenAddress), 16, params.tokenId), 0, 255, 16, 274),
            y1: scale(getCircleCoord(uint256(params.baseTokenAddress), 16, params.tokenId), 0, 255, 100, 484),
            x2: scale(getCircleCoord(uint256(params.quoteTokenAddress), 32, params.tokenId), 0, 255, 16, 274),
            y2: scale(getCircleCoord(uint256(params.baseTokenAddress), 32, params.tokenId), 0, 255, 100, 484),
            x3: scale(getCircleCoord(uint256(params.quoteTokenAddress), 48, params.tokenId), 0, 255, 16, 274),
            y3: scale(getCircleCoord(uint256(params.baseTokenAddress), 48, params.tokenId), 0, 255, 100, 484)
        });
        return NFTSVG.generateSVG(svgParams);
    }

    function feeToPercentString(uint24 fee) internal pure returns (string memory) {
        if (fee == 500) return '0.05%';
        if (fee == 3000) return '0.3%';
        if (fee == 10000) return '1%';
        return 'Unknown';
    }

    function overRange(int24 tickLower, int24 tickUpper, int24 tickCurrent) internal pure returns (int8) {
        if (tickCurrent < tickLower) return -1;
        if (tickCurrent > tickUpper) return 1;
        return 0;
    }

    function tokenToColorHex(uint256 token, uint256 offset) internal pure returns (string memory) {
        return string((token >> offset).toHexStringNoPrefix(3));
    }

    function getCircleCoord(uint256 tokenAddress, uint256 offset, uint256 tokenId) internal pure returns (uint256) {
        return ((tokenAddress >> offset) % 256) * tokenId % 256; // Use tokenId for randomization
    }

    function scale(uint256 v, uint256 inMin, uint256 inMax, uint256 outMin, uint256 outMax) internal pure returns (string memory) {
        uint256 result = (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        return result.toString();
    }

    function addressToString(address addr) internal pure returns (string memory) {
        return HexStrings.toHexString(uint256(addr), 20);
    }
}