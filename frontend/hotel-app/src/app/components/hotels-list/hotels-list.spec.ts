import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsList } from './hotels-list';

describe('HotelsList', () => {
  let component: HotelsList;
  let fixture: ComponentFixture<HotelsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
