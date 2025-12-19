import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelInfoCard } from './hotel-info-card';

describe('HotelInfoCard', () => {
  let component: HotelInfoCard;
  let fixture: ComponentFixture<HotelInfoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelInfoCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelInfoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
