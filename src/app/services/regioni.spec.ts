import { TestBed } from '@angular/core/testing';

import { Regioni } from './regioni';

describe('Regioni', () => {
  let service: Regioni;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Regioni);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
