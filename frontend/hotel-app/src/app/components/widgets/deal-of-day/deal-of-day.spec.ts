import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealOfDay } from './deal-of-day';

describe('DealOfDay', () => {
  let component: DealOfDay;
  let fixture: ComponentFixture<DealOfDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealOfDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealOfDay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
