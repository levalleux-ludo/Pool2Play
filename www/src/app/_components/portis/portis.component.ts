import { BlockchainService, ConnectionStatus } from './../../_services/blockchain.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PortisService } from 'src/app/_services/portis.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-portis',
  templateUrl: './portis.component.html',
  styleUrls: ['./portis.component.scss']
})
export class PortisComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  @Input()
  height = 60;
  image;
  latestNetwork: any;
  // connecting = false;
  // connected = false;
  // account;
  chainId;

  status: ConnectionStatus;

  constructor(
    private portis: PortisService,
    private blockchainService: BlockchainService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.blockchainService.connectionStatus
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((status) => {
      this.status = status;
      this.chainId = this.portis.chainId;
      if (this.status.network) {
        this.latestNetwork = this.status.network;
      }
      if (status.connected) {
        this.image = environment.images['portis'];
      } else {
        this.image = undefined;
      }

    })
    // this.portis.isReady().then((ready) => {
    //   this.connected = ready;
    //   if (ready) {
    //     this.account = this.portis.account;
    //     this.chainId = this.portis.chainId;
    //   }
    // })
  }

  connect() {
    // this.connecting = true;
    // this.portis.login(this.network).then(({account, provider}) => {
      // this.connected = true;
      // this.account = account;
      // this.chainId = this.portis.chainId;
    // }).catch(e => {
    //   console.error(JSON.stringify(e));
    //   alert(e);
    // }).finally(() => {
    //   this.connecting = false;
    // })
    this.portis.login(this.latestNetwork);
  }

  disconnect() {
    // this.connecting = true;
    // this.portis.logout().then(() => {
    //   this.account = undefined;
    //   this.connected = false;
    // }).catch(e => {
    //   console.error(JSON.stringify(e));
    //   alert(e);
    // }).finally(() => {
    //   this.connecting = false;
    // })
    this.portis.logout();
  }

}
