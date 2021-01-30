import { BigNumber } from 'bignumber.js';
import { BlockchainService } from './../../_services/blockchain.service';
import { AtokenContractService } from './../../_services/atoken-contract.service';
import { Component, OnInit } from '@angular/core';
import { connect } from 'http2';

const ACCOUNTS = [
  '0x1b05Ba94aCc29d0D66a0114a0bC7Daa139153BE5',
  '0xe521e6e98984D53C9967Fe338E0A744cAB790d10',
  '0x78130A156f76C402B98B6f966F217cdE02448A52',
  '0x762cAB645D290296052B4F712904F2F9004f2f4B',
  '0x813122B9f9e2f80d5B383B2309d188bC7E4f9c02',
  '0x2EC98F3F99aa31d4439869Ad2466394b60cd4DFF'
]

@Component({
  selector: 'app-atoken',
  templateUrl: './atoken.component.html',
  styleUrls: ['./atoken.component.scss']
})
export class AtokenComponent implements OnInit {

  connected = false;
  totalSupply;
  name;
  symbol;
  decimals;
  address;
  accounts = [];
  myBalance: BigNumber;
  waiting = false;
  buying = false;
  selling = false;

  constructor(
    private aTokenContract: AtokenContractService,
    private blockchainService: BlockchainService
  ) { }

  ngOnInit(): void {
    this.aTokenContract.connected.subscribe((connected) => {
      this.refresh(connected);
    })
  }

  async refresh(connected: boolean) {
    this.connected = connected;
    if (connected) {
      this.address = this.aTokenContract.address;
      this.name = await this.aTokenContract.name();
      this.symbol = await this.aTokenContract.symbol();
      this.decimals = await this.aTokenContract.decimals();
      this.totalSupply = await this.aTokenContract.totalSupply();
      this.accounts = [];
      let allAccounts = Array.from(ACCOUNTS);
      if (!allAccounts.includes(this.blockchainService.status.account)) {
        allAccounts.push(this.blockchainService.status.account);
      }
      for (let account of allAccounts) {
        this.aTokenContract.balanceOf(account).then((balance) => {
          this.accounts.push({address: account, balance});
          if (account ===  this.blockchainService.status.account) {
            this.myBalance = balance;
          }
        })
      }
    } else {
      this.address = undefined;
      this.name = undefined;
      this.symbol = undefined;
      this.decimals = undefined;
      this.totalSupply = undefined;
      this.accounts = [];
      this.myBalance = undefined;
    }
  }

  buy(amount: number) {
    console.log("buy", amount);
    this.waiting = true;
    const amount_units = new BigNumber(10).pow(this.decimals).multipliedBy(amount);
    console.log("amount_units", amount_units.toString());
    this.aTokenContract.buy(amount_units).then(() => {
      this.refresh(this.connected);
    }).catch(e => {
      console.error(JSON.stringify(e));
      alert('Buying transaction failed');
    }).finally(() => {
      this.waiting = false;
    })
  }

  sell(amount: number) {
    console.log("sell", amount);
    this.waiting = true;
    const amount_units = new BigNumber(10).pow(this.decimals).multipliedBy(amount);
    console.log("amount_units", amount_units.toString());
    this.aTokenContract.sell(amount_units).then(() => {
      this.refresh(this.connected);
    }).catch(e => {
      console.error(JSON.stringify(e));
      alert('Selling transaction failed');
    }).finally(() => {
      this.waiting = false;
    })
  }

  getMaxToSale(): number {
    return this.myBalance.div(new BigNumber(10).pow(this.decimals)).toNumber();
  }

}
