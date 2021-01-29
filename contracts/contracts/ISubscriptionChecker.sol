//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

interface ISubscriptionChecker {
    function check(address account, bool tip) external returns (bool didGet, bool hasSubscribed);
}