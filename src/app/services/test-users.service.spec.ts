import { TestBed } from '@angular/core/testing';

import { TestUsersService } from './test-users.service';

describe('TestUsersService', () => {
  let service: TestUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
