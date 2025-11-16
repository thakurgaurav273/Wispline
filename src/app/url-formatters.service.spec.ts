import { TestBed } from '@angular/core/testing';

import { UrlFormattersService } from './url-formatters.service';

describe('UrlFormattersService', () => {
  let service: UrlFormattersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlFormattersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
