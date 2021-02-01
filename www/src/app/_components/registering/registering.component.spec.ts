import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteringComponent } from './registering.component';

describe('RegisteringComponent', () => {
  let component: RegisteringComponent;
  let fixture: ComponentFixture<RegisteringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisteringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
