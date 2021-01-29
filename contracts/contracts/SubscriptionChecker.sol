//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "usingtellor/contracts/UsingTellor.sol";

contract SubscriptionChecker is UsingTellor {
  string greeting;
  uint256 public nonce;

  constructor(address payable _telloraddress) UsingTellor(_telloraddress) {
    console.log("Deploying a SubscriptionChecker with tellor address:", _telloraddress);
  }

}
