//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "./ISubscriptionChecker.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameMaster is Ownable {

    enum PlayerStatus { Unregistered, Pending, Registered }
    mapping(address => PlayerStatus) public playerStatus;
    mapping(address => uint256) private pendingTimestamp;
    address subscriptionCheckerAddress;

    event PlayerStatusChanged(address indexed player, PlayerStatus status);

    constructor(address _subscriptionCheckerAddress) public Ownable() {
        subscriptionCheckerAddress = _subscriptionCheckerAddress;
    }
    // function check(address account) internal returns (bool) {
    //     (bool didGet, bool hasSubscribed) = ISubscriptionChecker(subscriptionCheckerAddress).check(account);
    //     return (didGet && hasSubscribed);
    // }

    function register() external {
        address player = msg.sender;
        require(playerStatus[player] != PlayerStatus.Registered, "PLAYER ALREADY REGISTERED");
        (bool didGet, bool hasSubscribed) = ISubscriptionChecker(subscriptionCheckerAddress).check(
            player,
            (playerStatus[player] != PlayerStatus.Pending),
            pendingTimestamp[player]
        );
        console.log("GameMaster:check didGet", didGet);
        console.log("GameMaster:check hasSubscribed", hasSubscribed);
        if (didGet && hasSubscribed) {
            playerStatus[player] = PlayerStatus.Registered;
            emit PlayerStatusChanged(player, playerStatus[player]);
        } else if (didGet) {
            playerStatus[player] = PlayerStatus.Unregistered;
            emit PlayerStatusChanged(player, playerStatus[player]);
        } else if (playerStatus[player] != PlayerStatus.Pending) {
            playerStatus[player] = PlayerStatus.Pending;
            pendingTimestamp[player] = block.timestamp;
            emit PlayerStatusChanged(player, playerStatus[player]);
        }
    }

    function check() external {
        address player = msg.sender;
        require(playerStatus[player] == PlayerStatus.Registered, "PLAYER MUST BE REGISTERED");
        (bool didGet, bool hasSubscribed) = ISubscriptionChecker(subscriptionCheckerAddress).check(
            player,
            (playerStatus[player] != PlayerStatus.Pending),
            pendingTimestamp[player]
        );
        console.log("GameMaster:check didGet", didGet);
        console.log("GameMaster:check hasSubscribed", hasSubscribed);
        if (didGet && hasSubscribed) {
        } else if (didGet) {
            playerStatus[player] = PlayerStatus.Unregistered;
            emit PlayerStatusChanged(player, playerStatus[player]);
        } else if (playerStatus[player] != PlayerStatus.Pending) {
            playerStatus[player] = PlayerStatus.Pending;
            pendingTimestamp[player] = block.timestamp;
            emit PlayerStatusChanged(player, playerStatus[player]);
        }
    }

    function setThreshold(uint256 _threshold) external onlyOwner {
        ISubscriptionChecker(subscriptionCheckerAddress).setThreshold(_threshold);
    }


}