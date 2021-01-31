import { GameMasterContractService, ePlayerStatus, PlayerStatus } from './../../_services/gamemaster-contract.service';
import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/_services/blockchain.service';

@Component({
  selector: 'app-gamemaster',
  templateUrl: './gamemaster.component.html',
  styleUrls: ['./gamemaster.component.scss']
})
export class GameMasterComponent implements OnInit {

  connected = false;
  address;
  registering = false;
  statusText;
  isRegistered = false;
  isPending = false;
  message;
  set status(value: ePlayerStatus) {
    this.statusText = PlayerStatus[value];
    this.isRegistered = value === ePlayerStatus.Registered;
    this.isPending = value === ePlayerStatus.Pending;
  }

  constructor(
    private gameMasterContract: GameMasterContractService,
    private blockchainService: BlockchainService

  ) { }

  ngOnInit(): void {
    this.gameMasterContract.connected.subscribe((connected) => {
      this.refresh(connected);
    });
    this.gameMasterContract.myStatus.subscribe((status) => {
      if (status !== undefined) {
        this.status = status;
        this.refresh(this.connected);
        if (this.registering && (status === ePlayerStatus.Unregistered)) {
          this.message = "Registration Failed. Please subscribed to the Pool.";
        } else {
          this.message = undefined;
        }
        this.registering = false;
      }
    })
  }

  async refresh(connected: boolean) {
    this.connected = connected;
    if (connected) {
      this.address = this.gameMasterContract.address;
      this.status = await this.gameMasterContract.playerStatus(this.blockchainService.status.account);
    } else {
      this.address = undefined;
    }
  }

  register() {
    this.registering = true;
    this.gameMasterContract.register().finally(() => {
      this.registering = false;
      this.refresh(this.connected);
    });
  }

  check() {
    this.registering = true;
    this.gameMasterContract.check().finally(() => {
      this.registering = false;
      this.refresh(this.connected);
    });
  }

}
