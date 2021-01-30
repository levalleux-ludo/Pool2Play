import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortisComponent } from './portis.component';

describe('PortisComponent', () => {
  let component: PortisComponent;
  let fixture: ComponentFixture<PortisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
