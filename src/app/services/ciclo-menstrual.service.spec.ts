import { TestBed } from '@angular/core/testing';

import { CicloMenstrualService } from './ciclo-menstrual.service';

describe('CicloMenstrualService', () => {
  let service: CicloMenstrualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CicloMenstrualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
