import { TestBed } from '@angular/core/testing';

import { RegisteringService } from './registering.service';

describe('RegisteringService', () => {
  let service: RegisteringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisteringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
