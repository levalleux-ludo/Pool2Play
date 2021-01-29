//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";


contract Greeter {
  string greeting;
  uint256 public nonce;

  constructor(string memory _greeting, uint256 _nonce) {
    console.log("Deploying a Greeter with greeting:", _greeting);
    greeting = _greeting;
    nonce = _nonce;
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public {
    console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
    greeting = _greeting;
  }
}
