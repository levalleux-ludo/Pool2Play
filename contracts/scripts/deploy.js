// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
'use strict';
const fs = require('fs');
const hre = require("hardhat");
const { ethers } = require("hardhat");
const { getBalanceAsNumber, deployContracts } = require("./utils");
const addressesDataFile = './contracts/addresses.json';
let addressesData = {};
if (fs.existsSync(addressesDataFile)) {
    addressesData = JSON.parse(fs.readFileSync(addressesDataFile));
    console.log('Existing addresses file', JSON.stringify(addressesData));
}

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile 
    // manually to make sure everything is compiled
    // await hre.run('compile');

    console.log('Deploying on network', hre.network.name, hre.network.config);

    const [deployer] = await ethers.getSigners();
    const balance_before = await deployer.getBalance();
    console.log('Deployer address', await deployer.getAddress(), 'balance', getBalanceAsNumber(balance_before, 18, 4));

    // We get the contract to deploy
    const [greeter] = await deployContracts({ 'Greeter': ["Hello, world!", 12] });
    console.log("Greeter deployed to:", greeter.address);
    if (!addressesData['greeter']) {
        addressesData['greeter'] = {};
    }
    addressesData['greeter'][hre.network.config.chainId ? hre.network.config.chainId : hre.network.name] = greeter.address;

    fs.writeFileSync(addressesDataFile, JSON.stringify(addressesData));

    const balance_after = await deployer.getBalance();
    console.log('Paid fees', getBalanceAsNumber(balance_before.sub(balance_after), 18, 4), 'new balance', getBalanceAsNumber(balance_after, 18, 4));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });