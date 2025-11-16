import {
  Directive, ElementRef, Input, Renderer2, SimpleChanges, OnChanges, Injector, AfterViewInit
} from '@angular/core';
import { BaseTextFormatter } from './base-text-formatter';
import { MentionsFormatter } from './mentions-formatter';
import { UrlFormatter } from './url-formatter';

@Directive({
  selector: '[appTextFormattingManager]',
  standalone: true
})
export class TextFormattingManager implements OnChanges, AfterViewInit {
  @Input('appTextFormattingManager') value: string = '';
  @Input() formatterData: { [key: string]: any } = {};
  @Input() activeFormatters: string[] = []; 
  
  private formatters: BaseTextFormatter[] = []; 
  private initialized: boolean = false; 

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private injector: Injector // Inject the Injector for manual lookup
  ) { }
  
  ngAfterViewInit(): void {
    // Fetch the sibling directives using the host element's injector
    try {
      const mentions = this.injector.get(MentionsFormatter, new MentionsFormatter(this.el, this.renderer));
      const url = this.injector.get(UrlFormatter, new UrlFormatter(this.el, this.renderer));

      if (mentions) this.formatters.push(mentions);
      if (url) this.formatters.push(url);
      this.initialized = true;
      
      // Run formatting if inputs were already received
      this.applyFormatting();
      
    } catch(e) {
      console.error("Failed to retrieve formatter directives from the host element injector.", e);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes || 'formatterData' in changes || 'activeFormatters' in changes) {
      // Only run formatting if directives have been fetched
      if (this.initialized) {
        this.applyFormatting();
      }
    }
  }

  private applyFormatting(): void {
    if (!this.value) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
      return;
    }

    // 1. Initial text should be fully escaped
    let currentText = this.escapeHtml(this.value);
    
    // 2. Filter formatters to run
    const formattersToRun = this.formatters.filter(formatter => {
      const name = formatter.constructor.name.toLowerCase().replace('formatter', '');
      return this.activeFormatters.length === 0 || this.activeFormatters.includes(name);
    });

    // 3. Run the pipeline
    for (const formatter of formattersToRun) {
      // Update child inputs and prevent child from setting DOM
      formatter.formatterData = this.formatterData;
      formatter.applyToDom = false;
      
      // Execute formatting logic
      currentText = formatter.getFormattedValue(currentText);
    }

    // 4. Final DOM update by the manager
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', currentText);

    // 5. Attach all event listeners
    this.attachEventListeners();
  }

  // --- Listener Handling ---

  private attachEventListeners(): void {
    this.attachMentionListeners();
    this.attachUrlListeners();
  }

  private attachMentionListeners(): void {
    const mentions = this.el.nativeElement.querySelectorAll('.mention-highlight[data-uid]');
    mentions.forEach((mention: HTMLElement) => {
      this.renderer.listen(mention, 'click', (event: MouseEvent) => {
        event.preventDefault();
        const uid = mention.getAttribute('data-uid');
        if (uid) {
          this.el.nativeElement.dispatchEvent(new CustomEvent('mentionClicked', { detail: { uid } }));
        }
      });
    });
  }

  private attachUrlListeners(): void {
    const urls = this.el.nativeElement.querySelectorAll('.url-highlight[href]');
    urls.forEach((url: HTMLElement) => {
      this.renderer.listen(url, 'click', (event: MouseEvent) => {
        event.preventDefault();
        const href = url.getAttribute('href');
        if (href) {
          this.el.nativeElement.dispatchEvent(new CustomEvent('urlClicked', { detail: { url: href } }));
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}