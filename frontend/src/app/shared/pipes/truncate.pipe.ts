import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | undefined | null, maxLength = 100, suffix = '...'): string {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength).trim() + suffix;
  }
}
