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
  threshold;

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
      const threshold_bn = await this.subscriptionCheckerContract.threshold();
      const threshold_min_bn = threshold_bn.div(60).integerValue();
      this.threshold = `${threshold_min_bn.toString()}'${threshold_bn.minus(threshold_min_bn.multipliedBy(60))}''`;
    } else {
      this.address = undefined;
    }
  }



}
