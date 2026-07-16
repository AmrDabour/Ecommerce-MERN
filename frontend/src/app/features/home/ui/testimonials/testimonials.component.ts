import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent {
  testimonials = signal<Testimonial[]>([
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      text: 'Absolutely blown away by the quality. The packaging was premium, and the product exceeded all my expectations.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Tech Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      text: 'Best shopping experience I have had in a long time. Fast shipping and the customer service is unmatched.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emma Watson',
      role: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      text: 'I was hesitant at first, but the minimalist design and build quality are incredible. Highly recommend!',
      rating: 4
    }
  ]);
}
