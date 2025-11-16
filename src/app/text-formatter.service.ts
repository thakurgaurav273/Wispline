import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ITextFormatter, TextFormatterResult } from './interfaces/text-formatter.interface';

@Injectable({
  providedIn: 'root'
})
export class TextFormatterService {
  private formatters: Map<string, ITextFormatter> = new Map();
  private activeFormatters$ = new BehaviorSubject<string[]>([]);

  // Register a new formatter
  registerFormatter(formatter: ITextFormatter): void {
    if (this.formatters.has(formatter.name)) {
      console.warn(`Formatter '${formatter.name}' already registered. Overwriting.`);
    }
    this.formatters.set(formatter.name, formatter);
    this.updateActiveFormatters();
  }

  // Unregister a formatter
  unregisterFormatter(name: string): void {
    const formatter = this.formatters.get(name);
    if (formatter?.cleanup) {
      formatter.cleanup();
    }
    this.formatters.delete(name);
    this.updateActiveFormatters();
  }

  // Get a specific formatter
  getFormatter(name: string): ITextFormatter | undefined {
    return this.formatters.get(name);
  }

  // Get all formatters sorted by priority
  getAllFormatters(): ITextFormatter[] {
    return Array.from(this.formatters.values())
      .sort((a, b) => a.priority - b.priority);
  }

  // Get active formatters observable
  getActiveFormatters(): Observable<string[]> {
    return this.activeFormatters$.asObservable();
  }

  // Format text using all registered formatters
  formatText(text: string, cursorPos?: number): TextFormatterResult {
    let result: TextFormatterResult = { displayText: text, cursorPosition: cursorPos };
    
    const formatters = this.getAllFormatters();
    
    for (const formatter of formatters) {
      const formatterResult = formatter.format(result.displayText, result.cursorPosition);
      result = {
        displayText: formatterResult.displayText,
        cursorPosition: formatterResult.cursorPosition ?? result.cursorPosition,
        metadata: {
          ...result.metadata,
          [formatter.name]: formatterResult.metadata
        }
      };
    }
    
    return result;
  }

  // Parse formatted text using all registered formatters (in reverse order)
  parseText(formattedText: string): TextFormatterResult {
    let result: TextFormatterResult = { displayText: formattedText };
    
    const formatters = this.getAllFormatters().reverse();
    
    for (const formatter of formatters) {
      const parseResult = formatter.parse(result.displayText);
      result = {
        displayText: parseResult.displayText,
        metadata: {
          ...result.metadata,
          [formatter.name]: parseResult.metadata
        }
      };
    }
    
    return result;
  }

  // Handle input for all formatters
  handleInput(text: string, cursorPos: number): void {
    const formatters = this.getAllFormatters();
    
    for (const formatter of formatters) {
      if (formatter.handleInput) {
        formatter.handleInput(text, cursorPos);
      }
    }
  }

  private updateActiveFormatters(): void {
    this.activeFormatters$.next(Array.from(this.formatters.keys()));
  }
}
