import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget.component';
import { CartDrawer } from './shared/ui/cart-drawer/cart-drawer';
import { MobileNavComponent } from './layout/mobile-nav/mobile-nav.component';
import { QuickView } from './shared/components/quick-view/quick-view';
import { QuickViewService } from './core/services/quick-view';
import { AnalyticsService } from './core/services/analytics';
import { routeAnimations } from './shared/animations/route-animations';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, ChatWidgetComponent, CartDrawer, MobileNavComponent, QuickView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations]
})
export class App {
  public readonly quickViewService = inject(QuickViewService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly swPush = inject(SwPush);
  private readonly router = inject(Router);

  constructor() {
    this.analyticsService.init();

    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe(({ action, notification }) => {
        // notification.data.url is where we store the URL to open
        if (notification.data && notification.data.url) {
          // If the URL is relative or matches our app, navigate internally
          try {
            const url = new URL(notification.data.url);
            if (url.origin === window.location.origin) {
              this.router.navigateByUrl(url.pathname + url.search + url.hash);
            } else {
              window.open(notification.data.url, '_blank');
            }
          } catch (e) {
            // It might be a relative URL
            this.router.navigateByUrl(notification.data.url);
          }
        }
      });
    }
  }

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute?.snapshot?.url?.join('/') : '';
  }
}
