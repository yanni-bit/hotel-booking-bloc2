import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelWidgets } from './hotel-widgets';

describe('HotelWidgets', () => {
  let component: HotelWidgets;
  let fixture: ComponentFixture<HotelWidgets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelWidgets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelWidgets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
