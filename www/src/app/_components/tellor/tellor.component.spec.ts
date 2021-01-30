import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TellorComponent } from './tellor.component';

describe('TellorComponent', () => {
  let component: TellorComponent;
  let fixture: ComponentFixture<TellorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TellorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TellorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
