import { TestBed } from '@angular/core/testing';

import { RpsGameService } from './rps-game.service';

describe('RpsGameService', () => {
  let service: RpsGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RpsGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
