import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promo-banners',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promo-banners.component.html',
  styleUrls: ['./promo-banners.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoBannersComponent {}
