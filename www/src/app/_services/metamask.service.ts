import { Inject, Injectable } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { WindowRef } from '../_helpers/WindowRef';
import { provider } from 'web3-core';

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {

  _initialized = false;
  _account;
  _chainId;

  constructor(
    @Inject(WEB3) private web3: Web3,
    private winRef: WindowRef
  ) { }

  public async connect(): Promise<{account: string, provider: any}> {
    return new Promise<{account: string, provider: any}>((resolve, reject) => {
      let web3Provider: provider = undefined;
      // Modern dapp browsers...
      if (this.winRef.nativeWindow.ethereum) {

        // you should use chainId for network identity, and listen for
        // 'chainChanged'
        if (this.winRef.nativeWindow.ethereum.on) {
          this.winRef.nativeWindow.ethereum.on('chainChanged', chainId => {
            // handle the new network
            console.log("ETH EVENT: chainChanged", chainId);
            // document.location.reload(); ?
          });
          // if you want to expose yourself to the problems associated
          // with networkId, listen for 'networkChanged' instead
          this.winRef.nativeWindow.ethereum.on('networkChanged', networkId => {
            // handle the new network
            console.log("ETH EVENT: networkChanged", networkId);
          });

          this.winRef.nativeWindow.ethereum.on('accountsChanged', (accounts) => {
            // Time to reload your interface with accounts[0]!
            console.log("ETH event accounts:", accounts);
          });
      }
      web3Provider = this.winRef.nativeWindow.ethereum;
        try {
          // Request account access
          this.winRef.nativeWindow.ethereum.enable().then(() => {
            this.web3.setProvider(web3Provider);
            this._initialized = web3Provider !== undefined;
            this._chainId = (web3Provider as any).chainId;
            this.setAccount().then((account) => {
              resolve({account, provider: web3Provider});
            }).catch(reject);
          }).catch((error: any) => {
            console.error(error);
            reject(error);
          });
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
          reject(new Error("User denied account access"));
        }
      } else if (this.winRef.nativeWindow.web3) {
        // Legacy dapp browsers...
        web3Provider = this.winRef.nativeWindow.web3.currentProvider;
        this.web3.setProvider(web3Provider);
        this._initialized = web3Provider !== undefined;
        this._chainId = (web3Provider as any).chainId;
        this.setAccount().then((account) => {
          resolve({account, provider: web3Provider});
        }).catch(reject);
        } else {
        // If no injected web3 instance is detected, fall back to Ganache
        // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      // this._initialized = web3Provider !== undefined;
    });

  }

  async disconnect() {
    this._account = undefined;
    this._chainId = undefined;
    this._initialized = false;
    this.web3.setProvider(undefined);
  }

  async isReady(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const web3Provider = this.winRef.nativeWindow.ethereum;
      resolve(web3Provider && web3Provider.isConnected());
    })
  }

  async setAccount(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this._account = undefined;
      if (this.web3.eth.defaultAccount) {
        this._account = this.web3.eth.defaultAccount;
        console.log('set account', this._account);
        resolve(this._account);
      } else {
        this.web3.eth.getAccounts((error, accounts) => {
          if (!error) {
            this._account = accounts[0];
            console.log('set account', this._account);
            resolve(this._account);
          } else {
            reject(error);
          }
        });
      }
    });
  }

}
