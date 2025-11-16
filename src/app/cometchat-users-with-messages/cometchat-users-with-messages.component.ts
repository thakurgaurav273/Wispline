import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import { MessageHeaderComponent } from '../message-header/message-header.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { Creds } from '../../AppConstants';
import { UserStoreService } from '../user-store.service';
import { Router } from '@angular/router';
import { IconComponent } from "../BaseComponents/icon/icon.component";
import { DetailsComponent } from "../details/details.component";
import { ThreadRepliesComponent } from "../thread-replies/thread-replies.component";

@Component({
  selector: 'app-cometchat-users-with-messages',
  standalone: true,
  imports: [
    MessageListComponent,
    CommonModule,
    ListComponent,
    MessageHeaderComponent,
    MessageComposerComponent,
    DetailsComponent,
    ThreadRepliesComponent
],
  templateUrl: './cometchat-users-with-messages.component.html',
  styleUrl: './cometchat-users-with-messages.component.css',
})
export class CometchatUsersWithMessagesComponent {
  chatWithUser: CometChat.User | null = null;
  chatWithGroup: CometChat.Group | null = null;
  showDetails: boolean = false;
  showThreadReply: boolean = false;
  constructor(private userStoreService: UserStoreService, private router: Router) {
    effect(() => {
      this.chatWithUser = this.userStoreService.getSelectedUser()();
      this.showDetails = this.userStoreService.shouldShowDetailsComponent()();
      this.chatWithGroup = this.userStoreService.getSelectedGroup()();
      this.showThreadReply = this.userStoreService.getParentMessage()() ? true : false;
    });
  }
}
