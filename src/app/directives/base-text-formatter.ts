import { Directive, ElementRef, Input, Renderer2, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';

export interface FormatterConfig {
  cssClass?: string;
  style?: { [key: string]: string };
  [key: string]: any;
}

@Directive({
  selector: '[appBaseTextFormatter]',
  standalone: true
})
export abstract class BaseTextFormatter implements OnChanges, OnDestroy {
  @Input('appBaseTextFormatter') value: string = '';
  @Input() formatterData: { [key: string]: any } = {};
  @Input() config: FormatterConfig = {};
  @Input() applyToDom: boolean = true; // Crucial flag controlled by the Manager
  
  protected defaultConfig: FormatterConfig = {
    cssClass: 'formatter-default',
    style: {}
  };

  constructor(
    protected el: ElementRef,
    protected renderer: Renderer2
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes || 'formatterData' in changes || 'config' in changes) {
      this.applyFormatting();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  protected applyFormatting(): void {
    if (!this.value) {
      if (this.applyToDom) {
         this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
      }
      return;
    }

    const formattedHtml = this.formatText(this.value);
    
    // CONDITIONALLY apply to DOM
    if (this.applyToDom) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', formattedHtml);
      this.attachEventListeners();
    }
  }

  public getFormattedValue(text: string): string {
    // Used by the Manager to get the formatted output for the next step in the pipeline
    return this.formatText(text);
  }

  protected abstract formatText(text: string): string;

  protected attachEventListeners(): void {
    // Handled by the Manager
  }

  protected cleanup(): void { }

  protected createSpan(content: string, className: string, attributes?: { [key: string]: string }): string {
    const mergedConfig = { ...this.defaultConfig, ...this.config };
    const style = mergedConfig.style ? Object.entries(mergedConfig.style)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ') : '';

    const styleAttr = style ? `style="${style}"` : '';
    const attrs = attributes ? Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : '';

    return `<span class="${className}" ${attrs} ${styleAttr}>${content}</span>`;
  }

  protected escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  protected escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  setConfig(config: FormatterConfig): void {
    this.config = { ...this.config, ...config };
    this.applyFormatting();
  }

  getConfig(): FormatterConfig {
    return this.config;
  }
}