import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyBook } from './why-book';

describe('WhyBook', () => {
  let component: WhyBook;
  let fixture: ComponentFixture<WhyBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhyBook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyBook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
