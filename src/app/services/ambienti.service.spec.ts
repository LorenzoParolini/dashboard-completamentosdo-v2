import { TestBed } from '@angular/core/testing';

import { AmbientiService } from './ambienti.service';

describe('AmbientiService', () => {
  let service: AmbientiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmbientiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
