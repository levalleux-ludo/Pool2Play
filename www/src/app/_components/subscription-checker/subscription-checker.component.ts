import { BlockchainService } from './../../_services/blockchain.service';
import { SubscriptionCheckerContractService } from './../../_services/subscription-checker-contract.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-checker',
  templateUrl: './subscription-checker.component.html',
  styleUrls: ['./subscription-checker.component.scss']
})
export class SubscriptionCheckerComponent implements OnInit, OnDestroy {

  connected = false;
  address;
  requestId = 123456789;
  subscribedToken;
  events = [];
  threshold;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private subscriptionCheckerContract: SubscriptionCheckerContractService,
    private blockchainService: BlockchainService
  ) { }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.subscriptionCheckerContract.connected
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((connected) => {
      this.refresh(connected);
    });
    this.subscriptionCheckerContract.onCheck
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((onCheck) => {
      this.events.push(`Receive Check event: ${JSON.stringify(onCheck)}`);
    });

  }

  async refresh(connected: boolean) {
    this.connected = connected;
    if (connected) {
      this.address = this.subscriptionCheckerContract.address;
      this.subscribedToken = await this.subscriptionCheckerContract.subscribedToken();
      const threshold_bn = await this.subscriptionCheckerContract.threshold();
      const threshold_min_bn = threshold_bn.div(60).integerValue(BigNumber.ROUND_DOWN);
      this.threshold = `${threshold_min_bn.toString()}'${threshold_bn.minus(threshold_min_bn.multipliedBy(60))}''`;
    } else {
      this.address = undefined;
    }
  }



}
