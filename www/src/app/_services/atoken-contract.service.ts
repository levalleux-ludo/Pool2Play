import { BehaviorSubject } from 'rxjs';
import { BlockchainService } from './blockchain.service';
import { Inject, Injectable } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import aTokenJSON from '../../../../contracts/artifacts/contracts/AToken.sol/AToken.json';
import addresses from '../../../../contracts/contracts/addresses.json';
import BigNumber from 'bignumber.js';


@Injectable({
  providedIn: 'root'
})
export class AtokenContractService {
  address: string;
  contract: any;

  connected = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService
  ) {
    this.blockchainService.connectionStatus.subscribe((status) => {
      if (status.connected) {
        console.log('AtokenContractService onBlockchain connection', status);
        const address = addresses.aToken[status.chainId];
        if (address) {
          this.connect(address);
        } else {
          console.warn('Unable to find address for contract aToken on chain ' + status.chainId);
          this.disconnect();
        }
      } else {
        this.disconnect();
      }
    })
  }

  async connect(address: string) {
    this.contract = new this.web3.eth.Contract(aTokenJSON.abi as any, address);
    this.address = address;
    this.connected.next(true);
  }

  disconnect() {
    this.connected.next(false);
    this.contract = undefined;
    this.address = undefined;
  }

  public totalSupply(): Promise<BigNumber> {
    return new Promise<BigNumber>((resolve, reject) => {
      this.contract.methods.totalSupply().call().then((totalSupply) => {
        resolve(new BigNumber(totalSupply));
      }).catch(reject);
    });
  }

  public balanceOf(account: string): Promise<BigNumber> {
    return new Promise<BigNumber>((resolve, reject) => {
      this.contract.methods.balanceOf(account).call().then((bal) => {
        resolve(new BigNumber(bal));
      }).catch(reject);
    })
  }

  public name(): Promise<string> {
    return this.contract.methods.name().call();
  }

  public symbol(): Promise<string> {
    return this.contract.methods.symbol().call();
  }

  public decimals(): Promise<number> {
    return this.contract.methods.decimals().call();
  }

  public async computePrice(amount: BigNumber): Promise<BigNumber> {
    return this.contract.methods.computePrice(amount).call();
  }

  public async buy(amount: BigNumber) {
    return new Promise<void>(async (resolve, reject) => {
      const price = await this.computePrice(amount);
      console.log("Buying price", price.toString());
      this.contract.methods.buy(amount).send({from: this.blockchainService.status.account, value: price})
      .once('receipt', receipt => {
        console.log(receipt);
      })
      .once('transactionHash', txHash => {
        console.log(txHash);
      })
      .once('confirmation', (nbConfirmaton, receipt) => {
        resolve();
      })
      .once('error', (error, receipt) => {
        console.error(error);
        console.error(receipt);
        reject(error);
      })
    });

  }

  public async sell(amount: BigNumber) {
    return new Promise<void>(async (resolve, reject) => {
      this.contract.methods.sell(amount).send({from: this.blockchainService.status.account})
      .once('receipt', receipt => {
        console.log(receipt);
      })
      .once('transactionHash', txHash => {
        console.log(txHash);
      })
      .once('confirmation', (nbConfirmaton, receipt) => {
        resolve();
      })
      .once('error', (error, receipt) => {
        console.error(error);
        console.error(receipt);
        reject(error);
      })
    });
  }



}
