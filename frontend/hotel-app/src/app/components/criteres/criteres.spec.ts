import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Criteres } from './criteres';

describe('Criteres', () => {
  let component: Criteres;
  let fixture: ComponentFixture<Criteres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Criteres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Criteres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
