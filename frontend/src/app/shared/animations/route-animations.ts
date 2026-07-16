import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Set entering page to initial state
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px)',
      }),
    ], { optional: true }),

    // Animate the leaving page out and entering page in
    group([
      query(':leave', [
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'translateY(-10px)',
        })),
      ], { optional: true }),

      query(':enter', [
        animate('350ms 100ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)',
        })),
      ], { optional: true }),
    ]),
  ]),
]);
