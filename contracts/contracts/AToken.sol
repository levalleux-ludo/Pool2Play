// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AToken is ERC20 {
    constructor() public ERC20("AToken", "ATK") {}
}