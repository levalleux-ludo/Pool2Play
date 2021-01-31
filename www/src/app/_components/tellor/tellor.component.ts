import { SubscriptionCheckerContractService } from './../../_services/subscription-checker-contract.service';
import { BlockchainService } from './../../_services/blockchain.service';
import { TellorContractService } from './../../_services/tellor-contract.service';
import { Component, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import addresses from '../../../../../contracts/contracts/addresses.json';

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
  subscriptionCheckerAddress;
  subscriptionCheckerBalance;
  decimals;
  symbol;

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
    this.tellorContract.onTransfer.subscribe(async (transfer) => {
      this.events.push(`Receive Transfer event: ${JSON.stringify(transfer)}`);
      this.subscriptionCheckerBalance = await this.tellorContract.balanceOf(this.subscriptionCheckerAddress);
    });
    this.subscriptionCheckerContract.connected.subscribe(async (connected) => {
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
