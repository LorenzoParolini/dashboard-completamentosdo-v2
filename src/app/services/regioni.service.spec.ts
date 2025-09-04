import { TestBed } from '@angular/core/testing';

import { RegioniService } from './regioni.service';

describe('RegioniService', () => {
  let service: RegioniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegioniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
