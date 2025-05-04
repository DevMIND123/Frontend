import { TestBed } from '@angular/core/testing';

import { HabitoModaService } from './habito-moda.service';

describe('HabitoModaService', () => {
  let service: HabitoModaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitoModaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
