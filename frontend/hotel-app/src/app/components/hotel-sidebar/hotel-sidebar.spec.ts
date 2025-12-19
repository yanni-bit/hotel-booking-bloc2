import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelSidebar } from './hotel-sidebar';

describe('HotelSidebar', () => {
  let component: HotelSidebar;
  let fixture: ComponentFixture<HotelSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
