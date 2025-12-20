import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHotels } from './admin-hotels';

describe('AdminHotels', () => {
  let component: AdminHotels;
  let fixture: ComponentFixture<AdminHotels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHotels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHotels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
