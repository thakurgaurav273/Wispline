import { Injectable } from '@angular/core';
import { TextFormatterResult } from './interfaces/text-formatter.interface';
import { MentionsService } from './mentions.service';

@Injectable({
  providedIn: 'root'
})
export class MentionsFormatterService {
  name = 'mentions';
  priority = 10;

  constructor(private mentionsService: MentionsService) {}

  format(text: string, cursorPos?: number): TextFormatterResult {
    // Convert message format to display format
    const { displayText, mentions } = this.mentionsService.parseMessageText(text);
    
    return {
      displayText,
      metadata: { mentions },
      cursorPosition: cursorPos
    };
  }

  parse(formattedText: string): TextFormatterResult {
    // Convert display format to message format
    const messageText = this.mentionsService.convertDisplayTextToMessageText(formattedText);
    const mentions = this.mentionsService.getCurrentMentions();
    
    return {
      displayText: messageText,
      metadata: { mentions }
    };
  }

  handleInput(text: string, cursorPos: number): void {
    this.mentionsService.handleMentionInput(text, cursorPos);
  }

  cleanup(): void {
    this.mentionsService.resetMentions();
  }
}
