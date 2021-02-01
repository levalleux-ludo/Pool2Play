const { deployContract } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { getContractFactory } = require("hardhat/types");

function revertMessage(error) {
    return 'VM Exception while processing transaction: revert ' + error;
}

function getBalanceAsNumber(bn, decimals, accuracy) {
    const r1 = ethers.BigNumber.from(10).pow(decimals - accuracy);
    const r2 = bn.div(r1);
    const r3 = r2.toNumber();
    const r4 = r3 / (10 ** accuracy);
    return r4;
}

async function deployContractsB1(args = undefined) {
    let params;
    params = [];
    if (args && args.aToken) {
        params = args.aToken;
    }
    const AToken = await hre.ethers.getContractFactory("AToken");
    const aToken = await AToken.deploy(...params);
    await aToken.deployed();

    return { aToken };


}

async function deployContracts(args = undefined) {
    const { aToken } = await deployContractsB1(args);
    // add aToken.address in first position of subscriptionChecker args
    args.subscriptionChecker = [aToken.address, ...args.subscriptionChecker];
    const { tellor, subscriptionChecker, gameMaster } = await deployContractsB2(args);
    return { aToken, tellor, subscriptionChecker, gameMaster };
}

async function deployContractsB2(args = undefined) {
    let params;
    params = [];

    const TellorPlayground = await hre.ethers.getContractFactory("TellorPlayground");
    const tellor = await TellorPlayground.deploy();
    await tellor.deployed();

    const SubscriptionChecker = await hre.ethers.getContractFactory("SubscriptionChecker");
    params = [];
    if (args && args.subscriptionChecker) {
        params = args.subscriptionChecker;
    }
    const subscriptionChecker = await SubscriptionChecker.deploy(tellor.address, ...params);
    await subscriptionChecker.deployed();
    await tellor.faucet(subscriptionChecker.address);

    const GameMaster = await hre.ethers.getContractFactory("GameMaster");
    const gameMaster = await GameMaster.deploy(subscriptionChecker.address);
    await gameMaster.deployed();

    await subscriptionChecker.transferOwnership(gameMaster.address);

    return { tellor, subscriptionChecker, gameMaster };


}

async function computeParamsHash(contract, account) {
    const params = await ethers.utils.defaultAbiCoder.encode([{ type: 'address' }, { type: 'address' }], [contract, account]);
    // const params = await ethers.utils.defaultAbiCoder.encode('tuple(address contract, address account)', { contract, account });
    console.log('params', params);
    const paramsHash = await ethers.utils.keccak256(params);
    console.log('paramsHash', paramsHash);
    return paramsHash;
}


module.exports = {
    revertMessage,
    getBalanceAsNumber,
    deployContracts,
    deployContractsB1,
    deployContractsB2,
    computeParamsHash
}