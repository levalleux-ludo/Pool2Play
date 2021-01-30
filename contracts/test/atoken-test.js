const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
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

describe("aToken", function() {
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
    it('Initial totalsupply is null', async() => {
        expect((await aToken.totalSupply()).eq(0)).to.be.true;
    });
    it('Initial balance of account1 is null', async() => {
        expect((await aToken.balanceOf(account1Addr)).eq(0)).to.be.true;
    });
    it('check sToken.decimals', async() => {
        const decimals = await aToken.decimals();
        expect(decimals).to.equal(18);
    })
    it('check compute price', async() => {
        const amount = 15.5;
        const decimals = await aToken.decimals();
        const expected_price = aTokenPrice.mul(amount * 1000000).div(1000000);
        const amount_units = BigNumber.from(10).pow(decimals).mul(amount * 1000000).div(1000000);
        expect((await aToken.computePrice(amount_units)).toString()).to.equal(expected_price.toString())
    });
    it('account2 buys an amount of tokens', async() => {
        const ethBalanceBefore = await account2.getBalance();
        const aTokenBalanceBefore = await aToken.balanceOf(account2Addr);
        const amount = 15.5;
        const decimals = await aToken.decimals();
        const expected_price = aTokenPrice.mul(amount * 1000000).div(1000000);
        const amount_units = BigNumber.from(10).pow(decimals).mul(amount * 1000000).div(1000000);
        aToken.connect(account2).buy(amount_units, { value: expected_price, gasPrice: 0 });
        const ethBalanceAfter = await account2.getBalance();
        const aTokenBalanceAfter = await aToken.balanceOf(account2Addr);
        console.log('ethBalanceBefore', ethBalanceBefore.toString());
        console.log('ethBalanceAfter', ethBalanceAfter.toString());
        console.log('expected_price', expected_price.toString());
        console.log('ethBalanceBefore.sub(ethBalanceAfter)', ethBalanceBefore.sub(ethBalanceAfter).toString());

        expect(ethBalanceAfter.eq(ethBalanceBefore.sub(expected_price))).to.be.true;
        expect(aTokenBalanceAfter.eq(aTokenBalanceBefore.add(amount_units))).to.be.true;
        expect((await aToken.totalSupply()).eq(amount_units)).to.be.true;
    });
    it('account2 sells an amount of tokens', async() => {
        const supplyBefore = await aToken.totalSupply();
        const ethBalanceBefore = await account2.getBalance();
        const aTokenBalanceBefore = await aToken.balanceOf(account2Addr);
        const amount = 12.5;
        const decimals = await aToken.decimals();
        const expected_price = aTokenPrice.mul(amount * 1000000).div(1000000);
        const amount_units = BigNumber.from(10).pow(decimals).mul(amount * 1000000).div(1000000);
        aToken.connect(account2).sell(amount_units, { gasPrice: 0 });
        const ethBalanceAfter = await account2.getBalance();
        const aTokenBalanceAfter = await aToken.balanceOf(account2Addr);
        console.log('ethBalanceBefore', ethBalanceBefore.toString());
        console.log('ethBalanceAfter', ethBalanceAfter.toString());
        console.log('expected_price', expected_price.toString());
        console.log('ethBalanceBefore.sub(ethBalanceAfter)', ethBalanceBefore.sub(ethBalanceAfter).toString());

        expect(ethBalanceAfter.eq(ethBalanceBefore.add(expected_price))).to.be.true;
        expect(aTokenBalanceAfter.eq(aTokenBalanceBefore.sub(amount_units))).to.be.true;
        expect((await aToken.totalSupply()).eq(supplyBefore.sub(amount_units))).to.be.true;
    });

});