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

async function deployContracts(args = undefined) {
    const TellorPlayground = await hre.ethers.getContractFactory("TellorPlayground");
    const tellor = await TellorPlayground.deploy();
    await tellor.deployed();

    const SubscriptionChecker = await hre.ethers.getContractFactory("SubscriptionChecker");
    // params = [];
    // console.log(args);
    // if (args && args.subscriptionChecker) {
    //     params = args.subscriptionChecker;
    // }
    const subscriptionChecker = await SubscriptionChecker.deploy(tellor.address);
    await subscriptionChecker.deployed();
    return { tellor, subscriptionChecker };
}


module.exports = {
    revertMessage,
    getBalanceAsNumber,
    deployContracts
}