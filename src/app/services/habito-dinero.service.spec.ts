import { TestBed } from '@angular/core/testing';

import { HabitoDineroService } from './habito-dinero.service';

describe('HabitoDineroService', () => {
  let service: HabitoDineroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitoDineroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
