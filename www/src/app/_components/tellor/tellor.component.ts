import { SubscriptionCheckerContractService } from './../../_services/subscription-checker-contract.service';
import { BlockchainService } from './../../_services/blockchain.service';
import { TellorContractService } from './../../_services/tellor-contract.service';
import { Component, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-tellor',
  templateUrl: './tellor.component.html',
  styleUrls: ['./tellor.component.scss']
})
export class TellorComponent implements OnInit {

  connected = false;
  address;
  events = [];
  requestId = 123456789;
  waiting = false;
  submittingValue = false;

  constructor(
    private tellorContract: TellorContractService,
    private blockchainService: BlockchainService,
    private subscriptionCheckerContract: SubscriptionCheckerContractService

  ) { }

  ngOnInit(): void {
    this.tellorContract.connected.subscribe((connected) => {
      this.refresh(connected);
    });
    this.tellorContract.newValue.subscribe((newValue) => {
      this.events.push(`Receive NewValue event: ${JSON.stringify(newValue)}`);
    });
    this.tellorContract.tipAdded.subscribe((tipAdded) => {
      this.events.push(`Receive TipAdded event: ${JSON.stringify(tipAdded)}`);
    });
  }

  async refresh(connected: boolean) {
    this.connected = connected;
    if (connected) {
      this.address = this.tellorContract.address;
    } else {
      this.address = undefined;
    }
  }

  async submitValue(value: number) {
    this.waiting = true;
    const subscribedToken = await this.subscriptionCheckerContract.subscribedToken();
    const account = this.blockchainService.status.account;
    const paramsHash = this.tellorContract.computeParamsHash(subscribedToken, account);
    this.tellorContract.getParams(paramsHash).then((params) => {
      console.log("getParams", params);
      this.tellorContract.submitValue(new BigNumber(this.requestId), paramsHash, new BigNumber(value))
      .finally(() => {
        this.waiting = false;
        this.submittingValue = false;
      })
    }).catch(e => {
      console.error(e);
      this.waiting = false;
      this.submittingValue = false;
    })
  }


}
