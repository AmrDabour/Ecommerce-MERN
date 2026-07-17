import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickView } from './quick-view';

describe('QuickView', () => {
  let component: QuickView;
  let fixture: ComponentFixture<QuickView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickView],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
