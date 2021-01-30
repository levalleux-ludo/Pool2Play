import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  account: string;
  network: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  status: ConnectionStatus = {
    connected: false,
    connecting: false,
    account: undefined,
    network: undefined
  };
  connectionStatus = new BehaviorSubject<ConnectionStatus>(this.status);

  constructor() { }

  connecting(network: string) {
    this.status.connected = false;
    this.status.connecting = true;
    this.status.network = network;
    this.status.account = undefined;
    this.connectionStatus.next(this.status);
  }

  connected(network: string, account: string) {
    this.status.connected = true;
    this.status.connecting = false;
    this.status.network = network;
    this.status.account = account;
    this.connectionStatus.next(this.status);
  }

  disconnecting() {
    this.status.connected = false;
    this.status.connecting = true;
    this.status.network = undefined;
    this.status.account = undefined;
    this.connectionStatus.next(this.status);
  }

  disconnected() {
    this.status.connected = false;
    this.status.connecting = false;
    this.status.network = undefined;
    this.status.account = undefined;
    this.connectionStatus.next(this.status);
  }


}
