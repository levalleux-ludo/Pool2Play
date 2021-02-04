import { Web3Provider } from './web3.provider';
import { BigNumber } from "bignumber.js";
import { Web3Contract } from "./web3.contract";
import subscriptionCheckerABI from '../../../contracts/artifacts/contracts/SubscriptionChecker.sol/SubscriptionChecker.json';

export class SubscriptionCheckerContract extends Web3Contract {
    public constructor(address: string, web3Provider: Web3Provider, account: string) {
        super(address, (subscriptionCheckerABI as any).abi, web3Provider.web3, account);
    }
    public threshold(): Promise<BigNumber> {
        return this.contract.methods.threshold().call();
    }
    public setThreshold(threshold: BigNumber): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.contract.methods.setThreshold(threshold).send({from: this.account})
            .once('receipt', (receipt: any) => {
              console.log(receipt);
            })
            .once('transactionHash', (txHash: string) => {
              console.log(txHash);
            })
            .once('confirmation', (nbConfirmations: number, receipt: any) => {
              resolve();
            })
            .once('error', (error: any, receipt: any) => {
              console.error(error);
              console.error(receipt);
              reject(error);
            })
          });
    
    }

}