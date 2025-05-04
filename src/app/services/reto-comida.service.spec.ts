import { TestBed } from '@angular/core/testing';

import { RetoComidaService } from './reto-comida.service';

describe('RetoComidaService', () => {
  let service: RetoComidaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetoComidaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
