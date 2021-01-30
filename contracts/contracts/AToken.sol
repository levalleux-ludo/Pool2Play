// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract AToken is ERC20 {
    using SafeMath for uint256;

    /**
     * @dev The price of a token in wei (1 ETH = 10^18 wei)
     */
    uint256 public tokenPrice; // the price of a token in wei (1 ETH = 10^18 wei)

    constructor(uint256 tokenPrice_) public ERC20("AToken", "ATK") {
        tokenPrice = tokenPrice_;
    }

    function buy(uint256 amount) external payable {
        uint256 requestedPrice = computePrice(amount);
        console.log("Buying", amount);
        console.log("Price", requestedPrice);
        console.log("Paid", msg.value);
        require(
            (msg.value >= requestedPrice),
            "AToken: Transaction payment is too low."
        );
        _mint(msg.sender, amount);
        if (msg.value > requestedPrice) {
            console.log("Change", msg.value - requestedPrice);
            msg.sender.transfer(msg.value - requestedPrice);
        }
    }

    function sell(uint256 amount) external {
        uint256 requestedPrice = computePrice(amount);
        console.log("Selling", amount);
        console.log("Price", requestedPrice);
        require(address(this).balance > requestedPrice, "AToken: Contract balance too low");
        _burn(msg.sender, amount);
        msg.sender.transfer(requestedPrice);
    }

    /** 
    * @dev Compute the price of a given amount of tokens
     *
     * Arguments:
     * - amount: the amount of token to be quoted in base units (times the token decimals)
     *
     */
    function computePrice(uint256 amount) public view returns (uint256 requestedPrice) {
        requestedPrice = amount.mul(tokenPrice).div(10**decimals());
    }
}