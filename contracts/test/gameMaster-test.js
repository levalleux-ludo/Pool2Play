const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts, computeParamsHash } = require("../scripts/utils");

let tellor, subscriptionChecker, gameMaster, aToken;
let deployer, account1, account2;
let deployerAddr, account1Addr, account2Addr;

const PlayerStatus = {
    Unregistered: 0,
    Pending: 1,
    Registered: 2
}

const requestId = 123456789;
const threshold = 15 * 60; // 15 min
const tipIncrement = ethers.BigNumber.from(10).pow(16); // 0.01 ETH
const aTokenPrice = ethers.constants.WeiPerEther.div(100); // 0.01 ETH

describe("gameMaster", function() {
    before('', async() => {
        [deployer, account1, account2] = await ethers.getSigners();
        deployerAddr = await deployer.getAddress();
        account1Addr = await account1.getAddress();
        account2Addr = await account2.getAddress();
        const contracts = await deployContracts({ aToken: [aTokenPrice], subscriptionChecker: [requestId, threshold, tipIncrement] });
        tellor = contracts.tellor;
        subscriptionChecker = contracts.subscriptionChecker;
        gameMaster = contracts.gameMaster;
        aToken = contracts.aToken;
    })
    it('Initial balance of SubscriptionChecker is not null', async() => {
        expect((await tellor.balanceOf(subscriptionChecker.address)).gt(0)).to.be.true;
    });
    it('Player 1 is not registered', async() => {
        expect(await gameMaster.playerStatus(account1Addr)).to.eq(PlayerStatus.Unregistered);
    });
    it('Player 1 registering and pending', async() => {
        const balanceBefore = await tellor.balanceOf(subscriptionChecker.address);
        const paramsHash = await computeParamsHash(aToken.address, account1Addr);
        expect(await gameMaster.connect(account1).register())
            .to.emit(tellor, 'TipAdded').withArgs(subscriptionChecker.address, requestId, paramsHash, tipIncrement)
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account1Addr, PlayerStatus.Pending);
        expect(await gameMaster.playerStatus(account1Addr)).to.eq(PlayerStatus.Pending);
        const balanceAfter = await tellor.balanceOf(subscriptionChecker.address);
        expect(balanceBefore.sub(balanceAfter).eq(tipIncrement)).to.be.true;
    });
    it('Player 1 call register a 2nd time', async() => {
        expect(await gameMaster.connect(account1).register())
            .to.not.emit(tellor, 'TipAdded')
            .to.not.emit(gameMaster, 'PlayerStatusChanged');
        expect(await gameMaster.playerStatus(account1Addr)).to.eq(PlayerStatus.Pending);
    });
    it('Oracle set null value for Player 1', async() => {
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const paramsHash = await computeParamsHash(aToken.address, account1Addr);
        expect(await tellor.submitValue(requestId, paramsHash, 0))
            .to.emit(tellor, 'NewValue');
    });
    it('Player 1 call register a 3rd time', async() => {
        expect(await gameMaster.connect(account1).register())
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account1Addr, PlayerStatus.Unregistered)
            .to.not.emit(tellor, 'TipAdded');
        expect(await gameMaster.playerStatus(account1Addr)).to.eq(PlayerStatus.Unregistered);
    });
    it('Player 2 registering and pending', async() => {
        const balanceBefore = await tellor.balanceOf(subscriptionChecker.address);
        const paramsHash = await computeParamsHash(aToken.address, account2Addr);
        expect(await gameMaster.connect(account2).register())
            .to.emit(tellor, 'TipAdded').withArgs(subscriptionChecker.address, requestId, paramsHash, tipIncrement)
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account2Addr, PlayerStatus.Pending);
        expect(await gameMaster.playerStatus(account2Addr)).to.eq(PlayerStatus.Pending);
        const balanceAfter = await tellor.balanceOf(subscriptionChecker.address);
        expect(balanceBefore.sub(balanceAfter).eq(tipIncrement)).to.be.true;
    });
    it('Oracle set positive value for Player 2', async() => {
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const paramsHash = await computeParamsHash(aToken.address, account2Addr);
        expect(await tellor.submitValue(requestId, paramsHash, 1))
            .to.emit(tellor, 'NewValue');
    });
    it('Player 2 call register a 2nd time and is being registered', async() => {
        expect(await gameMaster.connect(account2).register())
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account2Addr, PlayerStatus.Registered)
            .to.not.emit(tellor, 'TipAdded');
        expect(await gameMaster.playerStatus(account2Addr)).to.eq(PlayerStatus.Registered);
    });

});

let RockPaperScissorsFactory;
let rpsGame1, rpsGame2;
let account3, account4;
let account3Addr, account4Addr;

describe('GameMaster and RockPaperScissors', async() => {
    before('', async() => {
        RockPaperScissorsFactory = await ethers.getContractFactory('RockPaperScissors');
        [deployer, account1, account2, account3, account4] = await ethers.getSigners();
        deployerAddr = await deployer.getAddress();
        account1Addr = await account1.getAddress();
        account2Addr = await account2.getAddress();
        account3Addr = await account3.getAddress();
        account4Addr = await account4.getAddress();
        const contracts = await deployContracts({ aToken: [aTokenPrice], subscriptionChecker: [requestId, threshold, tipIncrement] });
        tellor = contracts.tellor;
        subscriptionChecker = contracts.subscriptionChecker;
        gameMaster = contracts.gameMaster;
        aToken = contracts.aToken;
    });
    it('Player1 registering', async() => {
        expect(await gameMaster.connect(account1).register())
            .to.emit(tellor, 'TipAdded');
        expect(await gameMaster.playerStatus(account1Addr)).to.eq(PlayerStatus.Pending);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const paramsHash = await computeParamsHash(aToken.address, account1Addr);
        expect(await tellor.submitValue(requestId, paramsHash, 1));
        expect(await gameMaster.connect(account1).register())
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account1Addr, PlayerStatus.Registered)
            .to.emit(gameMaster, 'OnRegistered');
        const nbRpsGame = await gameMaster.getNbGames();
        expect(nbRpsGame.eq(1)).to.be.true;
        const rpsGameAddress = await gameMaster.getGameAt(nbRpsGame - 1);
        rpsGame1 = RockPaperScissorsFactory.attach(rpsGameAddress);
        await rpsGame1.deployed();
        expect(await rpsGame1.players(0)).to.equal(account1Addr);
    });
    it('Player2 registering', async() => {
        expect(await gameMaster.connect(account2).register())
            .to.emit(tellor, 'TipAdded');
        expect(await gameMaster.playerStatus(account2Addr)).to.eq(PlayerStatus.Pending);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const paramsHash = await computeParamsHash(aToken.address, account2Addr);
        expect(await tellor.submitValue(requestId, paramsHash, 1));
        expect(await gameMaster.connect(account2).register())
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account2Addr, PlayerStatus.Registered)
            .to.emit(gameMaster, 'OnRegistered').withArgs(account2Addr, rpsGame1.address);
        expect(await rpsGame1.players(1)).to.equal(account2Addr);
    });
    it('Player3 registering', async() => {
        expect(await gameMaster.connect(account3).register())
            .to.emit(tellor, 'TipAdded');
        expect(await gameMaster.playerStatus(account3Addr)).to.eq(PlayerStatus.Pending);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const paramsHash = await computeParamsHash(aToken.address, account3Addr);
        expect(await tellor.submitValue(requestId, paramsHash, 1));
        expect(await gameMaster.connect(account3).register())
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account3Addr, PlayerStatus.Registered)
            .to.emit(gameMaster, 'OnRegistered');
        const nbRpsGame = await gameMaster.getNbGames();
        expect(nbRpsGame.eq(2)).to.be.true;
        const rpsGameAddress = await gameMaster.getGameAt(nbRpsGame - 1);
        rpsGame2 = RockPaperScissorsFactory.attach(rpsGameAddress);
        await rpsGame2.deployed();
        expect(await rpsGame2.players(0)).to.equal(account3Addr);
    });
    it('Player4 registering', async() => {
        expect(await gameMaster.connect(account4).register())
            .to.emit(tellor, 'TipAdded');
        expect(await gameMaster.playerStatus(account4Addr)).to.eq(PlayerStatus.Pending);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const paramsHash = await computeParamsHash(aToken.address, account4Addr);
        expect(await tellor.submitValue(requestId, paramsHash, 1));
        expect(await gameMaster.connect(account4).register())
            .to.emit(gameMaster, 'PlayerStatusChanged').withArgs(account4Addr, PlayerStatus.Registered)
            .to.emit(gameMaster, 'OnRegistered').withArgs(account4Addr, rpsGame2.address);
        expect(await rpsGame2.players(1)).to.equal(account4Addr);
    });

});