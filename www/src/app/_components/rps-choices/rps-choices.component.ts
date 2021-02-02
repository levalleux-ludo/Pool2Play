import { eChoice } from './../../_services/rpsGame';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-rps-choices',
  templateUrl: './rps-choices.component.html',
  styleUrls: ['./rps-choices.component.scss']
})
export class RpsChoicesComponent implements OnInit {

  Choices = {
    Rock: 0,
    Paper: 1,
    Scissors: 2
  }
  @Output()
  select = new EventEmitter<eChoice>();
  choice: number;

  constructor() { }

  ngOnInit(): void {
  }

  selectChoice(value) {
    this.choice = parseInt(value);
    this.select.emit(this.choice);
  }

}
