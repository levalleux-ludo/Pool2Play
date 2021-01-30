import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainStatusComponent } from './blockchain-status.component';

describe('BlockchainStatusComponent', () => {
  let component: BlockchainStatusComponent;
  let fixture: ComponentFixture<BlockchainStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockchainStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
