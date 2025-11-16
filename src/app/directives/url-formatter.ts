import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { BaseTextFormatter } from './base-text-formatter';

@Directive({
  selector: '[appUrlFormatter]',
  standalone: true
})
export class UrlFormatter extends BaseTextFormatter {
  private urlRegex = /(https?:\/\/[^\s<>\"\']+)/g;
  @Input('appUrlFormatter')
  override value: string = '';
  
  constructor(
    el: ElementRef,
    renderer: Renderer2
  ) {
    super(el, renderer);
    this.defaultConfig = {
      cssClass: 'url-highlight',
      style: {
        'color': 'white',
        'text-decoration': 'underline',
        'cursor': 'pointer'
      }
    };
  }
  
  // Event listeners are handled by the Manager
  protected override attachEventListeners(): void { }

  protected formatText(text: string): string {
    if (!text) return text;

    const mergedConfig = { ...this.defaultConfig, ...this.config };
    // Replace URLs in the current text (which may contain previously injected spans)
    return text.replace(this.urlRegex, (url) => {
      return this.createSpan(
        url,
        mergedConfig.cssClass!,
        { 'href': url, 'target': '_blank', 'rel': 'noopener noreferrer' }
      );
    });
  }
}