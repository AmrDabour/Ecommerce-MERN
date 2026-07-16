import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  
  protected email = signal('');
  protected isLoading = signal(false);

  protected subscribeToNewsletter(): void {
    if (!this.email() || !this.email().includes('@')) {
      this.toast.error('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);
    this.http.post(`${environment.apiUrl}/newsletter/subscribe`, { email: this.email() }).subscribe({
      next: () => {
        this.toast.success('Successfully subscribed!');
        this.email.set('');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.msg || 'Failed to subscribe');
        this.isLoading.set(false);
      }
    });
  }
}
