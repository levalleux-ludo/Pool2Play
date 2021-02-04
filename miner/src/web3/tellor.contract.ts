import { ContractInterface, ethers } from 'ethers';
import { Web3Provider } from './web3.provider';
import { BigNumber } from "bignumber.js";
import { Web3Contract } from "./web3.contract";
import tellorABI from '../../../contracts/artifacts/contracts/usingtellor/TellorPlayground.sol/TellorPlayground.json';
import Web3 from 'web3';

export interface ITellorContract {
  onTipAdded(callback: (reqId: BigNumber, paramsHash: string, tip: BigNumber) => void): void;
  getParams(paramsHash: string): Promise<{subscribedToken: string, account: string}>;
  submitValue(requestId: BigNumber, paramsHash: string, value: BigNumber): Promise<void>;
}

export class TellorContractE implements ITellorContract {
  protected contract: ethers.Contract;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, (tellorABI as any).abi, signerOrProvider);
  }

  public onTipAdded(callback: (reqId: BigNumber, paramsHash: string, tip: BigNumber) => void) {
    this.contract.on('TipAdded', (sender: string, reqId_e: ethers.BigNumber, paramsHash: string, tip_e: ethers.BigNumber) => {
      const reqId = new BigNumber(reqId_e.toString());
      const tip = new BigNumber(tip_e.toString());
      console.log('Tellor receive event TipAdded', reqId.toString(), paramsHash, tip.toString());
      callback(reqId, paramsHash, tip);
    });
  }

  async getParams(paramsHash: string): Promise<{subscribedToken: string, account: string}> {
    return new Promise<{subscribedToken: string, account: string}>((resolve, reject) => {
      this.contract.getParams(paramsHash).then((params: string) => {
        console.log("getParams", params);
        
        const decoded = ethers.utils.defaultAbiCoder.decode(
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

  public submitValue(requestId: BigNumber, paramsHash: string, value: BigNumber): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const requestId_e = ethers.BigNumber.from(requestId.toString());
      const value_e = ethers.BigNumber.from(value.toString());
      this.contract.submitValue(requestId_e, paramsHash, value_e).then((response: any) => {
        console.log('TellorContract submitValue tx sent');
        response.wait().then(() => {
          resolve();
        }).catch((e: any) => {
          console.error(e);
          reject(e);
        });
      }).catch((e: any) => {
        console.error(e);
        reject(e);
      });
    });
  }

}

export class TellorContract extends Web3Contract implements ITellorContract {

    public constructor(address: string, web3Provider: Web3Provider, account: string) {
        super(address, (tellorABI as any).abi, web3Provider.wssWeb3 as Web3, account);
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