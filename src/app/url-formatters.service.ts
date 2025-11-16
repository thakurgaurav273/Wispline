import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UrlFormatterService {
  private urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;

  formatUrls(text: string): string {
    return text.replace(this.urlRegex, (url) => {
      let href = url;
      if (!href.startsWith('http')) {
        href = 'http://' + href; // add protocol if missing
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="cometchat-url">${url}</a>`;
    });
  }
}
