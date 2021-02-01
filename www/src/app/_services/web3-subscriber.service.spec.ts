import { TestBed } from '@angular/core/testing';

import { Web3SubscriberService } from './web3-subscriber.service';

describe('Web3SubscriberService', () => {
  let service: Web3SubscriberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3SubscriberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
