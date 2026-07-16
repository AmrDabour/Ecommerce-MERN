import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective {
  @Input() tiltMax = 15; // Max tilt rotation (degrees)
  @Input() tiltPerspective = 1000; // Transform perspective
  @Input() tiltScale = 1.05; // Scale on hover
  @Input() tiltSpeed = 400; // Speed of the enter/exit transition

  private element: HTMLElement;
  private width = 0;
  private height = 0;
  private left = 0;
  private top = 0;
  private updateCall: number | null = null;
  private glareElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.element = this.el.nativeElement;
    
    // Setup element styles for 3D
    this.renderer.setStyle(this.element, 'transform-style', 'preserve-3d');
    this.renderer.setStyle(this.element, 'will-change', 'transform');
    
    this.createGlare();
  }

  private createGlare() {
    // Wrapper for glare
    const glareWrapper = this.renderer.createElement('div');
    this.renderer.setStyle(glareWrapper, 'position', 'absolute');
    this.renderer.setStyle(glareWrapper, 'top', '0');
    this.renderer.setStyle(glareWrapper, 'left', '0');
    this.renderer.setStyle(glareWrapper, 'width', '100%');
    this.renderer.setStyle(glareWrapper, 'height', '100%');
    this.renderer.setStyle(glareWrapper, 'overflow', 'hidden');
    this.renderer.setStyle(glareWrapper, 'pointer-events', 'none');
    this.renderer.setStyle(glareWrapper, 'border-radius', 'inherit');

    // Glare element
    this.glareElement = this.renderer.createElement('div');
    this.renderer.setStyle(this.glareElement, 'position', 'absolute');
    this.renderer.setStyle(this.glareElement, 'top', '50%');
    this.renderer.setStyle(this.glareElement, 'left', '50%');
    this.renderer.setStyle(this.glareElement, 'background-image', 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)');
    this.renderer.setStyle(this.glareElement, 'width', '200%');
    this.renderer.setStyle(this.glareElement, 'height', '200%');
    this.renderer.setStyle(this.glareElement, 'transform', 'translate(-50%, -50%) rotate(180deg)');
    this.renderer.setStyle(this.glareElement, 'opacity', '0');
    this.renderer.setStyle(this.glareElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.glareElement, 'transition', `opacity ${this.tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`);

    this.renderer.appendChild(glareWrapper, this.glareElement);
    this.renderer.appendChild(this.element, glareWrapper);
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.updateElementPosition();
    this.renderer.setStyle(this.element, 'transition', `transform ${this.tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`);
    if (this.glareElement) {
      this.renderer.setStyle(this.glareElement, 'opacity', '0.4');
    }
    
    // Clear transition after it completes to allow smooth following
    setTimeout(() => {
      this.renderer.setStyle(this.element, 'transition', '');
    }, this.tiltSpeed);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.updateCall !== null) cancelAnimationFrame(this.updateCall);
    
    this.updateCall = requestAnimationFrame(() => {
      const x = event.clientX - this.left;
      const y = event.clientY - this.top;
      
      const percentageX = x / this.width;
      const percentageY = y / this.height;
      
      const tiltX = ((this.tiltMax / 2) - (percentageY * this.tiltMax)).toFixed(2);
      const tiltY = ((percentageX * this.tiltMax) - (this.tiltMax / 2)).toFixed(2);
      
      this.renderer.setStyle(this.element, 'transform', `perspective(${this.tiltPerspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${this.tiltScale}, ${this.tiltScale}, ${this.tiltScale})`);
      
      // Update glare
      if (this.glareElement) {
        const angle = Math.atan2(event.clientY - (this.top + this.height / 2), event.clientX - (this.left + this.width / 2)) * (180 / Math.PI);
        this.renderer.setStyle(this.glareElement, 'transform', `translate(-50%, -50%) rotate(${angle}deg)`);
      }
    });
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.updateCall !== null) cancelAnimationFrame(this.updateCall);
    
    this.renderer.setStyle(this.element, 'transition', `transform ${this.tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`);
    this.renderer.setStyle(this.element, 'transform', `perspective(${this.tiltPerspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    
    if (this.glareElement) {
      this.renderer.setStyle(this.glareElement, 'transition', `opacity ${this.tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`);
      this.renderer.setStyle(this.glareElement, 'opacity', '0');
    }
  }

  private updateElementPosition() {
    const rect = this.element.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.left = rect.left;
    this.top = rect.top;
  }
}
