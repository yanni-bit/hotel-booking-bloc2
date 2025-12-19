import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularHotels } from './popular-hotels';

describe('PopularHotels', () => {
  let component: PopularHotels;
  let fixture: ComponentFixture<PopularHotels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularHotels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularHotels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
