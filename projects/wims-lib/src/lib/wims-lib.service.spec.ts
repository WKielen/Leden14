import { TestBed } from '@angular/core/testing';

import { WimsLibService } from './wims-lib.service';

describe('WimsLibService', () => {
  let service: WimsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WimsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
