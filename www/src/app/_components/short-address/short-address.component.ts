import { Component, Input, OnInit } from '@angular/core';
import { Utils } from 'src/app/_helpers/utils';

@Component({
  selector: 'app-short-address',
  templateUrl: './short-address.component.html',
  styleUrls: ['./short-address.component.scss']
})
export class ShortAddressComponent implements OnInit {

  shortAddress = Utils.shortAddress;

  @Input()
  address: string;

  constructor() { }

  ngOnInit(): void {
  }

}
