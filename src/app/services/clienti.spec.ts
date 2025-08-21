import { TestBed } from '@angular/core/testing';

import { Clienti } from './clienti';

describe('Clienti', () => {
  let service: Clienti;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clienti);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
