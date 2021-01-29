//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "usingtellor/contracts/UsingTellor.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ISubscriptionChecker.sol";
import "usingtellor/Interface/ITellor.sol";

contract SubscriptionChecker is UsingTellor, ISubscriptionChecker {
  using SafeMath for uint256;
  
  uint256 public requestId;
  uint256 public tipIncrement;
  uint256 public threshold;
  address payable telloraddress;

  constructor(address payable _telloraddress, uint256 _requestId, uint256 _threshold, uint256 _tipIncrement) UsingTellor(_telloraddress) {
    telloraddress = _telloraddress;
    requestId = _requestId;
    threshold = _threshold;
    tipIncrement = _tipIncrement;
  }

  function check(address account, bool tip) external override returns (bool didGet, bool hasSubscribed) {
    uint _timestamp;
    uint _subscriptionBalance;

    (didGet, _subscriptionBalance, _timestamp) = getCurrentValue(requestId);
    didGet = (_timestamp != 0); // Bug in UsingTellor ??
    console.log("SubscriptionChecker:check didGet", didGet);
    console.log("SubscriptionChecker:check _subscriptionBalance", _subscriptionBalance);
    console.log("SubscriptionChecker:check _timestamp", _timestamp);
    console.log("SubscriptionChecker:check threshold", threshold);
    console.log("SubscriptionChecker:check block.timestamp", block.timestamp);
    didGet = didGet && (_timestamp >= block.timestamp.sub(threshold));
    if (didGet) {
      hasSubscribed = (_subscriptionBalance > 0);
    } else if (tip) {
      ITellor(telloraddress).addTip(requestId, tipIncrement);
    }
  }

}
