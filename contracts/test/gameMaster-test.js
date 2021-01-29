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

describe("gameMaster", function() {
    before('', async() => {
        [deployer, account1, account2] = await ethers.getSigners();
        deployerAddr = await deployer.getAddress();
        account1Addr = await account1.getAddress();
        account2Addr = await account2.getAddress();
        const contracts = await deployContracts({ subscriptionChecker: [requestId, threshold, tipIncrement] });
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