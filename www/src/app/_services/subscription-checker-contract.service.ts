import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { BlockchainService } from './blockchain.service';
import subscriptionCheckerJSON from '../../../../contracts/artifacts/contracts/SubscriptionChecker.sol/SubscriptionChecker.json';
import addresses from '../../../../contracts/contracts/addresses.json';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionCheckerContractService {

  address: string;
  contract: any;

  connected = new BehaviorSubject<boolean>(false);

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

  async connect(address: string) {
    this.contract = new this.web3.eth.Contract(subscriptionCheckerJSON.abi as any, address);
    this.address = address;
    this.connected.next(true);
  }

  disconnect() {
    this.connected.next(false);
    this.contract = undefined;
    this.address = undefined;
  }

  async subscribedToken(): Promise<string> {
    return this.contract.methods.subscribedToken().call();
  }

}
