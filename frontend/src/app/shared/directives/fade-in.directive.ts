import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFadeIn]',
  standalone: true
})
export class FadeInDirective implements OnInit, OnDestroy {
  @Input() delay = 0; // Delay in ms
  @Input() duration = 1000; // Duration in ms
  @Input() distance = '50px'; // Distance to slide up

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Initial state: hidden and translated down in 3D
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translate3d(0, ${this.distance}, -50px)`);
    this.renderer.setStyle(this.el.nativeElement, 'transition', `all ${this.duration}ms cubic-bezier(0.25, 1, 0.5, 1)`);
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'opacity, transform');
  }

  ngOnInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add delay if specified
          setTimeout(() => {
            this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
            this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate3d(0, 0, 0)');
          }, this.delay);
          
          // Stop observing once animated in
          if (this.observer) {
            this.observer.unobserve(this.el.nativeElement);
          }
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: '0px 0px -50px 0px' // Slightly before it fully enters
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
