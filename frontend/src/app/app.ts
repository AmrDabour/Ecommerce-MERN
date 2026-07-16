import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';
import { CartDrawer } from './shared/ui/cart-drawer/cart-drawer';
import { ChatbotComponent } from './shared/ui/chatbot/chatbot';
import { CustomCursorComponent } from './shared/ui/custom-cursor/custom-cursor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, CartDrawer, ChatbotComponent, CustomCursorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
