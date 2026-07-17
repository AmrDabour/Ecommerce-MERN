import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare const gtag: Function;
declare const fbq: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly router = inject(Router);
  
  // Dummy IDs for testing
  private readonly GA_TRACKING_ID = 'G-XXXXXXXXXX';
  private readonly FB_PIXEL_ID = 'XXXXXXXXXXXXXXXXX';

  public init(): void {
    // Initialize Pixel
    if (typeof fbq === 'function') {
      fbq('init', this.FB_PIXEL_ID);
    }

    // Subscribe to router events for pageviews
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Send pageview to Google Analytics
      if (typeof gtag === 'function') {
        gtag('config', this.GA_TRACKING_ID, {
          page_path: event.urlAfterRedirects
        });
      }
      
      // Send pageview to Meta Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'PageView');
      }
      
      console.log(`[Analytics] Tracked pageview for ${event.urlAfterRedirects}`);
    });
  }

  // Example method to track specific events (like AddToCart)
  public trackEvent(eventName: string, params?: any): void {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
    if (typeof fbq === 'function') {
      fbq('track', eventName, params);
    }
  }
}
