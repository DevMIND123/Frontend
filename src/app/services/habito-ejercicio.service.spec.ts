import { TestBed } from '@angular/core/testing';

import { HabitoEjercicioService } from './habito-ejercicio.service';

describe('HabitoEjercicioService', () => {
  let service: HabitoEjercicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitoEjercicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
