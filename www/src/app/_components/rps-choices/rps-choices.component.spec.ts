import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RpsChoicesComponent } from './rps-choices.component';

describe('RpsChoicesComponent', () => {
  let component: RpsChoicesComponent;
  let fixture: ComponentFixture<RpsChoicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RpsChoicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RpsChoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
