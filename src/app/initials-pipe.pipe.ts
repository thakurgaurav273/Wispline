import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initialsPipe',
  standalone: true
})
export class InitialsPipePipe implements PipeTransform {

  transform(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, 2) // keep first 2 words only if desired
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return initials;
  }

}
