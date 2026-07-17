import { Directive, ElementRef, HostListener, Input, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appImageZoom]',
  standalone: true,
})
export class ImageZoomDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() zoomScale = 2; // Default zoom scale

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const el = this.el.nativeElement;
    const { left, top, width, height } = el.getBoundingClientRect();
    
    // Calculate mouse position relative to the element
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    this.renderer.setStyle(el, 'transform-origin', `${x}% ${y}%`);
    this.renderer.setStyle(el, 'transform', `scale(${this.zoomScale})`);
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
    this.renderer.setStyle(this.el.nativeElement, 'transform-origin', 'center center');
    // Restore original transition for smooth out
    setTimeout(() => {
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s ease');
    }, 100);
  }
}
