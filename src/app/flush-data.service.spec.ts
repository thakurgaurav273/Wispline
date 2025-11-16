import { TestBed } from '@angular/core/testing';

import { FlushDataService } from './flush-data.service';

describe('FlushDataService', () => {
  let service: FlushDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlushDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
