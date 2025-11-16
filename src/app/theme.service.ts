import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<'light' | 'dark'>('light');

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme$.next(theme);
  }

  getTheme() {
    return this.currentTheme$.asObservable();
  }

  getCurrentThemeValue() {
    return this.currentTheme$.value;
  }
}
