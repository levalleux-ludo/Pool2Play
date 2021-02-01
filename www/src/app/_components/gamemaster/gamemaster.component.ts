import { RegisteringService } from './../../_services/registering.service';
import { GameMasterContractService, ePlayerStatus, PlayerStatus } from './../../_services/gamemaster-contract.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlockchainService } from 'src/app/_services/blockchain.service';

@Component({
  selector: 'app-gamemaster',
  templateUrl: './gamemaster.component.html',
  styleUrls: ['./gamemaster.component.scss']
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  connected = false;
  address;
  registering = false;
  statusText;
  isRegistered = false;
  isPending = false;
  events = [];
  message;
  set status(value: ePlayerStatus) {
    this.statusText = PlayerStatus[value];
    this.isRegistered = value === ePlayerStatus.Registered;
    this.isPending = value === ePlayerStatus.Pending;
  }

  constructor(
    private gameMasterContract: GameMasterContractService,
    private blockchainService: BlockchainService,
    private registeringService: RegisteringService

  ) { }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.gameMasterContract.connected
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((connected) => {
      this.refresh(connected);
    });
    this.gameMasterContract.myStatus
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((status) => {
      if (status !== undefined) {
        this.events.push(`Receive MyStatus event: ${PlayerStatus[status]}`);
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
    this.registeringService.register().finally(() => {
      this.registering = false;
      this.refresh(this.connected);
    });
  }

  check() {
    this.registering = true;
    this.registeringService.check().finally(() => {
      this.registering = false;
      this.refresh(this.connected);
    });
  }

}
