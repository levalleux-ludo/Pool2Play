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

describe("playground", function() {
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
    });
    it('playground', async() => {
        const params = await ethers.utils.defaultAbiCoder.encode([{ type: 'address' }, { type: 'address' }], [aToken.address, account1Addr]);
        await tellor.addParams(requestId, params);
        const paramsHash = computeParamsHash(aToken.address, account1Addr);
        const data = await tellor.getParams(paramsHash);
        console.log('data', data);
        const data2 = await tellor.reqParams(paramsHash);
        console.log('data2', data2);
        expect(data2).to.equal(params);

        const extracted = await ethers.utils.defaultAbiCoder.decode([{ type: 'address' }, { type: 'address' }], data2);
        console.log('extracted', extracted);
        expect(extracted.length).to.equal(2);
        expect(extracted[0]).to.equal(aToken.address);
        expect(extracted[1]).to.equal(account1Addr);
    })

});