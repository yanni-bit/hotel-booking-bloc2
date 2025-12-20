import { TestBed } from '@angular/core/testing';

import { AdminHotels } from './admin-hotels';

describe('AdminHotels', () => {
  let service: AdminHotels;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminHotels);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
