import { environment } from './../../../environments/environment';
import { BigNumber } from 'bignumber.js';
import { BlockchainService, ConnectionStatus } from './../../_services/blockchain.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
  image;
  @Input()
  height = 60;
  nativeSymbol;

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
      if (status.connected) {
        this.image = environment.images[status.network];
        this.nativeSymbol = environment.nativeSymbol[status.network];
      } else {
        this.image = undefined;
        this.nativeSymbol = undefined;
      }
    })
    this.blockchainService.accountBalance
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((balance) => {
      // this.balance = balance.toString();
      if (balance !== undefined) {
        this.balance = balance.div(new BigNumber(10).pow(18)).toString().substr(0, 8);
      } else {
        this.balance = '-';
      }
    })
  }

}
