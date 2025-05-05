import { TestBed } from '@angular/core/testing';

import { EmpresaDashboardService } from './empresa-dashboard.service';

describe('EmpresaDashboardService', () => {
  let service: EmpresaDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpresaDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
