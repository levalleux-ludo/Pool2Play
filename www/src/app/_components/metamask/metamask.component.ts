import { MetamaskService } from './../../_services/metamask.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metamask',
  templateUrl: './metamask.component.html',
  styleUrls: ['./metamask.component.scss']
})
export class MetamaskComponent implements OnInit {

  connecting = false;
  connected = false;
  account;
  chainId;

  constructor(
    private metamaskService: MetamaskService
  ) { }

  ngOnInit(): void {
  }

  connect() {
    this.connecting = true;
    this.metamaskService.connect().then(({account, provider}) => {
      this.connected = true;
      this.account = account;
      this.chainId = provider.chainId;
    }).catch(e => {
      console.error(JSON.stringify(e));
      alert(e);
    }).finally(() => {
      this.connecting = false;
    })
  }

  disconnect() {
    this.connecting = true;
    this.metamaskService.disconnect().then(() => {
      this.account = undefined;
      this.connected = false;
    }).catch(e => {
      console.error(JSON.stringify(e));
      alert(e);
    }).finally(() => {
      this.connecting = false;
    })
  }

}
