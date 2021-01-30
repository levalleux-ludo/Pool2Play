import { BigNumber } from 'bignumber.js';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { WEB3 } from '../_helpers/tokens';
import { BlockchainService } from './blockchain.service';
import tellorJSON from '../../../../contracts/artifacts/contracts/usingtellor/TellorPlayground.sol/TellorPlayground.json';
import addresses from '../../../../contracts/contracts/addresses.json';

@Injectable({
  providedIn: 'root'
})
export class TellorContractService {

  address: string;
  contract: any;

  connected = new BehaviorSubject<boolean>(false);

  tipAdded = new Subject<any>();
  newValue = new Subject<any>();

  constructor(
    @Inject(WEB3) private web3: Web3,
    private blockchainService: BlockchainService

  ) {
    this.blockchainService.connectionStatus.subscribe((status) => {
      if (status.connected) {
        const address = addresses.tellor[status.chainId];
        if (address) {
          this.connect(address);
        } else {
          throw new Error('Unable to find address for contract tellor on chain ' + status.chainId);
        }
      } else {
        this.disconnect();
      }
    })

  }

  async connect(address: string) {
    this.contract = new this.web3.eth.Contract(tellorJSON.abi as any, address);
    this.address = address;
    this.contract.events.TipAdded({}, (error, event) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Tellor receive event TipAdded', JSON.stringify(event));
        const reqId = event.returnValues._requestId;
        const paramsHash = event.returnValues._paramsHash;
        const tip = event.returnValues._tip;
        console.log('Tellor receive event TipAdded', reqId.toString(), paramsHash, tip.toString());
        this.tipAdded.next({reqId, paramsHash, tip});
      }
    });
    this.contract.events.NewValue({}, (error, event) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Tellor receive event NewValue', JSON.stringify(event));
        const reqId = event.returnValues._requestId;
        const paramsHash = event.returnValues._paramsHash;
        const time = event.returnValues._time;
        const value = event.returnValues._value;
        console.log('Tellor receive event NewValue', reqId.toString(), paramsHash, time.toString(), value.toString());
        this.newValue.next({reqId, paramsHash, time, value});
      }
    });
    this.connected.next(true);
  }

  disconnect() {
    this.connected.next(false);
    this.contract = undefined;
    this.address = undefined;
  }

  public computeParamsHash(subscribedToken: string, account: string): string {
    const data = this.web3.eth.abi.encodeParameters(
      ['address', 'address'],
      [subscribedToken, account]
    );
    console.log('data encoded', data);
    const hash1 = this.web3.utils.sha3(data);
    console.log('hash1', hash1);
    const hash2 = this.web3.utils.soliditySha3({type: 'address', value: subscribedToken}, {type: 'address', value: account});
    console.log('hash2', hash2);
      return hash1;
  }

  async getParams(paramsHash: string): Promise<any> {
    return this.contract.methods.getParams(paramsHash).call();
  }

  async submitValue(requestId: BigNumber, paramsHash: string, value: BigNumber) {
      return new Promise<void>(async (resolve, reject) => {
        this.contract.methods.submitValue(requestId, paramsHash, value).send({from: this.blockchainService.status.account})
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
