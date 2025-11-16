import { Component, effect } from '@angular/core';
import { Router } from '@angular/router';
import { UserStoreService } from '../user-store.service';
import { ConversationsComponent } from '../conversations/conversations.component';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from '../details/details.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import { MessageHeaderComponent } from '../message-header/message-header.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { ThreadRepliesComponent } from '../thread-replies/thread-replies.component';

@Component({
  selector: 'app-conversations-with-messages',
  standalone: true,
  imports: [
    MessageListComponent,
    CommonModule,
    ConversationsComponent,
    MessageHeaderComponent,
    MessageComposerComponent,
    DetailsComponent,
    ThreadRepliesComponent,
  ],
  templateUrl: './conversations-with-messages.component.html',
  styleUrl: './conversations-with-messages.component.css',
})
export class ConversationsWithMessagesComponent {
  chatWithUser: CometChat.User | null = null;
  chatWithGroup: CometChat.Group | null = null;
  showDetails: boolean = false;
  showThreadReply: boolean = false;
  constructor(
    private userStoreService: UserStoreService,
    private router: Router
  ) {
    effect(() => {
      this.chatWithUser = this.userStoreService.getSelectedUser()();
      this.showDetails = this.userStoreService.shouldShowDetailsComponent()();
      this.chatWithGroup = this.userStoreService.getSelectedGroup()();
      this.showThreadReply = this.userStoreService.getParentMessage()()
        ? true
        : false;
    });
  }
}
