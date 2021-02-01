import { BlockchainService } from './blockchain.service';
import { TellorContractService } from './tellor-contract.service';
import { SubscriptionCheckerContractService } from './subscription-checker-contract.service';
import { ePlayerStatus, GameMasterContractService, PlayerStatus } from './gamemaster-contract.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisteringService {

  newValueSubscription;
  callback: () => Promise<void>;
  resolve: () => void;
  reject: () => void;
  waitStatus = false;
  waitCheck = false;
  waitNewValue = false;


  constructor(
    private gameMasterContract: GameMasterContractService,
    private subscriptionCheckerContract: SubscriptionCheckerContractService,
    private tellorContract: TellorContractService,
    private blockchainService: BlockchainService
  ) {
    this.gameMasterContract.myStatus.subscribe((myStatus) => {
      console.log('Registering: status changed to', PlayerStatus[myStatus], myStatus, ePlayerStatus.Pending);
      if (this.waitStatus && (myStatus !== undefined)) {
        this.waitStatus = false;
        console.log('Registering: catch pending status', PlayerStatus[myStatus]);
        if (!this.waitCheck && !this.waitNewValue && this.callback) {
          console.log('Registering: resolve after status changed');
          this.resolve();
          this.resolve = undefined;
          this.reject = undefined;
          this.callback = undefined;
        }
      }
    });
    this.subscriptionCheckerContract.onCheck.subscribe((onCheck) => {
      if (this.waitCheck && (onCheck.account.toLowerCase() === this.blockchainService.status.account.toLowerCase())) {
        this.waitCheck = false;
        console.log('Registering: catch Check event. TipAdded =', onCheck.tipAdded);
        if (onCheck.tipAdded) {
          this.waitNewValue = true;
        } else {
          if (!this.waitStatus && !this.waitNewValue && this.callback) {
            console.log('Registering: resolve after Check received');
            this.resolve();
            this.resolve = undefined;
            this.reject = undefined;
            this.callback = undefined;
          }
        }
      }
    });
    this.newValueSubscription = this.tellorContract.newValue.subscribe(async ({reqId, paramsHash, time, value}) => {
      const params = await this.tellorContract.getParams(paramsHash);
      console.log('Registering: received event NewValue with params', JSON.stringify(params));
      if (this.waitNewValue && (params.account.toLowerCase() === this.blockchainService.status.account.toLowerCase())) {
        this.waitNewValue = false;
        if (this.callback) {
          // call it again to force updating the status from Pending to Registered or Unregistered
          console.log('Registering: call contract again after NewValue received');
          this.waitStatus = true;
          this.waitCheck = true;
          this.callback().catch(this.reject);
        }
      }
    });
  }

  async register() {
    return new Promise<void>((resolve, reject) => {
      this.waitStatus = true;
      this.waitCheck = true;
      this.waitNewValue = false;
      this.callback = () => this.gameMasterContract.register(),
      this.resolve = resolve;
      this.reject = reject;
      console.log('Registering: first call to contract::register');
      this.callback().catch(this.reject);
    });
  }

  async check() {
    return new Promise<void>((resolve, reject) => {
      this.waitStatus = true;
      this.waitCheck = true;
      this.waitNewValue = false;
      this.callback = () => this.gameMasterContract.check(),
      this.resolve = resolve;
      this.reject = reject;
      console.log('Registering: first call to contract:check');
      this.callback().catch(this.reject);
    });
  }

}
