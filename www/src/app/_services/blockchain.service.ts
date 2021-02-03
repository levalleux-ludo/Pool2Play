import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';
import {Eth} from 'web3-eth';

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  account: string;
  network: string;
  chainId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  status: ConnectionStatus = {
    connected: false,
    connecting: false,
    account: undefined,
    network: undefined,
    chainId: undefined
  };
  connectionStatus = new BehaviorSubject<ConnectionStatus>(this.status);
  accountBalance = new BehaviorSubject<BigNumber>(new BigNumber(0));
  interval;

  constructor() {
  }


  connecting(network: string) {
    this.status.connected = false;
    this.status.connecting = true;
    this.status.network = network;
    this.status.chainId = undefined;
    this.status.account = undefined;
    this.connectionStatus.next(this.status);
  }

  connected(network: {name: string, chainId: string}, account: string, eth: Eth) {
    this.status.connected = true;
    this.status.connecting = false;
    this.status.network = network.name;
    this.status.chainId = network.chainId;
    this.status.account = account;
    this.connectionStatus.next(this.status);
    this.interval = setInterval(() => {
        this.refreshBalance(eth, account);
    }, 5000);
    this.refreshBalance(eth, account);
  }

  refreshBalance(eth: Eth, account: string) {
    eth.getBalance(account).then((balance) => {
      this.accountBalance.next(new BigNumber(balance));
    });
  }

  disconnecting() {
    this.status.connected = false;
    this.status.connecting = true;
    this.status.network = undefined;
    this.status.chainId = undefined;
    this.status.account = undefined;
    this.connectionStatus.next(this.status);
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.accountBalance.next(undefined);
  }

  disconnected() {
    this.status.connected = false;
    this.status.connecting = false;
    this.status.network = undefined;
    this.status.chainId = undefined;
    this.status.account = undefined;
    this.connectionStatus.next(this.status);
  }


}
