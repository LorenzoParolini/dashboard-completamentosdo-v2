import { TestBed } from '@angular/core/testing';

import { Software } from './software';

describe('Software', () => {
  let service: Software;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Software);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
