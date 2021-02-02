import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundEndedDialogComponent } from './round-ended-dialog.component';

describe('RoundEndedDialogComponent', () => {
  let component: RoundEndedDialogComponent;
  let fixture: ComponentFixture<RoundEndedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundEndedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundEndedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
