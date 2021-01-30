import { TestBed } from '@angular/core/testing';

import { GameMasterContractService } from './gamemaster-contract.service';

describe('GamemasterContractService', () => {
  let service: GameMasterContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMasterContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
