// contracts/uniswap/libraries/SVGUtils.sol
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;
import "./HexStrings.sol";
import "./NFTSVG.sol";
import "./NFTDescriptor.sol";

library SVGUtils {
    function generateSVGImage(NFTDescriptor.ConstructTokenURIParams memory params) internal pure returns (string memory) {
        NFTSVG.SVGParams memory svgParams = NFTSVG.SVGParams({
            quoteToken: NFTDescriptor.addressToString(params.quoteTokenAddress),
            baseToken: NFTDescriptor.addressToString(params.baseTokenAddress),
            poolAddress: params.poolAddress,
            quoteTokenSymbol: params.quoteTokenSymbol,
            baseTokenSymbol: params.baseTokenSymbol,
            feeTier: NFTDescriptor.feeToPercentString(params.fee),
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            tickSpacing: params.tickSpacing,
            overRange: NFTDescriptor.overRange(params.tickLower, params.tickUpper, params.tickCurrent),
            tokenId: params.tokenId,
            color0: NFTDescriptor.tokenToColorHex(uint256(params.quoteTokenAddress), 136),
            color1: NFTDescriptor.tokenToColorHex(uint256(params.baseTokenAddress), 136),
            color2: NFTDescriptor.tokenToColorHex(uint256(params.quoteTokenAddress), 0),
            color3: NFTDescriptor.tokenToColorHex(uint256(params.baseTokenAddress), 0),
            x1: NFTDescriptor.scale(NFTDescriptor.getCircleCoord(uint256(params.quoteTokenAddress), 16, params.tokenId), 0, 255, 16, 274),
            y1: NFTDescriptor.scale(NFTDescriptor.getCircleCoord(uint256(params.baseTokenAddress), 16, params.tokenId), 0, 255, 100, 484),
            x2: NFTDescriptor.scale(NFTDescriptor.getCircleCoord(uint256(params.quoteTokenAddress), 32, params.tokenId), 0, 255, 16, 274),
            y2: NFTDescriptor.scale(NFTDescriptor.getCircleCoord(uint256(params.baseTokenAddress), 32, params.tokenId), 0, 255, 100, 484),
            x3: NFTDescriptor.scale(NFTDescriptor.getCircleCoord(uint256(params.quoteTokenAddress), 48, params.tokenId), 0, 255, 16, 274),
            y3: NFTDescriptor.scale(NFTDescriptor.getCircleCoord(uint256(params.baseTokenAddress), 48, params.tokenId), 0, 255, 100, 484)
        });
        return NFTSVG.generateSVG(svgParams);
    }
}