import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatMentions',
  standalone: true,
})
export class FormatMentionsPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, mentions: any = {}): SafeHtml {
    if (!text || Object.keys(mentions).length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    }

    const formattedText = this.parseMentions(text, mentions);
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }

  private parseMentions(text: string, mentions: any): string {
    let result = text;
    const mentionRegex = /<@uid:([^>]+)>/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const uid = match[1];
      const mentionData = mentions[uid];

      if (mentionData) {
        const name = mentionData.name || uid;
        const mentionHtml = `<span class=\'mention-highlight\' data-uid="${uid}" title="${name}">@${name}</span>`;
        result = result.replace(match[0], mentionHtml);
      }
    }

    return this.escapeHtmlExceptMentions(result);
  }

  private escapeHtmlExceptMentions(text: string): string {
    const mentionPattern = /<span class=\'mention-highlight\'[^>]*>.*?<\/span>/g;
    const parts = text.split(mentionPattern);
    const mentions = text.match(mentionPattern) || [];

    let result = '';
    for (let i = 0; i < parts.length; i++) {
      result += this.escapeHtml(parts[i]);
      if (mentions[i]) {
        result += mentions[i];
      }
    }

    return result;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}


// import { Pipe, PipeTransform } from '@angular/core';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// @Pipe({
//   name: 'formatMentions',
//   standalone: true,
// })
// export class FormatMentionsPipe implements PipeTransform {
//   constructor(private sanitizer: DomSanitizer) {}

//   transform(text: string, mentions: any = {}): SafeHtml {
//     if (!text) {
//       return this.sanitizer.bypassSecurityTrustHtml('');
//     }

//     if (Object.keys(mentions).length === 0) {
//       return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
//     }

//     const formattedText = this.parseMentionsSecurely(text, mentions);
//     return this.sanitizer.bypassSecurityTrustHtml(formattedText);
//   }

//   private parseMentionsSecurely(text: string, mentions: any): string {
//     // First, escape ALL HTML in the original text
//     const escapedText = this.escapeHtml(text);
    
//     // Then replace mention patterns with safe HTML
//     const mentionRegex = /&lt;@uid:([^&gt;]+)&gt;/g;
    
//     return escapedText.replace(mentionRegex, (match, uid) => {
//       const mentionData = mentions[uid];
      
//       if (mentionData) {
//         // Escape the name and uid to prevent XSS
//         const safeName = this.escapeHtml(mentionData.name || uid);
//         const safeUid = this.escapeHtml(uid);
        
//         return `<span class="mention-highlight" data-uid="${safeUid}" title="${safeName}">@${safeName}</span>`;
//       }
      
//       // If no mention data, return the escaped version
//       return match;
//     });
//   }

//   private escapeHtml(text: string): string {
//     if (!text) return '';
    
//     const div = document.createElement('div');
//     div.textContent = text;
//     return div.innerHTML;
//   }
// }

// // Alternative approach using a whitelist-based sanitizer
// @Pipe({
//   name: 'formatMentionsWhitelist',
//   standalone: true,
// })
// export class FormatMentionsWhitelistPipe implements PipeTransform {
//   constructor(private sanitizer: DomSanitizer) {}

//   transform(text: string, mentions: any = {}): SafeHtml {
//     if (!text) {
//       return this.sanitizer.bypassSecurityTrustHtml('');
//     }

//     const processedText = this.processTextWithWhitelist(text, mentions);
//     return this.sanitizer.bypassSecurityTrustHtml(processedText);
//   }

//   private processTextWithWhitelist(text: string, mentions: any): string {
//     const mentionRegex = /<@uid:([^>]+)>/g;
//     const parts: Array<{ type: 'text' | 'mention', content: string, uid?: string }> = [];
//     let lastIndex = 0;
//     let match;

//     // Split text into parts: regular text and mentions
//     while ((match = mentionRegex.exec(text)) !== null) {
//       // Add text before mention
//       if (match.index > lastIndex) {
//         parts.push({
//           type: 'text',
//           content: text.substring(lastIndex, match.index)
//         });
//       }
      
//       // Add mention
//       parts.push({
//         type: 'mention',
//         content: match[0],
//         uid: match[1]
//       });
      
//       lastIndex = match.index + match[0].length;
//     }

//     // Add remaining text
//     if (lastIndex < text.length) {
//       parts.push({
//         type: 'text',
//         content: text.substring(lastIndex)
//       });
//     }

//     // Process parts
//     return parts.map(part => {
//       if (part.type === 'text') {
//         // Escape all HTML in regular text
//         return this.escapeHtml(part.content);
//       } else {
//         // Process mention safely
//         const mentionData = mentions[part.uid!];
//         if (mentionData) {
//           const safeName = this.escapeHtml(mentionData.name || part.uid!);
//           const safeUid = this.escapeHtml(part.uid!);
//           return `<span class="mention-highlight" data-uid="${safeUid}" title="${safeName}">@${safeName}</span>`;
//         } else {
//           // If no mention data, escape and return as text
//           return this.escapeHtml(part.content);
//         }
//       }
//     }).join('');
//   }

//   private escapeHtml(text: string): string {
//     if (!text) return '';
    
//     const div = document.createElement('div');
//     div.textContent = text;
//     return div.innerHTML;
//   }
// }