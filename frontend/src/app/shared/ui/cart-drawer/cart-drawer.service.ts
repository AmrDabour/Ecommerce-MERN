import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartDrawerService {
  readonly isOpen = signal(false);

  open() {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
}
