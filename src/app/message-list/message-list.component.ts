import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  effect,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  ViewContainerRef,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import { MessagesService } from '../messages.service';
import { CommonModule, DatePipe } from '@angular/common';
import { UserStoreService } from '../user-store.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';

import { TemplateService } from '../template.service';
import { Subject, takeUntil } from 'rxjs';
import { BubbleService } from '../bubble.service';
import { ShimmerMessagesComponent } from '../shimmer-messages/shimmer-messages.component';
import { CometChat } from '@cometchat/chat-sdk-javascript';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MessageBubbleComponent, ShimmerMessagesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css',
})
export class MessageListComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: CometChat.BaseMessage[] = [];
  threadMessages: CometChat.BaseMessage[] = [];
  noMoreMessages = false;
  loggedInUserId: string = '';

  // Make scroll state instance-specific
  private previousScrollTop = 0;
  private scrollDebounceTimer: any;
  private isLoadingMore = false;
  private shouldScrollToBottom = true;
  private scrollToBottomTimeout: any;

  // Track current conversation to detect changes
  public currentConversationId: string | null = null;
  private currentParentMessageId: number | null = null;

  templateToUse: TemplateRef<any> | null = null;

  @ViewChild('defaultTextBubble', { static: true })
  defaultTextBubble!: TemplateRef<any>;

  @Input() listType: 'main' | 'thread' = 'main';
  @Input() hideStickyDate: boolean = false;
  @Input() hideDateSeparator: boolean = false;
  @Input() hideReceipts: boolean = false;
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageContainer', { read: ViewContainerRef })
  messageContainer!: ViewContainerRef;
  private initialScrollHandled = false; // top of class
  index: any;
  virtualizedListVisibleMessages: CometChat.BaseMessage[] = [];
  // Message options modal state
  showMessageOptions = false;
  selectedMessage: CometChat.BaseMessage | null = null;
  messageOptionsPosition = { top: '0px', left: '0px', right: 'auto' };
  private destroy$ = new Subject<void>();
  templatesReady = false;

  // Edit message state
  editingMessageId: string | null = null;
  editingText: string = '';
  parentMessageObject: any = null;
  threadLoading: boolean = false;
  mainLoading: boolean = false;

  configs = new Map<number, any>();

  // Add flags to prevent infinite loops
  private isInitializing = false;
  private lastInitializedContext: string | null = null;

  // Helper to return currently displayed list
  get activeMessages(): CometChat.BaseMessage[] {
    return this.listType === 'thread' ? this.threadMessages : this.messages;
  }

  constructor(
    private messageService: MessagesService,
    private userStoreService: UserStoreService,
    private bubbleWrapperService: BubbleService,
    private templateService: TemplateService,
    private cdr: ChangeDetectorRef,
  ) {
    // Only contains logic for state/initialization, no subscriptions here:
    effect(
      () => {
        if (this.isInitializing) return;

        const user = this.userStoreService.getSelectedUser()();
        const group = this.userStoreService.getSelectedGroup()();
        const parentMessage = this.userStoreService.getParentMessage()();
        this.parentMessageObject = parentMessage;

        // Early exit conditions
        if (this.listType === 'thread' && !parentMessage) {
          this.clearThreadMessages();
          return;
        }
        if (this.listType === 'main' && parentMessage) {
          return;
        }

        // Compute unique context
        const contextKey = this.createContextKey(user, group, parentMessage);
        if (this.lastInitializedContext === contextKey) return;

        this.isInitializing = true;
        try {
          if (user) {
            this.handleUserConversation(user, parentMessage, contextKey);
          } else if (group) {
            this.handleGroupConversation(group, parentMessage, contextKey);
          } else {
            this.handleNoSelection();
          }
        } finally {
          this.isInitializing = false;
        }
      },
      { allowSignalWrites: true }
    );

    // Keep this user login update
    effect(() => {
      const user = this.userStoreService.getLoggedInUser();
      this.loggedInUserId = user?.getUid() ?? '';
    });

    // SUBSCRIBE ONLY ONCE HERE with takeUntil for cleanup
    this.messageService.threadMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((msgs) => {
        this.handleMessagesUpdate(msgs, 'thread');
      });

    this.messageService.scrollToBottom$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (
          val.value &&
          ((val.message?.getParentMessageId() && this.listType === 'thread') ||
            (!val.message?.getParentMessageId() && this.listType === 'main'))
        ) {
          this.scrollToBottom();
        }
      });

    this.messageService.messagesList$
      .pipe(takeUntil(this.destroy$))
      .subscribe((msgs) => {
        console.log('list updating');
        this.handleMessagesUpdate(msgs, 'main');
      });
  }

  private createContextKey(user: any, group: any, parentMessage: any): string {
    const userId = user?.getUid() || '';
    const groupId = group?.getGuid() || '';
    const parentId = parentMessage?.getId() || '';
    return `${this.listType}-${userId}-${groupId}-${parentId}`;
  }

  private handleUserConversation(
    user: any,
    parentMessage: any,
    contextKey: string
  ) {
    const newConversationId = user.getUid();
    const newParentMessageId = parentMessage?.getId() || null;

    // Check if this is a new conversation
    const isNewConversation = this.currentConversationId !== newConversationId;
    const isNewThread = this.currentParentMessageId !== newParentMessageId;

    if (isNewConversation || isNewThread) {
      this.clearMessages();
      this.currentConversationId = newConversationId;
      this.currentParentMessageId = newParentMessageId;
      this.shouldScrollToBottom = true;
    }

    if (this.listType === 'thread' && parentMessage) {
      console.log('initializing thread request for user');
      this.messageService.initThreadMessages();
      this.lastInitializedContext = contextKey;
    } else if (this.listType === 'main' && !parentMessage) {
      // Only initialize if we don't have messages OR if it's a new conversation
      if (this.messages.length === 0 || isNewConversation) {
        this.messageService.initUserMessages(user.getUid());
        this.lastInitializedContext = contextKey;
      }
    }
  }

  private handleGroupConversation(
    group: any,
    parentMessage: any,
    contextKey: string
  ) {
    console.log('Fetching messages for group', group);
    const newConversationId = group.getGuid();
    const newParentMessageId = parentMessage?.getId() || null;

    // Check if this is a new conversation
    const isNewConversation = this.currentConversationId !== newConversationId;
    const isNewThread = this.currentParentMessageId !== newParentMessageId;

    if (isNewConversation || isNewThread) {
      this.clearMessages();
      this.currentConversationId = newConversationId;
      this.currentParentMessageId = newParentMessageId;
      this.shouldScrollToBottom = true;
    }

    if (this.listType === 'thread' && parentMessage) {
      console.log('initializing thread request for group');
      this.messageService.initThreadMessages();
      this.lastInitializedContext = contextKey;
    } else if (this.listType === 'main' && !parentMessage) {
      // Only initialize if we don't have messages OR if it's a new conversation
      if (this.messages.length === 0 || isNewConversation) {
        console.log('group received');
        this.messageService.initGroupMessages(group.getGuid());
        this.lastInitializedContext = contextKey;
      }
    }
  }

  private handleNoSelection() {
    this.clearMessages();
    this.currentConversationId = null;
    this.currentParentMessageId = null;
    this.lastInitializedContext = null;
  }

  private clearMessages() {
    if (this.listType === 'thread') {
      this.clearThreadMessages();
    } else {
      this.clearMainMessages();
    }
    this.noMoreMessages = false;
    this.isLoadingMore = false;
  }

  private clearMainMessages() {
    this.messages = [];
  }

  private clearThreadMessages() {
    this.threadMessages = [];
  }

  private handleMessagesUpdate(
    msgs: CometChat.BaseMessage[],
    type: 'main' | 'thread'
  ) {
    if (type !== this.listType) return;

    const scrollEl = this.scrollContainer?.nativeElement;
    const oldScrollHeight = scrollEl?.scrollHeight ?? 0;
    const oldScrollTop = scrollEl?.scrollTop ?? 0;
    const prevCount =
      type === 'thread' ? this.threadMessages.length : this.messages.length;

    // Do not assign same array
    const prevIds = (
      type === 'thread' ? this.threadMessages : this.messages
    ).map((m) => m.getId());
    const newIds = msgs.map((m) => m.getId());
    const isSame = prevIds.join(',') === newIds.join(',');
    if (!isSame) {
      this.scrollToBottom();
    }
    if (type === 'thread') {
      this.threadMessages = [...msgs];
      setTimeout(() => this.cdr.detectChanges(), 30);

      const lastMessage = this.threadMessages[this.threadMessages.length - 1];
      if (
        lastMessage &&
        !lastMessage.getReadAt() &&
        lastMessage.getSender().getUid() !== this.loggedInUserId
      ) {
        this.messageService.markAsRead(
          this.threadMessages[this.threadMessages.length - 1].getId().toString()
        );
      }
    } else {
      this.messages = [...msgs];
      console.log('message list updated.........');
      setTimeout(() => this.cdr.detectChanges(), 30);

      const lastMessage = this.messages[this.messages.length - 1];
      if (
        lastMessage &&
        !lastMessage.getReadAt() &&
        lastMessage.getSender().getUid() !== this.loggedInUserId
      ) {
        this.messageService.markAsRead(lastMessage.getId().toString());
      }
    }
    // Use double requestAnimationFrame for safest scroll restoration
    requestAnimationFrame(() => {
      if (!scrollEl) return;
      const newScrollHeight = scrollEl.scrollHeight;
      if (this.isLoadingMore && msgs.length > prevCount) {
        // Scroll delta for prepend
        scrollEl.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
        this.isLoadingMore = false;
      } else if (this.shouldScrollToBottom) {
        this.scrollToBottomInstant();
        this.shouldScrollToBottom = false;
      }
    });
  }

  listnerID: string = 'THISISMYCALLLISTENERIDIAMUSING';

  ngOnInit() {
    this.setupMessageListeners();
    this.messageService.isMainLoading$.subscribe((value: boolean) => {
      this.mainLoading = value;
      this.cdr.detectChanges();
    });
    this.messageService.isThreadLoading$.subscribe((value: boolean) => {
      this.threadLoading = value;
      this.cdr.detectChanges();
    });

    this.templateService.templatesReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ready) => {
        this.templatesReady = ready;
        if (ready) {
          console.log(
            'Templates are ready, can now render messages efficiently'
          );
        }
      });
  }

  ngAfterViewInit() {
    this.bubbleWrapperService
      .getMessageTextTemplate$()
      .subscribe((customTemplate) => {
        // console.log("custom template", customTemplate)
        this.templateToUse = customTemplate;
      });
    setTimeout(() => {
      this.scrollToBottomInstant();
      this.initialScrollHandled = true; // scroll is now settled
    }, 100);
  }

  getBubbleConfig(message: CometChat.BaseMessage): any {
    const type = message.getType();
    const category = message.getCategory();
    const template = this.bubbleWrapperService.getTemplate(category, type);
    return {
      template,
      context: { message, loggedInUserId: this.loggedInUserId },
    };
  }

  handleReplies(message: any) {
    this.showMessageOptions = false;
    this.userStoreService.setParentMessage(message);
  }

  private scrollToBottom() {
    const scrollEl = this.scrollContainer?.nativeElement;
    if (!scrollEl) return;

    scrollEl.scrollTo({
      top: scrollEl.scrollHeight,
      behavior: 'smooth',
    });
  }

  handleScroll() {
    const scrollEl = this.scrollContainer.nativeElement;
    if (scrollEl.scrollTop < 80) {
      this.loadMore();
      // Optionally: If window is at very top, call messageService.fetchPrevious()
    }
  }
  
  private scrollToBottomInstant() {
    const scrollEl = this.scrollContainer?.nativeElement;
    if (!scrollEl) return;
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  loadMore() {
    if (this.noMoreMessages || this.isLoadingMore) return;
    if (this.activeMessages.length === 0) return;

    this.isLoadingMore = true;
    if (this.listType === 'thread') {
      this.messageService
        .fetchPreviousThreadMessages()
        .then((newMessages) => {
          if (!newMessages || newMessages.length === 0) {
            this.noMoreMessages = true;
          }
        })
        .catch(() => {
          this.isLoadingMore = false;
        });
    } else {
      this.messageService
        .fetchPrevious()
        .then((newMessages) => {
          if (!newMessages || newMessages.length === 0) {
            this.noMoreMessages = true;
          }
        })
        .catch(() => {
          this.isLoadingMore = false;
        });
    }
  }

  // Message options modal methods
  openMessageOptions(event: MouseEvent, message: CometChat.BaseMessage) {
    event.stopPropagation();
    this.selectedMessage = message;
    this.showMessageOptions = true;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const isOwnMessage = message.getSender().getUid() === this.loggedInUserId;

    // Position the modal
    this.messageOptionsPosition = {
      top: `${rect.bottom + 10}px`,
      left: isOwnMessage ? 'auto' : `${rect.left}px`,
      right: isOwnMessage ? `${window.innerWidth - rect.right}px` : 'auto',
    };
  }

  // Get message info
  async getMessageInfo(message: CometChat.BaseMessage) {
    try {
      console.log('Message info:');
      this.closeMessageOptions();
    } catch (error) {
      console.error('Failed to get message info:', error);
    }
  }

  closeMessageOptions() {
    this.showMessageOptions = false;
    this.selectedMessage = null;
    this.editingMessageId = null;
    this.editingText = '';
  }

  // Message actions
  async editMessage(message: any) {
    this.messageService.setMessageToEdit(message);
    this.closeMessageOptions();
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
          this.messageService.handleIncomingMessage(message);
        },
        onMediaMessageReceived: (message: CometChat.MediaMessage) => {
          this.messageService.handleIncomingMessage(message);
        },
        onCustomMessageReceived: (message: CometChat.CustomMessage) => {
          this.messageService.handleIncomingMessage(message);
        },
        onMessageEdited: (message: CometChat.BaseMessage) => {
          this.messageService.handleMessageEdit(message);
        },
        onMessageDeleted: (message: CometChat.BaseMessage) => {
          this.messageService.handleMessageDelete(message);
        },
        onMessagesDelivered: (messageReceipt: CometChat.MessageReceipt) => {
          console.log("delivered", messageReceipt)
          this.messageService.updateDeliveryReceipt(
            messageReceipt,
            'delivered'
          );
        },
        onMessagesRead: (messageReceipt: CometChat.MessageReceipt) => {
          console.log("read", messageReceipt)

          this.messageService.updateDeliveryReceipt(messageReceipt, 'read');

        },
      })
    );

    let listenerIDs: string = 'UNIQUE_LISTENER_ID';

    CometChat.addMessageListener(listenerIDs, {
      onMessageReactionAdded: (message: any) => {
        console.log('Reaction added', message);
        this.messageService.onReactionUpdated(message, true);
      },
      onMessageReactionRemoved: (message: any) => {
        console.log('Reaction removed', message);
        this.messageService.onReactionUpdated(message, false);
      },
    });
  }
  async deleteMessage(messageId: number) {
    try {
      await this.messageService.deleteMessage(messageId);
      this.selectedMessage = null;
      this.showMessageOptions = false;
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }

  async sendMessage(text: string) {
    if (!text.trim()) return;

    try {
      // Set flag to scroll to bottom when sending a new message
      this.shouldScrollToBottom = true;

      if (this.listType === 'thread') {
        // await this.messageService.sendThreadMessage(text);
      } else {
        await this.messageService.sendTextMessage(text);
      }

      // Additional fallback in case the subscription doesn't trigger
      setTimeout(() => {
        if (this.shouldScrollToBottom) {
          this.scrollToBottom();
          this.shouldScrollToBottom = false;
        }
      }, 300);
    } catch (error) {
      console.error('Failed to send message:', error);
      this.shouldScrollToBottom = false;
    }
  }

  async sendMediaMessage(file: File, messageType: string) {
    try {
      this.shouldScrollToBottom = true;

      if (this.listType === 'thread') {
        // await this.messageService.sendThreadMediaMessage(file, messageType);
      } else {
        await this.messageService.sendMediaMessage(file, messageType);
      }

      // Additional fallback for media messages
      setTimeout(() => {
        if (this.shouldScrollToBottom) {
          this.scrollToBottom();
          this.shouldScrollToBottom = false;
        }
      }, 500); // Longer delay for media messages
    } catch (error) {
      console.error('Failed to send media message:', error);
      this.shouldScrollToBottom = false;
    }
  }

  showTrigger = false;
  hoveredMessageId: string | number | null = null;

  onMessageHover(id: string | number) {
    this.hoveredMessageId = id;
  }

  hideTrigger() {
    if (!this.showMessageOptions) {
      this.showTrigger = false;
      this.hoveredMessageId = null;
    }
  }

  // Helper methods
  canEditMessage(message: CometChat.BaseMessage): boolean {
    return message.getSender().getUid() === this.loggedInUserId;
  }

  canDeleteMessage(message: CometChat.BaseMessage): boolean {
    return message.getSender().getUid() === this.loggedInUserId;
  }

  getMessageReactions(message: CometChat.BaseMessage): any[] {
    // Return reactions if available in message data
    return message.getData()?.reactions || [];
  }

  hasUserReacted(message: CometChat.BaseMessage, emoji: string): boolean {
    const reactions = this.getMessageReactions(message);
    return reactions.some(
      (reaction: any) =>
        reaction.emoji === emoji &&
        reaction.reactedBy.some((user: any) => user.uid === this.loggedInUserId)
    );
  }

  isDateDifferent(ts1: number, ts2: number): boolean {
    const d1 = new Date(ts1 * 1000);
    const d2 = new Date(ts2 * 1000);

    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }

  shouldShowDateHeader(i: number): boolean {
    if (i === 0 || this.hideDateSeparator) return true; // First message always shows date

    const currentMessages =
      this.listType === 'thread' ? this.threadMessages : this.messages;
    const current = currentMessages[i];
    const previous = currentMessages[i - 1];

    if (!current || !previous) return false;
    return this.isDateDifferent(previous.getSentAt(), current.getSentAt());
  }

  // Improved onScroll method
  onScroll() {
    const scrollEl = this.scrollContainer?.nativeElement;
    if (!scrollEl || this.noMoreMessages || this.isLoadingMore) return;

    // Avoid loadMore being triggered when initial scroll position is at bottom
    if (!this.initialScrollHandled) return;

    const currentScrollTop = scrollEl.scrollTop;
    const scrollingUp = currentScrollTop < this.previousScrollTop;
    this.previousScrollTop = currentScrollTop;

    if (!scrollingUp) return;

    if (this.scrollDebounceTimer) clearTimeout(this.scrollDebounceTimer);

    this.scrollDebounceTimer = setTimeout(() => {
      const messageHeight = 60; // Adjust based on your average bubble height
      const threshold = messageHeight * 4;

      // Either very near top, or actually at the top
      if (scrollEl.scrollTop <= threshold || scrollEl.scrollTop <= 10) {
        this.loadMore();
      }
    }, 75);
  }

  ngOnDestroy() {
    if (this.scrollDebounceTimer) clearTimeout(this.scrollDebounceTimer);
    if (this.scrollToBottomTimeout) clearTimeout(this.scrollToBottomTimeout);
    CometChat.removeCallListener(this.listnerID);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
