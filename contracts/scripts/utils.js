const { deployContract } = require("ethereum-waffle");
const { ethers } = require("hardhat");

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
    const Greeter = await hre.ethers.getContractFactory("Greeter");
    params = [];
    console.log(args);
    if (args && args.Greeter) {
        params = args.Greeter;
    }
    const greeter = await Greeter.deploy(...params);
    await greeter.deployed();
    return [greeter];
}


module.exports = {
    revertMessage,
    getBalanceAsNumber,
    deployContracts
}