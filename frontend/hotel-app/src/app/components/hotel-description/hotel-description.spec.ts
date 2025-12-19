import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelDescription } from './hotel-description';

describe('HotelDescription', () => {
  let component: HotelDescription;
  let fixture: ComponentFixture<HotelDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDescription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelDescription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
