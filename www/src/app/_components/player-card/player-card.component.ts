import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})
export class PlayerCardComponent implements OnInit {

  @Input()
  title;
  _player;
  @Input()
  set player(value: any) {
    this._player = value;
  }
  get player(): any {
    return this._player;
  }
  constructor() { }

  ngOnInit(): void {
  }

}
