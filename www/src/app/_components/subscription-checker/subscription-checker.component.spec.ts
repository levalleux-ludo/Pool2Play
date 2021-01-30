import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionCheckerComponent } from './subscription-checker.component';

describe('SubscriptionCheckerComponent', () => {
  let component: SubscriptionCheckerComponent;
  let fixture: ComponentFixture<SubscriptionCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionCheckerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
