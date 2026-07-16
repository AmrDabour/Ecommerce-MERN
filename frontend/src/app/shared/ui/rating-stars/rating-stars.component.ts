import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rating"
      [class.rating--interactive]="interactive()"
      [attr.role]="interactive() ? 'radiogroup' : 'img'"
      [attr.aria-label]="'Rating: ' + displayRating() + ' out of 5'"
    >
      @for (star of stars; track star) {
        <button
          class="rating__star"
          [class.rating__star--filled]="star <= filledStars()"
          [class.rating__star--half]="star === filledStars() + 1 && hasHalf()"
          [disabled]="!interactive()"
          [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
          (click)="onStarClick(star)"
          (mouseenter)="onHover(star)"
          (mouseleave)="onHoverEnd()"
        >
          ★
        </button>
      }
      @if (showValue()) {
        <span class="rating__value">{{ displayRating().toFixed(1) }}</span>
      }
      @if (count() !== undefined && count()! > 0) {
        <span class="rating__count">({{ count() }})</span>
      }
    </div>
  `,
  styles: [`
    .rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .rating__star {
      font-size: 18px;
      color: var(--color-border);
      cursor: default;
      background: none;
      border: none;
      padding: 0;
      line-height: 1;
      transition: color var(--transition-fast), transform var(--transition-fast);
    }

    .rating__star--filled {
      color: #f59e0b;
    }

    .rating__star--half {
      color: #f59e0b;
      opacity: 0.5;
    }

    .rating--interactive .rating__star {
      cursor: pointer;

      &:hover {
        transform: scale(1.2);
      }
    }

    .rating__value {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text);
      margin-left: var(--space-1);
    }

    .rating__count {
      font-size: var(--text-xs);
      color: var(--color-text-tertiary);
    }
  `],
})
export class RatingStarsComponent {
  readonly value = input(0);
  readonly count = input<number | undefined>(undefined);
  readonly interactive = input(false);
  readonly showValue = input(false);
  readonly ratingChange = output<number>();

  readonly stars = [1, 2, 3, 4, 5];
  private hoverValue = signal(0);

  readonly displayRating = computed(() => {
    return this.hoverValue() > 0 ? this.hoverValue() : this.value();
  });

  readonly filledStars = computed(() => Math.floor(this.displayRating()));
  readonly hasHalf = computed(() => this.displayRating() % 1 >= 0.25);

  onStarClick(star: number): void {
    if (this.interactive()) {
      this.ratingChange.emit(star);
    }
  }

  onHover(star: number): void {
    if (this.interactive()) {
      this.hoverValue.set(star);
    }
  }

  onHoverEnd(): void {
    this.hoverValue.set(0);
  }
}
