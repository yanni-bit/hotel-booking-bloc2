import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelOffers } from './hotel-offers';

describe('HotelOffers', () => {
  let component: HotelOffers;
  let fixture: ComponentFixture<HotelOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelOffers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelOffers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
