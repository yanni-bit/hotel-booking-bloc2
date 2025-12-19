import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpContact } from './help-contact';

describe('HelpContact', () => {
  let component: HelpContact;
  let fixture: ComponentFixture<HelpContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
