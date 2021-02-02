//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RockPaperScissors is Ownable {

    enum eChoice { Rock, Paper, Scissors }
    enum eGameStatus { Initialized, Ready, Committed, RoundEnded }
    
    event onStatusChanged(eGameStatus newStatus);
    event onGameEnded(uint8[2] scores);
    event onRoundEnded(eChoice[2] choices, address winner, uint8[2] scores);

    bytes32[3] private CHOICES = [keccak256("Rock"), keccak256("Paper"), keccak256("Scissors")];

    uint8 public nbRounds;
    uint8 public remainingRounds;
    eGameStatus public status;
    address[2] public players;
    uint8[2] public scores;
    eChoice[2] public choices;
    bytes32[2] public secrets;
    bool[2] public committed;
    bool[2] public revealed;
    mapping(address => uint8) public playerIndex;

    modifier roundsRemain() {
        require(remainingRounds > 0, "RockPaperScissors: NO ROUND REMAIN");
        _;
    }

    modifier inStatus(eGameStatus _status) {
        require(status == _status, "RockPaperScissors: INVALID STATUS");
        _;
    }

    modifier inStatus2(eGameStatus _status1, eGameStatus _status2) {
        require((status == _status1) || (status == _status2), "RockPaperScissors: INVALID STATUS");
        _;
    }

    modifier registered() {
        require((msg.sender == players[0]) || (msg.sender == players[1]), "RockPaperScissors: NOT REGISTERED");
        _;
    }

    constructor(uint8 _nbRounds) Ownable() {
        nbRounds = _nbRounds;
        status = eGameStatus.Initialized;
        goInitialized();
    }

    // TODO: change to register(player) onlyOwner to be called by GameMaster
    function register(address player) external inStatus(eGameStatus.Initialized) onlyOwner {
        if (players[0] == address(0)) {
            players[0] = player;
            playerIndex[player] = 0;
        } else if (players[0] == player) {
            revert("RockPaperScissors: ALREADY REGISTERED");
        } else if (players[1] == address(0)) {
            players[1] = player;
            playerIndex[player] = 1;
            goReady();
        } else if (players[1] == player) {
            revert("RockPaperScissors: ALREADY REGISTERED");
        } else {
            revert("RockPaperScissors: TOO MANY PLAYERS");
        }
    }

    function commit(bytes32 secret) external inStatus(eGameStatus.Ready) registered {
        uint8 index = playerIndex[msg.sender];
        require(!committed[index], "RockPaperScissors: ALREADY COMMITTED");
        console.log("commit player", index);
        console.logBytes32(secret);
        secrets[index] = secret;
        committed[index] = true;
        if (checkCommitted()) {
            goCommitted();
        }
    }

    function reveal(eChoice choice, bytes memory random) external inStatus(eGameStatus.Committed) registered {
        require(checkCommitted(), "RockPaperScissors: COMMITTED NOT COMPLETED");
        uint8 index = playerIndex[msg.sender];
        require(!revealed[index], "RockPaperScissors: ALREADY COMMITTED");
        console.log("reveal player", index);
        bytes32 choiceHash = CHOICES[uint8(choice)];
        console.log("choiceHash");
        console.logBytes32(choiceHash);
        bytes32 rdmHash = keccak256(random);
        console.log("rdmHash");
        console.logBytes32(rdmHash);
        bytes32 concat = choiceHash ^ rdmHash;
        console.log("concat");
        console.logBytes32(concat);
        // bytes memory concat2 = bytes(concat);
        bytes32 secret = keccak256(abi.encode(concat));
        console.log("computed secret");
        console.logBytes32(secret);
        require(secret == secrets[index], "RockPaperScissors: SECRET DOES NOT MATCH");
        choices[index] = choice;
        revealed[index] = true;
        if (checkRevealed()) {
            goRoundEnded();
        }
    }


    function checkCommitted() internal view returns (bool) {
        return committed[0] && committed[1];
    }

    function checkRevealed() internal view returns (bool) {
        return revealed[0] && revealed[1];
    }

    function goInitialized() internal inStatus2(eGameStatus.Initialized, eGameStatus.RoundEnded) {
        remainingRounds = nbRounds;
        for (uint8 i = 0; i < 2; i++) {
            if (players[i] != address(0)) {
                delete playerIndex[players[i]];
                players[i] = address(0);
            }
            committed[i] = false;
            revealed[i] = false;
            scores[i] = 0;
            secrets[i] = bytes32(0);
        }
        status = eGameStatus.Initialized;
        emit onStatusChanged(status);
        // We wait for the 2 players to register
    }


    function goReady() internal inStatus2(eGameStatus.Initialized, eGameStatus.RoundEnded) roundsRemain {
        for (uint8 i = 0; i < 2; i++) {
            committed[i] = false;
            revealed[i] = false;
        }
        status = eGameStatus.Ready;
        emit onStatusChanged(status);
        // We wait for the 2 players to commit
    }

    function goCommitted() internal inStatus(eGameStatus.Ready) {
        require(checkCommitted(), "RockPaperScissors: COMMITTED NOT COMPLETED");
        for (uint8 i = 0; i < 2; i++) {
            revealed[i] = false;
        }
        status = eGameStatus.Committed;
        emit onStatusChanged(status);
        // We wait for the 2 players to reveal
    }

    function goRoundEnded() internal inStatus(eGameStatus.Committed) {
        require(checkRevealed(), "RockPaperScissors: REVEALED NOT COMPLETED");
        status = eGameStatus.RoundEnded;
        emit onStatusChanged(status);
        computeScores();
        remainingRounds--;
        if (remainingRounds > 0) {
            goReady();
        } else {
            emit onGameEnded(scores);
            goInitialized();
        }
    }

    function computeScores() internal inStatus(eGameStatus.RoundEnded) {
        address winner = address(0);
        if (choices[0] == choices[1]) {
            console.log("Equality");
        } else {
            uint8 combi = uint8(choices[0]) * 4 + uint8(choices[1]);
            uint8 winnerIndex = 0;
            if ((combi == 1) // R<P
            || (combi == 6) // P<S
            || (combi == 8)) // S>R
            {
                console.log("Player2 wins");
                // Winner players[1]
                winnerIndex = 1;
            }
            winner = players[winnerIndex];
            scores[winnerIndex]++;
        }
        emit onRoundEnded(choices, winner, scores);
    }

}