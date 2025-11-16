import { TestBed } from '@angular/core/testing';

import { TemplateRegistryService } from './template-registry.service';

describe('TemplateRegistryService', () => {
  let service: TemplateRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
