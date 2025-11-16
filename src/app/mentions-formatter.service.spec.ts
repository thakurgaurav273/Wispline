import { TestBed } from '@angular/core/testing';

import { MentionsFormatterService } from './mentions-formatter.service';

describe('MentionsFormatterService', () => {
  let service: MentionsFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentionsFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
