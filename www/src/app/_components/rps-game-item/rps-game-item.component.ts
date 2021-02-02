import { RpsGameService } from './../../_services/rps-game.service';
import { eGameStatus, GameStatus } from './../../_services/rpsGame';
import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { WEB3 } from 'src/app/_helpers/tokens';
import { BlockchainService } from 'src/app/_services/blockchain.service';
import { RSPGame } from 'src/app/_services/rpsGame';
import { Web3SubscriberService } from 'src/app/_services/web3-subscriber.service';
import Web3 from 'web3';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-rps-game-item',
  templateUrl: './rps-game-item.component.html',
  styleUrls: ['./rps-game-item.component.scss']
})
export class RpsGameItemComponent implements OnInit, OnDestroy {

  contract: RSPGame;
  _address: string;
  @Input()
  set address(value: string) {
    this._address = value;
    this.contract.connect(value).then(() => {
      this.refresh();
    })
  }
  get address(): string {
    return this._address;
  }
  status;
  players = [];
  account;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private rpsGameService: RpsGameService,
    private blockchainService: BlockchainService,
  ) {
    this.contract = this.rpsGameService.createContract();
  }

  ngOnDestroy(): void {
    this.contract.disconnect();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.blockchainService.connectionStatus
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((status) => {
      if (status.connected) {
        this.account = status.account.toLowerCase();
      } else {
        this.account = undefined;
      }
    })
    this.contract.statusChanged
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((newStatus) => {
      this.status = newStatus;
    })
    this.contract.onRefresh
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(() => {
      this.refresh();
    })
  }

  translateStatus(status: eGameStatus): string {
    return GameStatus[status];
  }

  refresh() {
    this.contract.getPlayers().then((players) => {
      this.players = players;
      console.log('refresh players', players.length);
    });
  }


}
