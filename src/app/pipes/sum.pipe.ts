import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum'
})
export class SumPipe implements PipeTransform {

  transform(items: number[]): number {
    return items.reduce((a, b) => a + b, 0);
  }
}
