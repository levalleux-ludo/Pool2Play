//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

interface ISubscriptionChecker {
    function check(address account, bool forceTip, uint lastTimestamp) external returns (bool didGet, bool hasSubscribed);
    function setThreshold(uint256 _threshold) external;
}