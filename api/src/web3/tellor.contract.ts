import { Web3Provider } from './web3.provider';
import { BigNumber } from "bignumber.js";
import { Web3Contract } from "./web3.contract";
import tellorABI from '../../../contracts/artifacts/contracts/usingtellor/TellorPlayground.sol/TellorPlayground.json';

export class TellorContract extends Web3Contract {

    public constructor(address: string, web3Provider: Web3Provider, account: string) {
        super(address, (tellorABI as any).abi, web3Provider.wssWeb3, account);
    }

    public onTipAdded(callback: (reqId: BigNumber, paramsHash: string, tip: BigNumber) => void) {
      this.contract.events.TipAdded({}, (error: any, event: any) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Tellor receive event TipAdded', JSON.stringify(event));
          const reqId = new BigNumber(event.returnValues._requestId);
          const paramsHash = event.returnValues._paramsHash;
          const tip = new BigNumber(event.returnValues._tip);
          console.log('Tellor receive event TipAdded', reqId.toString(), paramsHash, tip.toString());
          callback(reqId, paramsHash, tip);
        }
      });
    }

    async getParams(paramsHash: string): Promise<{subscribedToken: string, account: string}> {
      return new Promise<{subscribedToken: string, account: string}>((resolve, reject) => {
        this.contract.methods.getParams(paramsHash).call().then((params: string) => {
          console.log("getParams", params);
          const decoded = this.web3.eth.abi.decodeParameters(
            ['address', 'address'],
            params
          );
          const subscribedToken = decoded[0];
          const account = decoded[1];
          console.log('subscribedToken', subscribedToken, 'account', account);
          resolve({subscribedToken, account});
        }).catch(reject);
      });
    }
  
    // public getParams(paramsHash: string): Promise<any> {
    //   return this.contract.methods.getParams(paramsHash).call();
    // }

    public submitValue(requestId: BigNumber, paramsHash: string, value: BigNumber): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.contract.methods.submitValue(requestId, paramsHash, value).send({from: this.account})
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