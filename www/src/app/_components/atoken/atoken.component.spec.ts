import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtokenComponent } from './atoken.component';

describe('AtokenComponent', () => {
  let component: AtokenComponent;
  let fixture: ComponentFixture<AtokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
