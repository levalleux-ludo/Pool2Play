import { TestBed } from '@angular/core/testing';

import { TellorContractService } from './tellor-contract.service';

describe('TellorContractService', () => {
  let service: TellorContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TellorContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
