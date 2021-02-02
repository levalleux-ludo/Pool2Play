import { RoundEndedDialogComponent } from './../round-ended-dialog/round-ended-dialog.component';
import { eChoice } from './../../_services/rpsGame';
import { RpsGameService } from './../../_services/rps-game.service';
import { eGameStatus, GameStatus, RSPGame } from 'src/app/_services/rpsGame';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlockchainService } from 'src/app/_services/blockchain.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rps-game-page',
  templateUrl: './rps-game-page.component.html',
  styleUrls: ['./rps-game-page.component.scss']
})
export class RpsGamePageComponent implements OnInit, OnDestroy {

  address: string;
  contract: RSPGame;
  account: string;
  status: eGameStatus;
  players = [];
  remainingRounds;
  nbRounds;
  INITIALIZED = eGameStatus.Initialized;
  COMMITTED = eGameStatus.Committed;
  READY = eGameStatus.Ready;
  ROUND_ENDED = eGameStatus.RoundEnded;
  myIndex: number;
  choice: eChoice;
  committing = false;
  revealing = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private rpsGameService: RpsGameService,
    private blockchainService: BlockchainService,
    private dialog: MatDialog,
  ) {
    this.contract = this.rpsGameService.createContract();
  }

  ngOnDestroy(): void {
    this.contract.disconnect();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['address'] == undefined) {
      throw new Error('No address specified in route')
    }
    this.address = this.route.snapshot.queryParams['address'];
    this.blockchainService.connectionStatus
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((status) => {
      if (status.connected) {
        this.account = status.account.toLowerCase();
        this.contract.connect(this.address).then(() => {
          this.refresh();
        })
      } else {
        this.account = undefined;
        this.contract.disconnect();
      }
    })
    this.contract.statusChanged
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((newStatus) => {
      this.status = newStatus;
      this.refresh();
    })
    this.contract.onRefresh
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(() => {
      this.refresh();
    })
    this.contract.roundEnded
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((roundEndedData) => {
      const youwin = roundEndedData.winner.toLowerCase() === this.account.toLowerCase();
      const dialogData = {
        indexRound: this.nbRounds - this.remainingRounds + 1,
        nbRounds: this.nbRounds,
        myIndex: this.myIndex,
        choices: roundEndedData.choices,
        scores: roundEndedData.scores,
        youwin,
        youlost: !youwin && (roundEndedData.winner !== '0x' + '0'.repeat(40))
      };
      RoundEndedDialogComponent.showModal(this.dialog, dialogData).then(() => {
        this.refresh();
      })
    })

  }

  translateStatus(status: eGameStatus): string {
    return GameStatus[status];
  }

  async refresh() {
    this.nbRounds = await this.contract.nbRounds();
    this.remainingRounds = await this.contract.remainingRounds();
    this.contract.getPlayers().then((players) => {
      this.players = players;
      console.log('refresh players', players.length);
      let myIndex = undefined;
      for (const player of players) {
        if (player.address.toLowerCase() === this.account.toLowerCase()) {
          myIndex = player.index;
        }
      }
      this.myIndex = myIndex;
    });
  }

  commit() {
    this.committing = true;
    this.contract.commit(this.choice).finally(() => {
      this.committing = false;
      this.refresh();
    });
  }

  reveal() {
    this.revealing = true;
    this.contract.reveal().finally(() => {
      this.revealing = false;
      this.refresh();
    });
  }


}
