import { TestBed } from '@angular/core/testing';

import { RilasciService } from './rilasci.service';

describe('RilasciService', () => {
  let service: RilasciService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RilasciService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
