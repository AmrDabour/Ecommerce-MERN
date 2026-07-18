import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLiveChat } from './admin-live-chat';

describe('AdminLiveChat', () => {
  let component: AdminLiveChat;
  let fixture: ComponentFixture<AdminLiveChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLiveChat],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLiveChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
