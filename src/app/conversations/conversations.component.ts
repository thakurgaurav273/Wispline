import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MessagesService } from '../messages.service';
import { UserStoreService } from '../user-store.service';
import { ConversationService } from '../conversation.service';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { UsersService } from '../users.service';
import { ConfirmationPromptComponent } from '../confirmation-prompt/confirmation-prompt.component';
import { ShimmerChatListComponent } from '../shimmer-chat-list/shimmer-chat-list.component';
import { FlushDataService } from '../flush-data.service';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [
    TitleCasePipe,
    CommonModule,
    AvatarComponent,
    IconComponent,
    ClickOutsideDirective,
    ConfirmationPromptComponent,
    ShimmerChatListComponent,
  ],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.css',
})
export class ConversationsComponent {
  @Input() title: string = 'Chats';
  @Input() loadingStateView!: TemplateRef<any>;
  @Input() listType: 'users' | 'chats' | 'group' = 'users';

  list: Array<CometChat.Conversation> = [];
  loading: boolean = false;
  noMoreItems = false;
  showMenuPopover: boolean = false;
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;
  user: CometChat.User | null = null;
  selectedConversation: CometChat.Conversation | null = null;
  isOutgoing = false;
  loggedInUserId = '';
  showDeleteConversation = false;
  constructor(
    private convService: ConversationService,
    private userStoreService: UserStoreService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private flushDataService: FlushDataService,
    private messageService: MessagesService
  ) {
    effect(() => {
      this.user = this.userStoreService.getLoggedInUser();
    });
    this.loggedInUserId = this.userStoreService.getLoggedInUser()!.getUid();
  }
  openedOptionsFor: string | null = null;
  ngOnInit(): void {
    if (this.listType === 'users') {
      this.convService.convList$.subscribe((users) => {
        this.list = users;
      });
      // Initial load
      this.loadMore();
    }
    this.convService.fetchNext()
    this.setupMessageListeners();
  }
  toggleMoreOptions(item: any, event: MouseEvent) {
    event.stopPropagation();
    const id = item.getConversationId();
    this.openedOptionsFor = this.openedOptionsFor === id ? null : id;
  }

  ngOnDestroy() {
    CometChat.removeMessageListener('message_listener');
    this.convService.flushData();
  }

  isMoreOptionsOpen(item: any) {
    return this.openedOptionsFor === item.getConversationId();
  }

  receiptStatus: 'sent' | 'delivered' | 'read' = 'sent';

  getSubtitleView(conversation: CometChat.Conversation): string {
    const lastMessage: CometChat.BaseMessage = conversation.getLastMessage();
    if (!lastMessage) return 'Click to start conversation';

    const category = lastMessage.getCategory?.();
    const type = lastMessage.getType?.();
    const sender = lastMessage?.getSender?.();
    const senderUid = sender?.getUid?.();
    const isMine = senderUid === this.loggedInUserId;

    // Handle message categories
    if (category === CometChat.CATEGORY_MESSAGE) {
      const prefix = isMine ? 'You: ' : ``;
      let content = '';

      switch (type) {
        case CometChat.MESSAGE_TYPE.TEXT:
          const rawText = lastMessage.getData().text || '';
          // Get mentions from the message (adjust this based on your CometChat message structure)
          const mentions = lastMessage.getMentionedUsers?.() || [];
          content = this.formatMentionsInText(rawText, mentions);
          break;
        case CometChat.MESSAGE_TYPE.IMAGE:
          content = '📷 Image';
          break;
        case CometChat.MESSAGE_TYPE.VIDEO:
          content = '🎥 Video';
          break;
        case CometChat.MESSAGE_TYPE.AUDIO:
          content = '🎵 Audio';
          break;
        case CometChat.MESSAGE_TYPE.FILE:
          content = '📎 File';
          break;
        default:
          content = 'Unsupported message';
      }

      return `${prefix}${content}`;
    }

    // Handle action messages (like member added, banned, etc.)
    if (category === CometChat.CATEGORY_ACTION) {
      return (lastMessage as any).getMessage?.(); // Already formatted by CometChat
    }

    // Handle call messages
    if (category === CometChat.CATEGORY_CALL) {
      return isMine ? 'Outgoing Call' : `Incoming Call`;
    }

    return '';
  }

  private formatMentionsInText(text: string, mentions: any[] = []): string {
    if (!text || mentions.length === 0) {
      return text;
    }
  
    let result = text;
    const mentionRegex = /<@uid:([^>]+)>/g;
    let match;
  
    // Reset regex lastIndex to ensure it works correctly in loops
    mentionRegex.lastIndex = 0;
  
    while ((match = mentionRegex.exec(text)) !== null) {
      const uid = match[1];
      
      // Find the user in the mentions array by uid
      const mentionData = mentions.find(user => user.uid === uid);
  
      if (mentionData) {
        const name = mentionData.name || uid;
        // For subtitle view, we'll use plain text instead of HTML
        result = result.replace(match[0], `@${name}`);
      } else {
        // If no mention data found, still show @uid
        result = result.replace(match[0], `@${uid}`);
      }
    }
  
    return result;
  }

  shouldShowReceiptIcon(message: CometChat.BaseMessage): boolean {
    const sender = message?.getSender?.()?.getUid?.();
    return (
      sender === this.loggedInUserId && message.getCategory() === 'message'
    );
  }

  private setupMessageListeners() {
    const listenerID = 'message_listener';

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (message: CometChat.TextMessage) => {
          // this.handleIncomingMessage(message);
          console.log('Mssg received');
          this.convService.updateConversationOnNewMessage(message);
          this.cdr.detectChanges();
        },
        onMediaMessageReceived: (message: CometChat.MediaMessage) => {
          // this.handleIncomingMessage(message);
          this.convService.updateConversationOnNewMessage(message);
          this.cdr.detectChanges();
        },
        onCustomMessageReceived: (message: CometChat.CustomMessage) => {
          // this.handleIncomingMessage(message);
          this.convService.updateConversationOnNewMessage(message);
          this.cdr.detectChanges();
        },
        onMessageEdited: (message: CometChat.BaseMessage) => {
          // this.handleMessageEdit(message);
          this.convService.updateConversationOnNewMessage(message);
          this.cdr.detectChanges();
        },
        onMessageDeleted: (message: CometChat.BaseMessage) => {
          // this.handleMessageDelete(message);
          this.convService.updateConversationOnNewMessage(message);
          this.cdr.detectChanges();
        },
      })
    );
  }

  getReceiptStatus(message: CometChat.BaseMessage): string {
    if (message.getReadAt()) {
      return 'assets/status_read.svg';
    } else if (message.getDeliveredAt()) {
      return 'assets/status_delivered.svg';
    } else {
      return 'assets/status_sent.svg';
    }
  }

  handleOptionClick(option: any, item: any, event: MouseEvent) {
    event.stopPropagation();
    if (option.onClick) {
      option.onClick(item);
      console.log('clicked', item);
    }
    this.openedOptionsFor = null;
  }
  hoveredItemId: string | null = null;

  onMouseEnter(item: any) {
    this.hoveredItemId = item.getConversationId();
  }

  onMouseLeave() {
    this.hoveredItemId = null;
    this.openedOptionsFor = null;
  }
    
  options = [
    {
      id: 'delete',
      title: 'Delete',
      iconURL: 'assets/delete_icon.svg',
      onClick: (item: any) => {
        console.log('Delete clicked');
        this.showDeleteConversation = true;
        this.userStoreService.setShowDeleteChatDialog(true);
        this.convService.setConversationToDelete(item);
      },
    },

    {
      id: 'pin',
      title: 'Pin',
      iconURL: 'assets/pin.svg',
      onClick: (item: any) => {},
    },
  ];

  getName(conv: CometChat.Conversation) {
    if (conv.getConversationType() === 'group') {
      const group = conv.getConversationWith() as CometChat.Group;
      return group.getName();
    } else {
      const user = conv.getConversationWith() as CometChat.User;
      return user.getName();
    }
  }

  getAvatar(conv: CometChat.Conversation) {
    if (conv.getConversationType() === 'group') {
      const group = conv.getConversationWith() as CometChat.Group;
      return group.getIcon();
    } else {
      const user = conv.getConversationWith() as CometChat.User;
      return user.getAvatar();
    }
  }
  onScroll() {
    const scrollEl = this.scrollContainer?.nativeElement;
    if (!scrollEl || this.loading || this.noMoreItems) return;

    const threshold = 300; // pixels from bottom

    const scrollPosition = scrollEl.scrollTop + scrollEl.clientHeight;
    const scrollHeight = scrollEl.scrollHeight;

    if (scrollHeight - scrollPosition <= threshold) {
      this.loadMore();
    }
  }

  handleConversationClick(conv: CometChat.Conversation) {
    this.selectedConversation = conv;
    if (
      conv.getLastMessage() &&
      !conv.getLastMessage().readAt &&
      conv.getLastMessage().getSender().getUid() !== this.user?.getUid()
    ) {
      this.messageService.markAsRead(conv.getLastMessage().getId()).then(()=>{
        conv.setUnreadMessageCount(0);
      })
    }
    if (conv.getConversationType() === 'group') {
      this.userStoreService.setSelectedUser(null);
      const group = conv.getConversationWith() as CometChat.Group;
      this.userStoreService.setSelectedGroup(group);
    } else {
      this.userStoreService.setSelectedGroup(null);
      const user = conv.getConversationWith() as CometChat.User;
      this.userStoreService.setSelectedUser(user);
    }
  }

  loadMore() {
    if (this.loading || this.noMoreItems) return;

    this.loading = true;

    this.convService.fetchNext().then((newUsers) => {
      this.loading = false;

      if (!newUsers || newUsers.length === 0) {
        this.noMoreItems = true;
      }
    });
  }
  async logout() {
    CometChat.logout().then((user) => {
      console.log('User logged-out successfully...');
      this.user = null;
      this.userStoreService.setLoggedInUser(null)
      this.router.navigate(['']);
      this.flushDataService.flushAppData();
    });
  }
}
