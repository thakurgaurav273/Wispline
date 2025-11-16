import { Directive, ElementRef, Input, Renderer2, SimpleChanges, OnChanges } from '@angular/core';
import { TextFormatterService } from './text-formatter.service';
import { MentionsService } from './mentions.service';
import { UrlFormatterService } from './url-formatters.service';  // Import your url formatter

@Directive({
  selector: '[appTextFormatter]',
  standalone: true
})
export class TextFormatterDirective implements OnChanges {

  @Input('appTextFormatter') value: string = '';
  @Input() formatterType: 'mentions' | 'urls' | 'combined' = 'mentions';
  @Input() mentions: any[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private formatter: TextFormatterService,
    private mentionsService: MentionsService,
    private urlFormatterService: UrlFormatterService // Inject URL formatter
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes || 'mentions' in changes) {
      this.applyFormatting();
    }
  }

  private applyFormatting(): void {
    let html = this.value;

    switch (this.formatterType) {
      case 'mentions':
        html = this.mentionsService.formatMentions(html, this.mentions);
        break;
      case 'urls':
        html = this.urlFormatterService.formatUrls(html);
        break;
      case 'combined':
        // Apply mentions first, then URLs, or vice versa if needed
        html = this.mentionsService.formatMentions(html, this.mentions);
        html = this.urlFormatterService.formatUrls(html);
        break;
      default:
        break;
    }

    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html);
  }
}
