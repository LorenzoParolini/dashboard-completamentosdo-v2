import { TestBed } from '@angular/core/testing';

import { Ambienti } from './ambienti';

describe('Ambienti', () => {
  let service: Ambienti;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ambienti);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
