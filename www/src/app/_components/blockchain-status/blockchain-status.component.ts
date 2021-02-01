import { BigNumber } from 'bignumber.js';
import { BlockchainService, ConnectionStatus } from './../../_services/blockchain.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-blockchain-status',
  templateUrl: './blockchain-status.component.html',
  styleUrls: ['./blockchain-status.component.scss']
})
export class BlockchainStatusComponent implements OnInit, OnDestroy {

  status: ConnectionStatus;
  balance;

  private unsubscribe$ = new Subject<void>();


  constructor(
    private blockchainService: BlockchainService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.blockchainService.connectionStatus
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((status: any) => {
      this.status = status;
    })
    this.blockchainService.accountBalance
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((balance) => {
      // this.balance = balance.toString();
      this.balance = balance.div(new BigNumber(10).pow(18)).toString();
    })
  }

}
