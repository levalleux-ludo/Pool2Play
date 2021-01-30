const bre = require("hardhat");

const portis_accounts = [
    '0x8dC20b2258965057Fe0bBd28D254d14981485adD',
    '0xb73B54445a5d3D7bCD3CCfcd41b01E6B335B45E1',
    '0x34Cf7a6646cf713AdB2cc8081534fd640C782b67',
    '0xC7f18C455bC926297C0B49D32942486F2f21d955',
    '0x267902d1A5CEf87E7e4FB91143c6E7ebA4E6b255'
]

async function main() {
    [addr0, addr1, addr2] = await ethers.getSigners();
    const addr1Address = await addr1.getAddress();
    const balance1 = await addr1.provider.getBalance(addr1Address);
    console.log('addr1Address', addr1Address, balance1.toString());
    for (let to of portis_accounts) {
        let balance_to = await addr1.provider.getBalance(to);
        console.log('to', to, balance_to.toString());
        await addr1.sendTransaction({ to, value: ethers.constants.WeiPerEther }).then(async(response) => {
            console.log('response', response);
            await response.wait().then(async(receipt) => {
                console.log('receipt', receipt);
                balance_to = await addr1.provider.getBalance(to);
                console.log('to', to, balance_to.toString());
            })
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });