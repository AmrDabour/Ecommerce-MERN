import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | undefined | null, symbol = '$'): string {
    if (value === null || value === undefined) {
      return `${symbol}0.00`;
    }
    return `${symbol}${value.toFixed(2)}`;
  }
}
