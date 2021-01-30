import { BigNumber } from 'bignumber.js';
import { BlockchainService, ConnectionStatus } from './../../_services/blockchain.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blockchain-status',
  templateUrl: './blockchain-status.component.html',
  styleUrls: ['./blockchain-status.component.scss']
})
export class BlockchainStatusComponent implements OnInit {

  status: ConnectionStatus;
  balance;

  constructor(
    private blockchainService: BlockchainService
  ) { }

  ngOnInit(): void {
    this.blockchainService.connectionStatus.subscribe((status) => {
      this.status = status;
    })
    this.blockchainService.accountBalance.subscribe((balance) => {
      // this.balance = balance.toString();
      this.balance = balance.div(new BigNumber(10).pow(18)).toString();
    })
  }

}
