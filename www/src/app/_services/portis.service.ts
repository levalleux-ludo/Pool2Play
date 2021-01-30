import { BlockchainService } from './blockchain.service';
import { Inject, Injectable } from '@angular/core';
import Portis from '@portis/web3';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';

const PORTIS_API_KEY = '0c1de70d-2cfe-4336-8a87-ed4704e9457c';

const ganache = {
  chainId: 1337,
  nodeUrl: 'http://localhost:7545'
}

@Injectable({
  providedIn: 'root'
})
export class PortisService {

  initialized = false;
  private portis: Portis;
  account;
  network;
  chainId;

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService

  ) { }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  async login(network: any): Promise<{account: string, provider: any}> {
    return new Promise<{account: string, provider: any}>(async (resolve, reject) => {
      this.blockchainService.connecting(network);
      try {
        const ready = await this.isReady();
        if (!ready) {
          this.portis = new Portis(PORTIS_API_KEY, (network === 'ganache') ? ganache : network);
          this.chainId = this.portis.config.network.chainId;
          this.network = network;
          this.web3.setProvider(this.portis.provider as any);
          this.web3.eth.getAccounts((error, accounts) => {
            console.log(accounts);
          });
          this.portis.onLogin((walletAddress: string) => {
            this.account = walletAddress;
            this.blockchainService.connected({name: network, chainId: this.chainId}, this.account, this.web3.eth);
            resolve({account: walletAddress, provider: this.portis.provider});
          });
        } else if (network !== this.network) {
          this.portis.changeNetwork((network === 'ganache') ? ganache : network);
          this.chainId = this.portis.config.network.chainId;
          this.network = network;
          this.web3.setProvider(this.portis.provider as any);
          this.web3.eth.getAccounts((error, accounts) => {
            if (error) {
              this.blockchainService.disconnected();
              reject(error);
            } else {
              console.log(accounts);
              this.account = accounts[0];
              this.blockchainService.connected({name: network, chainId: this.chainId}, this.account, this.web3.eth);
              resolve({account: this.account, provider: this.portis.provider});
            }
          });
        } else {
          this.blockchainService.connected({name: network, chainId: this.chainId}, this.account, this.web3.eth);
          resolve({account: this.account, provider: this.web3.currentProvider});
        }
      } catch (e) {
        this.blockchainService.disconnected();
        reject(e);
      }
    })
  }

  async isReady(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this.initialize().then(() => {
        if (!this.portis) {
          resolve(false);
        } else {
          this.portis.isLoggedIn().then(({error, result}) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          })
        }
      }).catch(reject);
    });
  }

  async logout(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.blockchainService.disconnecting();
      this.portis.showPortis();
      this.portis.logout().then(() => {
        resolve();
      }).catch(reject).finally(() => {
        this.blockchainService.disconnected();
      });
    });

  }


}
