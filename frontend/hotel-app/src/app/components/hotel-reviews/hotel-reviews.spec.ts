import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelReviews } from './hotel-reviews';

describe('HotelReviews', () => {
  let component: HotelReviews;
  let fixture: ComponentFixture<HotelReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelReviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
