import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { BlockchainService } from './blockchain.service';
import subscriptionCheckerJSON from '../../../../contracts/artifacts/contracts/SubscriptionChecker.sol/SubscriptionChecker.json';
import addresses from '../../../../contracts/contracts/addresses.json';
import { BigNumber } from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionCheckerContractService {

  address: string;
  contract: any;
  subscriptions = [];

  connected = new BehaviorSubject<boolean>(false);
  onCheck = new Subject<any>();

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService

  ) {
    this.blockchainService.connectionStatus.subscribe((status) => {
      if (status.connected) {
        const address = addresses.subscriptionChecker[status.chainId];
        if (address) {
          this.connect(address);
        } else {
          throw new Error('Unable to find address for contract subscriptionChecker on chain ' + status.chainId);
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
    this.contract = new this.web3.eth.Contract(subscriptionCheckerJSON.abi as any, address);
    this.address = address;
    this.subscriptions.push(this.contract.events.Check({}, (error, event) => {
      if (error) {
        console.error(error);
      } else {
        console.log('SubscriptionChecker receives event Check', JSON.stringify(event));
        const account = event.returnValues.account;
        const forceTip = event.returnValues.forceTip;
        const lastTimestamp = event.returnValues.lastTimestamp;
        const didGet = event.returnValues.didGet;
        const timestamp = event.returnValues.timestamp;
        const subscriptionBalance = event.returnValues.subscriptionBalance;
        const tipAdded = event.returnValues.tipAdded;
        console.log('SubscriptionChecker receives event Check', account, forceTip, lastTimestamp.toString(), didGet, timestamp.toString(), subscriptionBalance.toString(), tipAdded);
        this.onCheck.next({account, forceTip, lastTimestamp, didGet, timestamp, subscriptionBalance, tipAdded});
      }
    }));
    this.connected.next(true);
  }

  disconnect() {
    this.connected.next(false);
    this.contract = undefined;
    this.address = undefined;
    for(const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
  }

  async subscribedToken(): Promise<string> {
    return this.contract.methods.subscribedToken().call();
  }

  async threshold(): Promise<BigNumber> {
    return new Promise<BigNumber>((resolve, reject) => {
      this.contract.methods.threshold().call().then((threshold) => {
        resolve(new BigNumber(threshold));
      }).catch(reject);
    })
  }


}
