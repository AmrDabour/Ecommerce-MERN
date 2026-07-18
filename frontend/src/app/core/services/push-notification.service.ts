import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly swPush = inject(SwPush);

  async requestSubscription(): Promise<void> {
    if (!this.swPush.isEnabled) {
      console.warn('Push notifications are not supported/enabled in this browser.');
      this.toast.error('Push notifications are not supported in this browser.');
      return;
    }

    try {
      const vapidData: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/notifications/vapid-public-key`));
      
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: vapidData.publicKey
      });

      await firstValueFrom(this.http.post(`${environment.apiUrl}/notifications/subscribe`, sub));
      
      this.toast.success('Successfully subscribed to notifications!');
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      this.toast.error('Failed to enable push notifications.');
    }
  }

  async unsubscribe(): Promise<void> {
    if (!this.swPush.isEnabled) return;

    try {
      // First get current subscription to send to backend for removal
      let sub;
      this.swPush.subscription.subscribe(s => sub = s);
      
      if (sub) {
        await firstValueFrom(this.http.post(`${environment.apiUrl}/notifications/unsubscribe`, { endpoint: (sub as any).endpoint }));
        await this.swPush.unsubscribe();
        this.toast.info('Unsubscribed from notifications.');
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
    }
  }
}
