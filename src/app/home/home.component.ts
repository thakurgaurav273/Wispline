import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { ConversationsComponent } from '../conversations/conversations.component';
import { Router } from '@angular/router';
import { UserStoreService } from '../user-store.service';
import { DetailsComponent } from '../details/details.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import { MessageHeaderComponent } from '../message-header/message-header.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { ThreadRepliesComponent } from '../thread-replies/thread-replies.component';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { GroupsComponent } from '../groups/groups.component';
import { ConfirmationPromptComponent } from '../confirmation-prompt/confirmation-prompt.component';
import { ThemeService } from '../theme.service';
import { MessagesService } from '../messages.service';
import {CometChat} from '@cometchat/chat-sdk-javascript';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ListComponent,
    ConversationsComponent,
    CommonModule,
    MessageListComponent,
    MessageHeaderComponent,
    MessageComposerComponent,
    GroupsComponent,
    DetailsComponent,
    ThreadRepliesComponent,
    IconComponent,
    ConfirmationPromptComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  selectedTab: 'chats' | 'calls' | 'users' | 'groups' = 'chats';
  selectedChatId: string | null = null;
  showMessages = false;
  chatWithUser: CometChat.User | null = null;
  chatWithGroup: CometChat.Group | null = null;
  showDetails: boolean = false;
  showThreadReply: boolean = false;
  theme: any = 'light';
  constructor(
    private userStoreService: UserStoreService,
    private router: Router,
    private themeService: ThemeService,
  ) {
    effect(() => {
      this.chatWithUser = this.userStoreService.getSelectedUser()();
      this.showDetails = this.userStoreService.shouldShowDetailsComponent()();
      this.chatWithGroup = this.userStoreService.getSelectedGroup()();
      this.showThreadReply = this.userStoreService.getParentMessage()()
        ? true
        : false;
    });

    this.themeService.getTheme().subscribe((theme) => {
      this.theme = theme;
      console.log('Theme received in chat component:', theme);
    });
  }

  onTabChange(tab: 'chats' | 'calls' | 'users' | 'groups') {
    this.selectedTab = tab;
    this.showMessages = false;
    this.selectedChatId = null;
  }

  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }
  ngAfterViewInit(){
    this.setupMessageListeners()
  }

  ngOnDestroy(){
    CometChat.removeMessageListener('message_listener')
  }
  onChatSelect(chatId: string) {
    this.selectedChatId = chatId;
    // this.showMessages = true;
  }

  onBackToChats() {
    this.showMessages = false;
    this.selectedChatId = null;
  }
  /**
   * Setup real-time message listeners
   */
  private setupMessageListeners() {
    const listenerID = 'message_listener';

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (message: CometChat.TextMessage) => {
          this.userStoreService.markAsDelivered(message);
          console.log("Marking delivered")
        },
        onMediaMessageReceived: (message: CometChat.MediaMessage) => {
          this.userStoreService.markAsDelivered(message);
        },
        onCustomMessageReceived: (message: CometChat.CustomMessage) => {
          this.userStoreService.markAsDelivered(message);
        },
      })
    );
  }

  getSelectedChat() {}
}
