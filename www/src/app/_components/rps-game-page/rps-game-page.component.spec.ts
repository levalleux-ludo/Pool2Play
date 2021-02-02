import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RpsGamePageComponent } from './rps-game-page.component';

describe('RpsGamePageComponent', () => {
  let component: RpsGamePageComponent;
  let fixture: ComponentFixture<RpsGamePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RpsGamePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RpsGamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
