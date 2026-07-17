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

  constructor() {
    this.analyticsService.init();
  }

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute?.snapshot?.url?.join('/') : '';
  }
}
