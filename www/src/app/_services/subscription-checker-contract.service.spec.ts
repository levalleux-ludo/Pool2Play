import { TestBed } from '@angular/core/testing';

import { SubscriptionCheckerContractService } from './subscription-checker-contract.service';

describe('SubscriptionCheckerContractService', () => {
  let service: SubscriptionCheckerContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionCheckerContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
