import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHotelForm } from './admin-hotel-form';

describe('AdminHotelForm', () => {
  let component: AdminHotelForm;
  let fixture: ComponentFixture<AdminHotelForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHotelForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHotelForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
