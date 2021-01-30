import { BigNumber } from 'bignumber.js';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {


  _decimals: number = 18;
  @Input()
  set decimals(value: number) {
    this._decimals = value;
    this.refresh();
  }
  _balance: BigNumber;
  @Input()
  set balance(value: BigNumber) {
    this._balance = value;
    this.refresh();
  }
  balance_text = '';
  _symbol = '';
  @Input()
  set symbol(value: string) {
    this._symbol = value;
    this.refresh();
  }

  constructor() { }

  ngOnInit(): void {
  }

  refresh() {
    if (this._balance && this._decimals) {
      const divider = new BigNumber(10).pow(this._decimals);
      const floor = this._balance.div(divider).abs();
      this.balance_text = floor.toString();
      if (this._symbol && (this._symbol !== '')) {
        this.balance_text += ' ' + this._symbol;
      }
      // const rest = this._balance.minus(floor.multipliedBy(divider));
      // this.balance_text = floor.toString() + '.' + rest.toString();
    } else {
      this.balance_text = '';
    }
  }

}
