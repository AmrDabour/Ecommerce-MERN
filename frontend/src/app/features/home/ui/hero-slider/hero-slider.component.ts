import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Slide {
  image: string;
  subtitle: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  position: 'left' | 'center' | 'right';
  theme: 'dark' | 'light';
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  slides: Slide[] = [
    {
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
      subtitle: 'Premium Audio',
      title: 'Immerse in\nPure Sound',
      description: 'Discover the next generation of high-fidelity wireless headphones. Designed for audiophiles.',
      ctaText: 'Shop Audio',
      ctaLink: '/products',
      position: 'left',
      theme: 'dark'
    },
    {
      image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=2070&auto=format&fit=crop',
      subtitle: 'New Collection',
      title: 'Minimalist\nSneakers',
      description: 'Step into comfort with our latest collection of premium, handcrafted footwear.',
      ctaText: 'Explore Collection',
      ctaLink: '/products',
      position: 'right',
      theme: 'light'
    },
    {
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop',
      subtitle: 'Smart Wearables',
      title: 'Technology\nMeets Style',
      description: 'Track your fitness, stay connected, and look great doing it with our new smartwatch line.',
      ctaText: 'View Wearables',
      ctaLink: '/products',
      position: 'left',
      theme: 'light'
    }
  ];

  activeSlide = signal<number>(0);
  private intervalId: any;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 6000);
  }

  stopAutoplay() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  next() {
    this.activeSlide.update(curr => (curr + 1) % this.slides.length);
  }

  prev() {
    this.activeSlide.update(curr => curr === 0 ? this.slides.length - 1 : curr - 1);
  }

  goTo(index: number) {
    this.activeSlide.set(index);
    this.stopAutoplay();
    this.startAutoplay();
  }
}
