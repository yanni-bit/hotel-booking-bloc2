import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelHeader } from './hotel-header';

describe('HotelHeader', () => {
  let component: HotelHeader;
  let fixture: ComponentFixture<HotelHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
