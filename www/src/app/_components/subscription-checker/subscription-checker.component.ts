import { BlockchainService } from './../../_services/blockchain.service';
import { SubscriptionCheckerContractService } from './../../_services/subscription-checker-contract.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscription-checker',
  templateUrl: './subscription-checker.component.html',
  styleUrls: ['./subscription-checker.component.scss']
})
export class SubscriptionCheckerComponent implements OnInit {

  connected = false;
  address;
  requestId = 123456789;
  subscribedToken;

  constructor(
    private subscriptionCheckerContract: SubscriptionCheckerContractService,
    private blockchainService: BlockchainService
  ) { }

  ngOnInit(): void {
    this.subscriptionCheckerContract.connected.subscribe((connected) => {
      this.refresh(connected);
    });

  }

  async refresh(connected: boolean) {
    this.connected = connected;
    if (connected) {
      this.address = this.subscriptionCheckerContract.address;
      this.subscribedToken = await this.subscriptionCheckerContract.subscribedToken();
    } else {
      this.address = undefined;
    }
  }



}
