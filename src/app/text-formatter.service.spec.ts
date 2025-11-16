import { TestBed } from '@angular/core/testing';

import { TextFormatterService } from './text-formatter.service';

describe('TextFormatterService', () => {
  let service: TextFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
