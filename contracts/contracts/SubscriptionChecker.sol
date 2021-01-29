//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "./usingtellor/UsingTellor.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ISubscriptionChecker.sol";
import "./Interface/ITellor.sol";

contract SubscriptionChecker is UsingTellor, ISubscriptionChecker {
  using SafeMath for uint256;
  
  uint256 public requestId;
  uint256 public tipIncrement;
  uint256 public threshold;
  address payable telloraddress;
  address public subscribedToken;

  constructor(address payable _telloraddress, address _subscribedToken, uint256 _requestId, uint256 _threshold, uint256 _tipIncrement) UsingTellor(_telloraddress) {
    telloraddress = _telloraddress;
    requestId = _requestId;
    threshold = _threshold;
    tipIncrement = _tipIncrement;
    subscribedToken = _subscribedToken;
  }

  function check(address account, bool tip) external override returns (bool didGet, bool hasSubscribed) {
    uint _timestamp;
    uint _subscriptionBalance;
    bytes32 paramsHash = ITellor(telloraddress).addParams(requestId, abi.encode(subscribedToken, account));
    // TODO bytes32 paramsHash = keccak256(abi.encode(subscribedToken, abi.encode('balanceOf)...));

    (didGet, _subscriptionBalance, _timestamp) = getCurrentValue(requestId, paramsHash);
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
      ITellor(telloraddress).addTip(requestId, paramsHash, tipIncrement);
    }
  }

}
