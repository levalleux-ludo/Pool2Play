const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts, computeParamsHash } = require("../scripts/utils");

let tellor, subscriptionChecker, aToken;
let deployer, account1, account2;
let deployerAddr, account1Addr, account2Addr;

const requestId = 123456789;
const threshold = 15 * 60; // 15 min
const tipIncrement = ethers.BigNumber.from(10).pow(16); // 0.01 ETH
const aTokenPrice = ethers.constants.WeiPerEther.div(100); // 0.01 ETH

describe("subscriptionChecker", function() {
    before('', async() => {
        [deployer, account1, account2] = await ethers.getSigners();
        deployerAddr = await deployer.getAddress();
        account1Addr = await account1.getAddress();
        account2Addr = await account2.getAddress();
        const contracts = await deployContracts({ aToken: [aTokenPrice], subscriptionChecker: [requestId, threshold, tipIncrement] });
        tellor = contracts.tellor;
        subscriptionChecker = contracts.subscriptionChecker;
        aToken = contracts.aToken;
    })
    it("Current value shall not be available", async function() {
        const params = await ethers.utils.defaultAbiCoder.encode([{ type: 'address' }, { type: 'address' }], [aToken.address, account1Addr]);
        await tellor.addParams(requestId, params);
        const paramsHash = computeParamsHash(aToken.address, account1Addr);
        const ret = await subscriptionChecker.getCurrentValue(requestId, paramsHash);
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
    it('Current value shall be available', async() => {
        const val = 100;
        const paramsHash = computeParamsHash(aToken.address, account1Addr);
        await tellor.submitValue(requestId, paramsHash, val);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        // console.log('block', block);
        const ret = await subscriptionChecker.getCurrentValue(requestId, paramsHash);
        expect(ret.length).to.equal(3);
        expect(ret[0]).to.be.true;
        expect(ret[1].eq(val)).to.be.true;
        expect(ret[2].eq(block.timestamp)).to.be.true;
    });

});