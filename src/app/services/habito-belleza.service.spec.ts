import { TestBed } from '@angular/core/testing';

import { HabitoBellezaService } from './habito-belleza.service';

describe('HabitoBellezaService', () => {
  let service: HabitoBellezaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitoBellezaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
