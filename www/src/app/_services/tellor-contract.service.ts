import { Web3SubscriberService, Subscription } from './web3-subscriber.service';
import { BigNumber } from 'bignumber.js';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { BlockchainService } from './blockchain.service';
import tellorJSON from '../../../../contracts/artifacts/contracts/usingtellor/TellorPlayground.sol/TellorPlayground.json';
import addresses from '../../../../contracts/contracts/addresses.json';

@Injectable({
  providedIn: 'root'
})
export class TellorContractService {

  address: string;
  contract: any;
  subscriptions = [];
  subscription: Subscription;

  connected = new BehaviorSubject<boolean>(false);

  tipAdded = new Subject<any>();
  newValue = new Subject<any>();
  onTransfer = new Subject<any>();

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService,
    private subscriberService: Web3SubscriberService

  ) {
    this.blockchainService.connectionStatus.subscribe((status) => {
      if (status.connected) {
        console.log('TellorContractService onBlockchain connection', status);
        const address = addresses.tellor[status.chainId];
        if (address) {
          this.connect(address);
        } else {
          console.warn('Unable to find address for contract tellor on chain ' + status.chainId);
          this.disconnect();
        }
      } else {
        this.disconnect();
      }
    })

  }

  public get isConnected(): boolean {
    return this.contract !== undefined;
  }

  async connect(address: string) {
    if (this.contract) {
      this.disconnect();
    }
    this.contract = new this.web3.eth.Contract(tellorJSON.abi as any, address);
    this.address = address;
    await this.subscriberService.addContract('TellorPlayground', address, tellorJSON.abi);
    this.subscription = this.subscriberService.addSubscription(address, (event) => {
      console.log('Tellor: receive event', event);
      switch (event.name) {
        case 'TipAdded': {
          console.log('Tellor receive event TipAdded', JSON.stringify(event));
          const reqId = event.returnValues._requestId;
          const paramsHash = event.returnValues._paramsHash;
          const tip = event.returnValues._tip;
          console.log('Tellor receive event TipAdded', reqId.toString(), paramsHash, tip.toString());
          this.tipAdded.next({reqId, paramsHash, tip});
          break;
        }
        case 'NewValue': {
          console.log('Tellor receive event NewValue', JSON.stringify(event));
          const reqId = event.returnValues._requestId;
          const paramsHash = event.returnValues._paramsHash;
          const time = event.returnValues._time;
          const value = event.returnValues._value;
          console.log('Tellor receive event NewValue', reqId.toString(), paramsHash, time.toString(), value.toString());
          this.newValue.next({reqId, paramsHash, time, value});
          break;
        }
        case 'Transfer': {
          console.log('Tellor receive event Transfer', JSON.stringify(event));
          const sender = event.returnValues.from;
          const recipient = event.returnValues.to;
          const amount = event.returnValues.value;
          console.log('Tellor receive event Transfer', sender, recipient, amount.toString());
          this.onTransfer.next({sender, recipient, amount});
          break;
        }
        default: {
          console.log('Tellor: ignore event', event.name);
          break;
        }
      }
    });


    // this.subscriptions.push(this.contract.events.TipAdded({}, (error, event) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log('Tellor receive event TipAdded', JSON.stringify(event));
    //     const reqId = event.returnValues._requestId;
    //     const paramsHash = event.returnValues._paramsHash;
    //     const tip = event.returnValues._tip;
    //     console.log('Tellor receive event TipAdded', reqId.toString(), paramsHash, tip.toString());
    //     this.tipAdded.next({reqId, paramsHash, tip});
    //   }
    // }));
    // this.subscriptions.push(this.contract.events.NewValue({}, (error, event) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log('Tellor receive event NewValue', JSON.stringify(event));
    //     const reqId = event.returnValues._requestId;
    //     const paramsHash = event.returnValues._paramsHash;
    //     const time = event.returnValues._time;
    //     const value = event.returnValues._value;
    //     console.log('Tellor receive event NewValue', reqId.toString(), paramsHash, time.toString(), value.toString());
    //     this.newValue.next({reqId, paramsHash, time, value});
    //   }
    // }));
    // this.subscriptions.push(this.contract.events.Transfer({}, (error, event) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log('Tellor receive event Transfer', JSON.stringify(event));
    //     const sender = event.returnValues.from;
    //     const recipient = event.returnValues.to;
    //     const amount = event.returnValues.value;
    //     console.log('Tellor receive event Transfer', sender, recipient, amount.toString());
    //     this.onTransfer.next({sender, recipient, amount});
    //   }
    // }));
    this.connected.next(true);
  }

  disconnect() {
    //TODO: remove contract from subscriber service
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.contract !== undefined) {
      this.connected.next(false);
      this.contract = undefined;
      this.address = undefined;
    }
    for(const subscription of this.subscriptions) {
      subscription.unsubscribe(function(error, success){
        if(success)
            console.log('Successfully unsubscribed!');
    });
    }
    this.subscriptions = [];
  }

  public computeParamsHash(subscribedToken: string, account: string): string {
    const data = this.web3.eth.abi.encodeParameters(
      ['address', 'address'],
      [subscribedToken, account]
    );
    console.log('data encoded', data);
    const hash1 = this.web3.utils.sha3(data);
    console.log('hash1', hash1);
    const hash2 = this.web3.utils.soliditySha3({type: 'address', value: subscribedToken}, {type: 'address', value: account});
    console.log('hash2', hash2);
      return hash1;
  }

  async getParams(paramsHash: string): Promise<{subscribedToken: string, account: string}> {
    return new Promise<{subscribedToken: string, account: string}>((resolve, reject) => {
      this.contract.methods.getParams(paramsHash).call().then((params) => {
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

  async submitValue(requestId: BigNumber, paramsHash: string, value: BigNumber) {
      return new Promise<void>(async (resolve, reject) => {
        this.contract.methods.submitValue(requestId, paramsHash, value).send({from: this.blockchainService.status.account})
        .once('receipt', receipt => {
          console.log(receipt);
        })
        .once('transactionHash', txHash => {
          console.log(txHash);
        })
        .once('confirmation', (nbConfirmaton, receipt) => {
          resolve();
        })
        .once('error', (error, receipt) => {
          console.error(error);
          console.error(receipt);
          reject(error);
        })
      });

  }

  public name(): Promise<string> {
    return this.contract.methods.name().call();
  }

  public symbol(): Promise<string> {
    return this.contract.methods.symbol().call();
  }

  public decimals(): Promise<number> {
    return this.contract.methods.decimals().call();
  }


  public balanceOf(account: string): Promise<BigNumber> {
    return new Promise<BigNumber>((resolve, reject) => {
      this.contract.methods.balanceOf(account).call().then((bal) => {
        resolve(new BigNumber(bal));
      }).catch(reject);
    })
  }


}
