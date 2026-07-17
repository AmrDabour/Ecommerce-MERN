import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutSuccess } from './checkout-success';

describe('CheckoutSuccess', () => {
  let component: CheckoutSuccess;
  let fixture: ComponentFixture<CheckoutSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccess],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
