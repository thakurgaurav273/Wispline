import { Directive, ElementRef, Input, Renderer2, SimpleChanges } from '@angular/core';
import { BaseTextFormatter } from './base-text-formatter';

export interface Mention {
  uid: string;
  name: string;
  avatar?: string;
}

@Directive({
  selector: '[appMentionsFormatter]',
  standalone: true
})
export class MentionsFormatter extends BaseTextFormatter {
  private mentions: Mention[] = [];
  @Input('appMentionsFormatter') 
  override value: string = '';
  
  constructor(
    el: ElementRef,
    renderer: Renderer2
  ) {
    super(el, renderer);
    this.defaultConfig = {
      cssClass: 'mention-highlight',
      style: {
        'color': '#0066cc',
        'font-weight': 'bold',
        'cursor': 'pointer'
      }
    };
  }

  override ngOnChanges(changes: SimpleChanges): void {
    // Only update the mentions list based on formatterData
    if (changes['formatterData'] && changes['formatterData'].currentValue?.mentions) {
      this.mentions = changes['formatterData'].currentValue.mentions;
    }
  }

  setMentions(mentions: Mention[]): void {
    this.mentions = mentions;
  }

  getMentions(): Mention[] {
    return this.mentions;
  }

  private getUserNameByUid(uid: string, mentions?: any[]): string {
    if (!Array.isArray(mentions)) {
      return uid; // or fallback to uid if mentions is invalid
    }
    const mention = mentions.find(m => m.uid === uid);
    return mention ? mention.name : uid;
  }
  

  protected formatText(text: string): string {  
    // Look for the escaped marker: &lt;@uid:...&gt;
      const formattedText = text.replace(/&lt;@uid:([\w-]+)&gt;/g, (match, uid) => {
        const name = this.getUserNameByUid(uid, this.mentions);
        // Escape the display name (dynamic content) but inject unescaped HTML span
        return this.createSpan(
          `@${this.escapeHtml(name)}`, 
          this.defaultConfig.cssClass!,
          { 'data-uid': uid, title: name }
        );
      });
      return formattedText;
    }
  
  // Event listeners are handled by the Manager
  protected override attachEventListeners(): void { }
}