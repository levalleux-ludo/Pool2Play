import { BehaviorSubject } from 'rxjs';
import { BlockchainService } from './blockchain.service';
import { Inject, Injectable } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import gameMasterJSON from '../../../../contracts/artifacts/contracts/GameMaster.sol/GameMaster.json';
import addresses from '../../../../contracts/contracts/addresses.json';
import BigNumber from 'bignumber.js';
import { Web3SubscriberService, Subscription } from './web3-subscriber.service';

export enum ePlayerStatus {
  Unregistered = 0,
  Pending = 1,
  Registered = 2
}

export const PlayerStatus = Object.keys(ePlayerStatus).map(key => ePlayerStatus[key]).filter(value => typeof value === 'string') as string[];

@Injectable({
  providedIn: 'root'
})
export class GameMasterContractService {
  address: string;
  contract: any;
  subscriptions = [];
  subscription: Subscription;

  connected = new BehaviorSubject<boolean>(false);
  myStatus = new BehaviorSubject<number | undefined>(undefined);

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService,
    private subscriberService: Web3SubscriberService
  ) {
    console.log('PlayerStatus', PlayerStatus);
    this.blockchainService.connectionStatus.subscribe((status) => {
      if (status.connected) {
        console.log('GameMasterContractService onBlockchain connection', status);
        const address = addresses.gameMaster[status.chainId];
        if (address) {
          this.connect(address);
        } else {
          console.warn('Unable to find address for contract gameMaster on chain ' + status.chainId);
          this.disconnect();
        }
      } else {
        this.disconnect();
      }
    })
  }

  async connect(address: string) {
    if (this.contract) {
      this.disconnect();
    }
    this.contract = new this.web3.eth.Contract(gameMasterJSON.abi as any, address);
    this.address = address;
    await this.subscriberService.addContract('GameMaster', address, gameMasterJSON.abi);
    this.subscription = this.subscriberService.addSubscription(address, (event) => {
      console.log('GameMaster: receive event', event);
      switch (event.name) {
        case 'PlayerStatusChanged': {
          console.log('GameMaster receive event PlayerStatusChanged', JSON.stringify(event));
          if (event.returnValues.player.toLowerCase() === this.blockchainService.status.account.toLowerCase()) {
            const newStatus = parseInt(event.returnValues.status.toString());
            this.myStatus.next(ePlayerStatus[PlayerStatus[newStatus]]);
          }
          break;
        }
        default: {
          console.log('GameMaster: ignore event', event.name);
          break;
        }
      }
    });
    // this.subscriptions.push(this.contract.events.PlayerStatusChanged({}, (error, event) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log('Game Master receive event', JSON.stringify(event));
    //     if (event.returnValues.player.toLowerCase() === this.blockchainService.status.account.toLowerCase()) {
    //       const newStatus = parseInt(event.returnValues.status.toString());
    //       this.myStatus.next(ePlayerStatus[PlayerStatus[newStatus]]);
    //     }
    //   }
    // }));
    this.connected.next(true);
    const status = await this.playerStatus(this.blockchainService.status.account);
    this.myStatus.next(status);
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.connected.next(false);
    this.contract = undefined;
    this.address = undefined;
    for(const subscription of this.subscriptions) {
      console.log('unsubscribe from contract event', subscription);
      subscription.unsubscribe(function(error, success){
        if(success)
            console.log('Successfully unsubscribed!');
    });
    }
    this.subscriptions = [];
  }

  public playerStatus(player: string): Promise<ePlayerStatus> {
    return new Promise<ePlayerStatus>((resolve, reject) => {
      this.contract.methods.playerStatus(player).call().then((playerStatus: string) => {
        resolve(ePlayerStatus[PlayerStatus[+playerStatus]]);
      }).catch(reject);
    });
  }

  public async register() {
    return new Promise<void>(async (resolve, reject) => {
      // this.myStatus.next(ePlayerStatus.Pending);
      this.contract.methods.register().send({from: this.blockchainService.status.account})
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

  public async check() {
    return new Promise<void>(async (resolve, reject) => {
      this.contract.methods.check().send({from: this.blockchainService.status.account})
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
}
