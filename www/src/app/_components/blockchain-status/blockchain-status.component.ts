import { BlockchainService, ConnectionStatus } from './../../_services/blockchain.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blockchain-status',
  templateUrl: './blockchain-status.component.html',
  styleUrls: ['./blockchain-status.component.scss']
})
export class BlockchainStatusComponent implements OnInit {

  status: ConnectionStatus;

  constructor(
    private blockchainService: BlockchainService
  ) { }

  ngOnInit(): void {
    this.blockchainService.connectionStatus.subscribe((status) => {
      this.status = status;
    })
  }

}
