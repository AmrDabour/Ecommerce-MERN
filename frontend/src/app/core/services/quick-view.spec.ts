import { TestBed } from '@angular/core/testing';

import { QuickView } from './quick-view';

describe('QuickView', () => {
  let service: QuickView;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickView);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
