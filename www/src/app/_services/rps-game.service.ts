import { RSPGame } from 'src/app/_services/rpsGame';
import { Inject, Injectable } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { BlockchainService } from './blockchain.service';
import { Web3SubscriberService } from './web3-subscriber.service';

@Injectable({
  providedIn: 'root'
})
export class RpsGameService {

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService,
    private subscriberService: Web3SubscriberService
  ) { }

  createContract() {
    return new RSPGame(this.web3, this.blockchainService, this.subscriberService);
  }
}
