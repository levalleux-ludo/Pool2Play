import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortAddressComponent } from './short-address.component';

describe('ShortAddressComponent', () => {
  let component: ShortAddressComponent;
  let fixture: ComponentFixture<ShortAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
