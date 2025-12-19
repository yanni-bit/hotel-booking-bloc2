import { TestBed } from '@angular/core/testing';

import { Chambre } from './chambre';

describe('Chambre', () => {
  let service: Chambre;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Chambre);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
