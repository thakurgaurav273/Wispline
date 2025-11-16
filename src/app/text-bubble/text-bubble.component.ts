// import { CommonModule } from '@angular/common';
// import { Component, Inject, Input } from '@angular/core';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { FormatMentionsPipe } from '../format-mentions.pipe';
// import { UserStoreService } from '../user-store.service';
// import {CometChat} from '@cometchat/chat-sdk-javascript';
// import { TextFormatterDirective } from '../text-formatter.directive';

// @Component({
//   selector: 'app-text-bubble',
//   standalone: true,
//   imports: [CommonModule, FormatMentionsPipe, TextFormatterDirective],
//   templateUrl: './text-bubble.component.html',
//   styleUrl: './text-bubble.component.css',
// })
// export class TextBubbleComponent {
//   @Input() message: any = null;
//   constructor (private userStoreService: UserStoreService) {

//   }
//   onMentionClicked(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (target.classList.contains('mention-highlight')) {
//       const uid = target.getAttribute('data-uid');
//       console.log('Clicked mention UID:', uid);
//       CometChat.getUser(uid).then((user)=>{
//         this.userStoreService.setSelectedGroup(null);
//         this.userStoreService.setSelectedUser(user);
//       })
//     }
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormatMentionsPipe } from '../format-mentions.pipe';
import { UserStoreService } from '../user-store.service';
import {CometChat} from '@cometchat/chat-sdk-javascript';
import { TextFormatterDirective } from '../text-formatter.directive';
import { MentionsFormatter } from '../directives/mentions-formatter';
import { TextFormattingManager } from '../directives/text-formatting-manager';
import { UrlFormatter } from '../directives/url-formatter';

@Component({
  selector: 'app-text-bubble',
  standalone: true,
  imports: [CommonModule,  TextFormattingManager, MentionsFormatter, UrlFormatter],
  templateUrl: './text-bubble.component.html',
  styleUrl: './text-bubble.component.css',
})
export class TextBubbleComponent {
  @Input() message: any = null;
  constructor (private userStoreService: UserStoreService) {

  }
  onMentionClicked(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mention-highlight')) {
      const uid = target.getAttribute('data-uid');
      console.log('Clicked mention UID:', uid);
      CometChat.getUser(uid).then((user)=>{
        this.userStoreService.setSelectedGroup(null);
        this.userStoreService.setSelectedUser(user);
      })
    }
  }
}
