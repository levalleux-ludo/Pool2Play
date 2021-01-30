import { PortisService } from './../../_services/portis.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {

  network;

  constructor(
    private route: ActivatedRoute,
    private portis: PortisService
  ) { }

  ngOnInit(): void {
    this.network = (this.route.data as any).value?.network;
    this.connect();
  }

  connect() {
    this.portis.login(this.network);
  }

}
