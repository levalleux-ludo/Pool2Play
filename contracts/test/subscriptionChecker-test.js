const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../scripts/utils");

let tellor, subscriptionChecker;
let deployer, account1, account2;
let deployerAddr, account1Addr, account2Addr;

const requestId = 123456789;
const threshold = 15 * 60; // 15 min
const tipIncrement = ethers.BigNumber.from(10).pow(16); // 0.01 ETH

describe("subscriptionChecker", function() {
    before('', async() => {
        [deployer, account1, account2] = await ethers.getSigners();
        deployerAddr = await deployer.getAddress();
        account1Addr = await account1.getAddress();
        account2Addr = await account2.getAddress();
        const contracts = await deployContracts({ subscriptionChecker: [requestId, threshold, tipIncrement] });
        tellor = contracts.tellor;
        subscriptionChecker = contracts.subscriptionChecker;
    })
    it("Current value shall not be available", async function() {
        const ret = await subscriptionChecker.getCurrentValue(requestId);
        expect(ret.length).to.equal(3);
        expect(ret[0]).to.be.false;
    });
    it('Initial balance is null', async() => {
        expect((await tellor.balanceOf(account1Addr)).eq(0)).to.be.true;
    });
    it('faucet', async() => {
        await tellor.faucet(account1Addr);
        expect((await tellor.balanceOf(account1Addr)).gt(0)).to.be.true;
    });
    it('Current value shall not be available', async() => {
        const val = 100;
        await tellor.submitValue(requestId, val);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        // console.log('block', block);
        const ret = await subscriptionChecker.getCurrentValue(requestId);
        expect(ret.length).to.equal(3);
        expect(ret[0]).to.be.true;
        expect(ret[1].eq(val)).to.be.true;
        expect(ret[2].eq(block.timestamp)).to.be.true;
    });

});