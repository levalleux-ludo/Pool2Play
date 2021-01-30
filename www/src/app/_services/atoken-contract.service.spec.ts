import { TestBed } from '@angular/core/testing';

import { AtokenContractService } from './atoken-contract.service';

describe('AtokenContractService', () => {
  let service: AtokenContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtokenContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
