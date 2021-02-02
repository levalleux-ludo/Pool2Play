import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RpsGameItemComponent } from './rps-game-item.component';

describe('RpsGameItemComponent', () => {
  let component: RpsGameItemComponent;
  let fixture: ComponentFixture<RpsGameItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RpsGameItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RpsGameItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
