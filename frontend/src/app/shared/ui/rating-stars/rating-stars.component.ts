import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss',
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
