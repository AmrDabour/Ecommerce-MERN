import { Component, HostListener, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-cursor.html',
  styleUrls: ['./custom-cursor.scss']
})
export class CustomCursorComponent implements OnInit, OnDestroy {
  protected mouseX = signal(0);
  protected mouseY = signal(0);
  protected trailingX = signal(0);
  protected trailingY = signal(0);
  protected isHovering = signal(false);
  protected isHidden = signal(true); // Hidden by default until mouse moves

  private animationFrameId: number | null = null;
  private readonly easing = 0.15; // Lower is slower/smoother trailing

  ngOnInit() {
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.isHidden.set(false);
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
    
    // Check if hovering over clickable element
    const target = event.target as HTMLElement;
    const isClickable = target.closest('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    this.isHovering.set(!!isClickable);
  }

  @HostListener('window:mouseout', ['$event'])
  onMouseOut(event: MouseEvent) {
    if (event.relatedTarget === null) {
      this.isHidden.set(true); // Mouse left the window
    }
  }

  private animate = () => {
    // Smooth trailing calculation
    const dx = this.mouseX() - this.trailingX();
    const dy = this.mouseY() - this.trailingY();
    
    this.trailingX.update(x => x + dx * this.easing);
    this.trailingY.update(y => y + dy * this.easing);
    
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
