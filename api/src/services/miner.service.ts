import { Web3Provider, Web3Providers } from './../web3/web3.provider';
import { ATokenContract } from './../web3/aToken.contract';
import { TellorContract } from './../web3/tellor.contract';
export class MinerService {
    constructor(
        private tellorContract: TellorContract
    ) {
        this.tellorContract.onTipAdded((reqId, paramsHash, tip) => {
            console.log('Miner: received TipAdded', reqId, paramsHash, tip);
            this.tellorContract.getParams(paramsHash).then(async ({subscribedToken, account}) => {
                const web3ProviderChain1 = Web3Providers.one;
                console.log('Miner: connecting subscribedToken contract at address', subscribedToken, 'on network', web3ProviderChain1.network.name);
                const aTokenContract = new ATokenContract(subscribedToken, web3ProviderChain1)
                console.log('Miner: getting balance for account', account);
                const balance = await aTokenContract.balanceOf(account);
                console.log('Miner: submitting value for balance', balance.toString());
                this.tellorContract.submitValue(reqId, paramsHash, balance);
            })
        })
    }

}