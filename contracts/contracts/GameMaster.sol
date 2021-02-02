//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "./ISubscriptionChecker.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RockPaperScissors.sol";

contract GameMaster is Ownable {

    enum PlayerStatus { Unregistered, Pending, Registered }
    mapping(address => PlayerStatus) public playerStatus;
    mapping(address => uint256) private pendingTimestamp;
    address subscriptionCheckerAddress;
    uint8 public constant nbRounds = 3;
    RockPaperScissors[] private games;
    mapping(address => address) public gameForPlayer;

    event PlayerStatusChanged(address indexed player, PlayerStatus status);
    event OnRegistered(address player, address game);

    constructor(address _subscriptionCheckerAddress) Ownable() {
        subscriptionCheckerAddress = _subscriptionCheckerAddress;
    }
    // function check(address account) internal returns (bool) {
    //     (bool didGet, bool hasSubscribed) = ISubscriptionChecker(subscriptionCheckerAddress).check(account);
    //     return (didGet && hasSubscribed);
    // }

    function getNbGames() external view returns (uint256) {
        return games.length;
    }

    function getGameAt(uint256 index) external view returns (address) {
        require(index < games.length, "GameMaster: INDEX OUT OF SCOPE");
        return address(games[index]);
    }

    function register() external {
        address player = msg.sender;
        (bool didGet, bool hasSubscribed) = ISubscriptionChecker(subscriptionCheckerAddress).check(
            player,
            (playerStatus[player] != PlayerStatus.Pending),
            pendingTimestamp[player]
        );
        console.log("GameMaster:check didGet", didGet);
        console.log("GameMaster:check hasSubscribed", hasSubscribed);
        if (didGet && hasSubscribed) {
            if (playerStatus[player] != PlayerStatus.Registered) {
                playerStatus[player] = PlayerStatus.Registered;
                emit PlayerStatusChanged(player, playerStatus[player]);
            }
            onRegistered(player);
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

    function onRegistered(address player) internal {
        // Choose a game for the player
        RockPaperScissors game = chooseGame(player);
        // Register the player to the game
        game.register(player);
        // Raise event
        emit OnRegistered(player, address(game));
    }

    function chooseGame(address player) internal returns (RockPaperScissors) {
        if (gameForPlayer[player] != address(0)) {
            RockPaperScissors game = RockPaperScissors(gameForPlayer[player]);
            require(game.status() == RockPaperScissors.eGameStatus.Initialized, "PLAYER ALREADY IN GAME");
            return game;
        }
        for (uint i = 0; i < games.length; i++) {
            RockPaperScissors game = games[i];
            if (game.status() == RockPaperScissors.eGameStatus.Initialized) {
                return game;
            }
        }
        console.log("No game available: build a new one");
        RockPaperScissors game = new RockPaperScissors(nbRounds);
        games.push(game);
        return game;
    }


}