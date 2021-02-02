import { Inject, Injectable } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { BlockchainService } from './blockchain.service';

type Callback = (event: {name: string, returnValues: any}) => void;
export class Subscription {
  constructor(private _contract: string, private _index: number, private _unsubscribe: () => void) {}
  public get contract(): string {
    return this._contract;
  }
  public get indexedDB(): number {
    return this._index;
  }
  public unsubscribe() {
    this._unsubscribe();
  }
}
@Injectable({
  providedIn: 'root'
})
export class Web3SubscriberService {

  callbacksParContract = new Map<string, Callback[]>();
  contractsName = new Map<string, string>();
  contractsEvents = new Map<string, Map<string, string>>();
  subscription;
  eventsTxHashes = new Map<string, string>();

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService
  ) {
    this.blockchainService.connectionStatus.subscribe((status) => {
      if (status.connected) {
        console.log('BlockchainService is connected');
        this.refreshFilter();
      } else {
        console.log('BlockchainService is disconnected');
        this.callbacksParContract = new Map<string, Callback[]>();
        this.refreshFilter();
      }
    })
  }

  public async addContract(name: string, address: string, abi: any) {
    console.log('Web3Subscriber: add contract', name, address);
    if (!this.callbacksParContract.has(address.toLowerCase())) {
      this.callbacksParContract.set(address.toLowerCase(), []);
    }
    if (!this.contractsName.has(address.toLowerCase())) {
      this.contractsName.set(address.toLowerCase(), name);
    }
    const eventsEntry = new Map<string, string>();
    for (const entry of abi) {
      if (entry.type === 'event') {
        const signature = `${entry.name}(${entry.inputs.map(input => input.type).join(',')})`;
        const hash = this.web3.utils.sha3(signature);
        eventsEntry.set(hash, entry);
      }
    }
    this.contractsEvents.set(address.toLowerCase(), eventsEntry);
    await this.refreshFilter();
  }

  public addSubscription(contract: string, callback: Callback): Subscription {
    const callbacks = this.callbacksParContract.get(contract.toLowerCase())
    if (!callbacks) {
      throw new Error('Contract unknown from subscriberService:' + contract);
    }
    const index = callbacks.length;
    console.log('Add callback to contract', this.contractsName.get(contract), contract, 'index', index);
    callbacks.push(callback);
    return new Subscription(contract, index, () => {
      console.log('unsubscribe from contract event', contract, index, callbacks.length);
      callbacks.splice(index, 1);
      console.log(callbacks.length);
    });
  }
  private async refreshFilter() {
    return new Promise<void>(async (resolve, reject) => {
      console.log('Web3Subscriber: refreshFilter');
      try {
        if (this.subscription) {

          this.subscription.unsubscribe((error, result) => {
            if (error) {
              reject(error);
            } else {
              console.log('clearSubscriptions', error, result);
            }
          });
          this.subscription = undefined;
        }
      } catch (e) {
        console.error(e);
      }
      const contractsFilter = Array.from(this.callbacksParContract.keys());
      if (contractsFilter.length > 0) {
        console.log('Web3Subscriber: subscribe to logs with filter', contractsFilter);
        this.subscription = this.web3.eth.subscribe('logs', {address: contractsFilter}, (error, result) => {
          if (!error) {
            console.log('event from contract', this.contractsName.get(result.address.toLowerCase()));
            console.log('transactionHash', result.transactionHash);
            console.log('topics', result.topics);
            const eventKey = result.transactionHash + result.topics[0];
            if (this.eventsTxHashes.has(eventKey)) {
              console.log('ignore this event (redondant)');
              return;
            }
            this.eventsTxHashes.set(eventKey, eventKey);
            console.log('data', result.data);
            const eventHash = result.topics[0];
            const eventEntry = this.contractsEvents.get(result.address.toLowerCase()).get(eventHash);
            if (!eventEntry) {
                console.error('cannot find event from hash ' + eventHash);
            } else {
                console.log(eventEntry);
                const decodedLog = this.web3.eth.abi.decodeLog((eventEntry as any).inputs, result.data, result.topics.slice(1));
                console.log('event', (eventEntry as any).name, 'decodedLog', decodedLog);
                const callbacks = this.callbacksParContract.get(result.address.toLowerCase());
                for(const callback of callbacks) {
                  callback({name: (eventEntry as any).name, returnValues: decodedLog});
                }

            }
            // TODO: use web3.eth.abi.decodeLog(inputs, data, topics), where inputs shall be read in contracts ABI for the given event
          } else {
            console.error(error);
          }
        });
      }
      resolve();
    })
  }
}
