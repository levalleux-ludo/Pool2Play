//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "./usingtellor/UsingTellor.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISubscriptionChecker.sol";
import "./Interface/ITellor.sol";

contract SubscriptionChecker is UsingTellor, ISubscriptionChecker, Ownable {
  using SafeMath for uint256;
  
  uint256 public requestId;
  uint256 public tipIncrement;
  uint256 public threshold;
  address payable telloraddress;
  address public subscribedToken;

  event Check(address indexed account, bool forceTip, uint lastTimestamp, bool didGet, uint timestamp, uint subscriptionBalance, bool tipAdded);

  constructor(address payable _telloraddress, address _subscribedToken, uint256 _requestId, uint256 _threshold, uint256 _tipIncrement) UsingTellor(_telloraddress) Ownable() {
    telloraddress = _telloraddress;
    requestId = _requestId;
    threshold = _threshold;
    tipIncrement = _tipIncrement;
    subscribedToken = _subscribedToken;
  }

  function setThreshold(uint256 _threshold) external override onlyOwner {
    threshold = _threshold;
  }

  function check(address account, bool forceTip, uint lastTimestamp) external override returns (bool didGet, bool hasSubscribed) {
    require((msg.sender == owner()) || (msg.sender == account), "SubscriptionChecker: NOT AUTHORIZED" );
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
    bool tipAdded = false;
    if (didGet) {
      hasSubscribed = (_subscriptionBalance > 0);
    } else if (forceTip || (lastTimestamp < block.timestamp.sub(threshold))) {
      tipAdded = true;
      ITellor(telloraddress).addTip(requestId, paramsHash, tipIncrement);
    }
    emit Check(account, forceTip, lastTimestamp, didGet, _timestamp, _subscriptionBalance, tipAdded);
  }

}
