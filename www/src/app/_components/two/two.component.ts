import { PortisService } from './../../_services/portis.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-two',
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.scss']
})
export class TwoComponent implements OnInit {

  network = 'goerli';

  constructor(
  ) { }

  ngOnInit(): void {
  }

}
