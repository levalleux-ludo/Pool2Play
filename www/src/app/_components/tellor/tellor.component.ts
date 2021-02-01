import { SubscriptionCheckerContractService } from './../../_services/subscription-checker-contract.service';
import { BlockchainService } from './../../_services/blockchain.service';
import { TellorContractService } from './../../_services/tellor-contract.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import addresses from '../../../../../contracts/contracts/addresses.json';

@Component({
  selector: 'app-tellor',
  templateUrl: './tellor.component.html',
  styleUrls: ['./tellor.component.scss']
})
export class TellorComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  connected = false;
  address;
  events = [];
  requestId = 123456789;
  waiting = false;
  submittingValue = false;
  subscriptionCheckerAddress;
  subscriptionCheckerBalance;
  decimals;
  symbol;

  constructor(
    private tellorContract: TellorContractService,
    private blockchainService: BlockchainService,
    private subscriptionCheckerContract: SubscriptionCheckerContractService

  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  ngOnInit(): void {
    this.tellorContract.connected
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((connected) => {
      this.refresh(connected);
    });
    this.tellorContract.newValue
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((newValue) => {
      this.events.push(`Receive NewValue event: ${JSON.stringify(newValue)}`);
    });
    this.tellorContract.tipAdded
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((tipAdded) => {
      this.events.push(`Receive TipAdded event: ${JSON.stringify(tipAdded)}`);
    });
    this.tellorContract.onTransfer
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(async (transfer) => {
      this.events.push(`Receive Transfer event: ${JSON.stringify(transfer)}`);
      this.subscriptionCheckerBalance = await this.tellorContract.balanceOf(this.subscriptionCheckerAddress);
    });
    this.subscriptionCheckerContract.connected
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(async (connected) => {
      if (connected) {
        this.subscriptionCheckerAddress = this.subscriptionCheckerContract.address;
        if (this.tellorContract.isConnected) {
          this.subscriptionCheckerBalance = await this.tellorContract.balanceOf(this.subscriptionCheckerAddress);
        }
      }
    })
  }

  async refresh(connected: boolean) {
    this.connected = connected;
    if (connected) {
      this.address = this.tellorContract.address;
      this.symbol = await this.tellorContract.symbol();
      this.decimals = await this.tellorContract.decimals();
      if (this.subscriptionCheckerContract.isConnected) {
        this.subscriptionCheckerBalance = await this.tellorContract.balanceOf(this.subscriptionCheckerAddress);
      }
    } else {
      this.address = undefined;
    }
  }

  async submitValue(value: number) {
    this.waiting = true;
    const subscribedToken = await this.subscriptionCheckerContract.subscribedToken();
    const account = this.blockchainService.status.account.toLowerCase();
    const paramsHash = this.tellorContract.computeParamsHash(subscribedToken, account);
    this.tellorContract.getParams(paramsHash).then(({subscribedToken, account}) => {
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
