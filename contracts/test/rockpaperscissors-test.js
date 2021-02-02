const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployRPS, revertMessage } = require("../scripts/utils");

const eGameStatus = {
    Initialized: 0,
    Ready: 1,
    Committed: 2,
    RoundEnded: 3
}

const eChoice = {
    Rock: 0,
    Paper: 1,
    Scissors: 2
}

const ChoicesStr = [
    "Rock",
    "Paper",
    "Scissors"
]

let rockPaperScissors;
let deployer, account1, account2, account3;
let deployerAddr, account1Addr, account2Addr, account3Addr;
let random1, random2, random3;
let choice1, choice2;

const nbRounds = 3;

function getSecretChoice(choice) {
    const rdm = Math.floor(Math.random() * 100000000).toString();
    const rdmHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(rdm));
    const rdmHash_tab = ethers.utils.arrayify(rdmHash);
    console.log('rdm', rdm, 'hash', rdmHash);
    const choiceStr = ChoicesStr[choice];
    const choiceHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(choiceStr));
    const choiceHash_tab = ethers.utils.arrayify(choiceHash);
    console.log('choice', choiceStr, 'hash', choiceHash);
    const xor_tab = [];
    for (let i = 0; i < 32; i++) {
        xor_tab.push(choiceHash_tab[i] ^ rdmHash_tab[i]);
    }
    const xor = ethers.utils.hexlify(xor_tab);
    console.log('xor', xor);
    const secret = ethers.utils.keccak256(xor)
    console.log('secret', secret);
    return { random: ethers.utils.toUtf8Bytes(rdm), secret }
}

async function playRound(_account1, _account2, secret1, secret2) {
    await rockPaperScissors.connect(_account1).commit(secret1);
    await rockPaperScissors.connect(_account2).commit(secret2);
    await rockPaperScissors.connect(_account1).reveal(choice1, random1);
    return rockPaperScissors.connect(_account2).reveal(choice2, random2);
}

describe('RockPaperScissors', async() => {
    before('before', async() => {
        [deployer, account1, account2, account3] = await ethers.getSigners();
        deployerAddr = await deployer.getAddress();
        account1Addr = await account1.getAddress();
        account2Addr = await account2.getAddress();
        account3Addr = await account3.getAddress();
        const contracts = await deployRPS({ rockPaperScissors: [nbRounds] });
        rockPaperScissors = contracts.rockPaperScissors;
    });
    it('rockPaperScissors is deployed', async() => {
        expect(await rockPaperScissors.nbRounds()).to.equal(nbRounds);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds);
    });
    it('initial status is Initialized', async() => {
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Initialized);
    });
    it('account1 can register', async() => {
        await rockPaperScissors.connect(deployer).register(account1Addr);
        expect(await rockPaperScissors.players(0)).to.equal(account1Addr);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Initialized);
    });
    it('account1 can not register twice', async() => {
        await expect(rockPaperScissors.connect(deployer).register(account1Addr)).to.be.revertedWith(revertMessage('RockPaperScissors: ALREADY REGISTERED'));
    });
    it('account2 can register', async() => {
        expect(await rockPaperScissors.connect(deployer).register(account2Addr))
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Ready);
        expect(await rockPaperScissors.players(1)).to.equal(account2Addr);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Ready);
    });
    it('account2 can not register twice', async() => {
        await expect(rockPaperScissors.connect(deployer).register(account2Addr)).to.be.revertedWith(revertMessage('RockPaperScissors: INVALID STATUS'));
    });
    it('account3 can not register', async() => {
        await expect(rockPaperScissors.connect(deployer).register(account3Addr)).to.be.revertedWith(revertMessage('RockPaperScissors: INVALID STATUS'));
    });
    it('account3 can not commit', async() => {
        const choice = eChoice.Paper;
        const secretChoice = getSecretChoice(choice);
        await expect(rockPaperScissors.connect(account3).commit(secretChoice.secret)).to.be.revertedWith(revertMessage('RockPaperScissors: NOT REGISTERED'));
    });
    it('account1 can not reveal', async() => {
        const choice = eChoice.Paper;
        const secretChoice = getSecretChoice(choice);
        await expect(rockPaperScissors.connect(account1).reveal(choice, secretChoice.random)).to.be.revertedWith(revertMessage('RockPaperScissors: INVALID STATUS'));
    });
    it('account1 can commit', async() => {
        choice1 = eChoice.Paper;
        const secretChoice = getSecretChoice(choice1);
        random1 = secretChoice.random;
        expect(await rockPaperScissors.committed(0)).to.equal(false);
        await rockPaperScissors.connect(account1).commit(secretChoice.secret);
        expect(await rockPaperScissors.committed(0)).to.equal(true);
    });
    it('account1 can not reveal', async() => {
        await expect(rockPaperScissors.connect(account1).reveal(choice1, random1)).to.be.revertedWith(revertMessage('RockPaperScissors: INVALID STATUS'));
    });
    it('account2 can commit', async() => {
        choice2 = eChoice.Paper;
        const secretChoice = getSecretChoice(choice2);
        random2 = secretChoice.random;
        expect(await rockPaperScissors.committed(1)).to.equal(false);
        expect(await rockPaperScissors.connect(account2).commit(secretChoice.secret))
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Committed);
        expect(await rockPaperScissors.committed(1)).to.equal(true);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Committed);
    });
    it('account1 can reveal', async() => {
        expect(await rockPaperScissors.revealed(0)).to.equal(false);
        await rockPaperScissors.connect(account1).reveal(choice1, random1);
        expect(await rockPaperScissors.revealed(0)).to.equal(true);
    });
    it('account2 can reveal', async() => {
        expect(await rockPaperScissors.revealed(1)).to.equal(false);
        expect(await rockPaperScissors.connect(account2).reveal(choice2, random2))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], '0x' + '0'.repeat(40), [0, 0])
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Ready);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Ready);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds - 1);
        expect(await rockPaperScissors.scores(0)).to.equal(0);
        expect(await rockPaperScissors.scores(1)).to.equal(0);
    });
    it('play round #2', async() => {
        choice1 = eChoice.Rock;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Rock;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account1, account2, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], '0x' + '0'.repeat(40), [0, 0])
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Ready);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds - 2);
        expect(await rockPaperScissors.scores(0)).to.equal(0);
        expect(await rockPaperScissors.scores(1)).to.equal(0);
    });
    it('play round #3', async() => {
        choice1 = eChoice.Scissors;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Scissors;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account1, account2, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], '0x' + '0'.repeat(40), [0, 0])
            .to.emit(rockPaperScissors, 'onGameEnded').withArgs([0, 0])
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Initialized);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Initialized);
    });
    it('2nd game account1 can register', async() => {
        await rockPaperScissors.connect(deployer).register(account1Addr);
        expect(await rockPaperScissors.players(0)).to.equal(account1Addr);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Initialized);
    });
    it('2nd game account2 can register', async() => {
        await rockPaperScissors.connect(deployer).register(account2Addr);
        expect(await rockPaperScissors.players(1)).to.equal(account2Addr);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Ready);
    });
    it('2nd game play round #1', async() => {
        choice1 = eChoice.Rock;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Scissors;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account1, account2, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], account1Addr, [1, 0]);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds - 1);
        expect(await rockPaperScissors.scores(0)).to.equal(1);
        expect(await rockPaperScissors.scores(1)).to.equal(0);
    });
    it('2nd game play round #2', async() => {
        choice1 = eChoice.Scissors;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Paper;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account1, account2, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], account1Addr, [2, 0]);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds - 2);
        expect(await rockPaperScissors.scores(0)).to.equal(2);
        expect(await rockPaperScissors.scores(1)).to.equal(0);
    });
    it('2nd game play round #3', async() => {
        choice1 = eChoice.Paper;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Rock;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account1, account2, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], account1Addr, [3, 0])
            .to.emit(rockPaperScissors, 'onGameEnded').withArgs([3, 0])
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Initialized);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds);
    });
    it('3rd game account2 can register', async() => {
        await rockPaperScissors.connect(deployer).register(account2Addr);
        expect(await rockPaperScissors.players(0)).to.equal(account2Addr);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Initialized);
    });
    it('3rd game account3 can register', async() => {
        await rockPaperScissors.connect(deployer).register(account3Addr);
        expect(await rockPaperScissors.players(1)).to.equal(account3Addr);
        expect(await rockPaperScissors.status()).to.equal(eGameStatus.Ready);
    });
    it('3rd game play round #1', async() => {
        choice1 = eChoice.Rock;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Paper;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account2, account3, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], account3Addr, [0, 1]);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds - 1);
        expect(await rockPaperScissors.scores(0)).to.equal(0);
        expect(await rockPaperScissors.scores(1)).to.equal(1);
    });
    it('3rd game play round #2', async() => {
        choice1 = eChoice.Scissors;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Rock;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account2, account3, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], account3Addr, [0, 2]);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds - 2);
        expect(await rockPaperScissors.scores(0)).to.equal(0);
        expect(await rockPaperScissors.scores(1)).to.equal(2);
    });
    it('3rd game play round #3', async() => {
        choice1 = eChoice.Paper;
        const secretChoice1 = getSecretChoice(choice1);
        random1 = secretChoice1.random;
        choice2 = eChoice.Scissors;
        const secretChoice2 = getSecretChoice(choice2);
        random2 = secretChoice2.random;
        expect(await playRound(account2, account3, secretChoice1.secret, secretChoice2.secret))
            .to.emit(rockPaperScissors, 'onRoundEnded').withArgs([choice1, choice2], account3Addr, [0, 3])
            .to.emit(rockPaperScissors, 'onGameEnded').withArgs([0, 3])
            .to.emit(rockPaperScissors, 'onStatusChanged').withArgs(eGameStatus.Initialized);
        expect(await rockPaperScissors.remainingRounds()).to.equal(nbRounds);
    });


})