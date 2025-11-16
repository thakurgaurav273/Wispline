import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { BaseMessage, CometChat } from '@cometchat/chat-sdk-javascript';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserStoreService } from './user-store.service';
import { ConversationService } from './conversation.service';
import { ReactionsService } from './reactions.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private messageRequest?: CometChat.MessagesRequest;
  private messagesSubject = new BehaviorSubject<Array<CometChat.BaseMessage>>(
    []
  );
  private threadRequest?: CometChat.MessagesRequest;
  public messagesList$ = this.messagesSubject.asObservable();
  public isLoading: WritableSignal<boolean> = signal(true);
  private currentConversationId: string = '';
  private isGroupConversation: boolean = false;
  public chatWithUser: string = '';
  public loggedInUserId: string = '';
  private scrollToBottomSubject = new BehaviorSubject<{
    value: boolean;
    message: BaseMessage | null;
  }>({ value: false, message: null });
  public scrollToBottom$ = this.scrollToBottomSubject.asObservable();

  private threadMessagesSubject = new BehaviorSubject<CometChat.BaseMessage[]>(
    []
  );

  private defaultCategories = [
    'message',
    'action',
    'custom',
    'call',
    'interactive',
  ];
  private defaultTypes = [
    'text',
    'image',
    'audio',
    'video',
    'file',
    'groupMember',
    'form',
    'scheduler',
    'card',
    'meeting',
    'extension_poll',
  ];

  public threadMessages$ = this.threadMessagesSubject.asObservable();

  private currentParentMessageId: number | undefined = undefined;

  public messageToEdit: WritableSignal<CometChat.TextMessage | null> =
    signal(null);
  public isMainLoading$ = new BehaviorSubject<boolean>(true);
  public isThreadLoading$ = new BehaviorSubject<boolean>(true);
  constructor(
    private userStoreService: UserStoreService,
    private conversationService: ConversationService,
    private reactionsService: ReactionsService
  ) {
    this.loggedInUserId = userStoreService.getLoggedInUser()!.getUid();
    effect(() => {
      this.currentParentMessageId = this.userStoreService
        .getParentMessage()()
        ?.getId();
    });
  }

  /**
   * Initialize message request for user
   */

  initThreadMessages() {
    this.isThreadLoading$.next(true);
    this.threadMessagesSubject.next([]); // clear previous
    this.threadRequest = this.chatWithUser
      ? new CometChat.MessagesRequestBuilder()
        .setCategories(this.defaultCategories)
        .setTypes(this.defaultTypes)
        .setParentMessageId(this.currentParentMessageId as any)
        .setUID(this.chatWithUser)
        .setLimit(20)
        .build()
      : new CometChat.MessagesRequestBuilder()
        .setCategories(this.defaultCategories)
        .setTypes(this.defaultTypes)
        .setParentMessageId(this.currentParentMessageId as any)
        .setLimit(20)
        .build();

    this.fetchPreviousThreadMessages();
  }

  // ADDITIONAL FIX: Update fetchPreviousThreadMessages with better logging
  fetchPreviousThreadMessages(): Promise<CometChat.BaseMessage[]> {
    console.log('fetchPreviousThreadMessages called');

    if (!this.threadRequest) {
      console.error('Thread message request not initialized.');
      this.isThreadLoading$.next(false); // Add this line
      return Promise.resolve([]);
    }

    if (!this.currentParentMessageId) {
      console.error('No parent message ID available');
      this.isThreadLoading$.next(false); // Add this line
      return Promise.resolve([]);
    }
    this.isThreadLoading$.next(true);
    return this.threadRequest.fetchPrevious().then(
      (messages: CometChat.BaseMessage[]) => {
        console.log('Thread messages fetched:', messages.length);
        this.isThreadLoading$.next(false);
        if (messages && messages.length > 0) {
          const currentMessages = this.threadMessagesSubject.getValue();
          const updatedMessages = [...messages, ...currentMessages];
          console.log(
            'Updating thread messages subject with:',
            updatedMessages.length,
            'messages'
          );
          this.threadMessagesSubject.next(updatedMessages);
          this.isThreadLoading$.next(false);
        } else {
          console.log('No thread messages found');
          this.isThreadLoading$.next(false);
        }
        return messages;
      },
      (error) => {
        console.error('Thread message fetching failed:', error);
        this.isThreadLoading$.next(false);
        return [];
      }
    );
  }

  initUserMessages(uid: string, parentMessageId?: number) {
    // Clear previous messages
    this.isMainLoading$.next(true);
    this.messagesSubject.next([]);
    this.currentConversationId = uid;
    this.isGroupConversation = false;
    this.chatWithUser = uid;
    this.messageRequest = parentMessageId
      ? new CometChat.MessagesRequestBuilder()
        .setParentMessageId(parentMessageId)
        .setCategories(this.defaultCategories)
        .setTypes(this.defaultTypes)
        .setUID(uid)
        .setLimit(20)
        .build()
      : new CometChat.MessagesRequestBuilder()
        .setUID(uid)
        .setCategories(this.defaultCategories)
        .setTypes(this.defaultTypes)
        .setLimit(20)
        .hideReplies(true)
        .build();

    this.fetchPrevious();
  }

  /**
   * Initialize message request for group
   */
  initGroupMessages(guid: string, parentMessageId?: number) {
    // Clear previous messages

    this.isMainLoading$.next(true);
    this.messagesSubject.next([]);

    this.currentConversationId = guid;
    this.isGroupConversation = true;

    this.messageRequest = parentMessageId
      ? new CometChat.MessagesRequestBuilder()
        .setGUID(guid)
        .setLimit(20)
        .setCategories(this.defaultCategories)
        .setTypes(this.defaultTypes)
        .setParentMessageId(parentMessageId)
        .build()
      : new CometChat.MessagesRequestBuilder()
        .setGUID(guid)
        .setLimit(20)
        .setCategories(this.defaultCategories)
        .setTypes(this.defaultTypes)
        .hideReplies(true)
        .build();

    this.fetchPrevious();
  }

  /**
   * Fetch previous messages
   */
  fetchPrevious(): Promise<CometChat.BaseMessage[]> {
    console.log('Inside fech');
    if (!this.messageRequest) {
      console.error('Message request not initialized.');
      this.isMainLoading$.next(false);
      return Promise.resolve([]);
    }

    this.isMainLoading$.next(true);
    return this.messageRequest.fetchPrevious().then(
      (messages: CometChat.BaseMessage[]) => {
        if (messages && messages.length > 0) {
          const currentMessages = this.messagesSubject.getValue();
          // Prepend new messages to maintain chronological order
          this.messagesSubject.next([...messages, ...currentMessages]);
        }
        this.isMainLoading$.next(false);
        return messages;
      },
      (error) => {
        console.error('Message fetching failed:', error);
        this.isMainLoading$.next(false);
        return [];
      }
    );
  }

  /**
   * Add a new message to the list (for real-time updates)
   */
  addMessage(message: CometChat.BaseMessage) {
    if (message.getParentMessageId()) {
      const currentThreadMessages = this.threadMessagesSubject.getValue();
      this.threadMessagesSubject.next([...currentThreadMessages, message]);
    } else {
      const currentMessages = this.messagesSubject.getValue();
      this.messagesSubject.next([...currentMessages, message]);
    }
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    this.messagesSubject.next([]);
    this.threadMessagesSubject.next([]);
  }

  /**
   * Handle incoming messages
   */
  public handleIncomingMessage(message: CometChat.BaseMessage) {
    const isRelevantMessage = this.isGroupConversation
      ? message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
      message.getReceiverId() === this.currentConversationId
      : message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
      (message.getSender().getUid() === this.currentConversationId ||
        message.getReceiverId() === this.currentConversationId);

    if (isRelevantMessage) {
      this.scrollToBottomSubject.next({ value: true, message: message });
      this.addMessage(message);
    }
  }

  /**
   * Handle message edit updates
   */

  getMessageById(id: number | string) {
    let messageKey = this.messagesSubject
      .getValue()
      .findIndex((m) => m.getId() == id);
    if (messageKey > -1) {
      return this.messagesSubject.getValue()[messageKey];
    } else {
      return false;
    }
  }

  public handleMessageEdit(editedMessage: CometChat.BaseMessage) {
    const currentMessages = this.messagesSubject.getValue();
    const messageIndex = currentMessages.findIndex(
      (msg) => msg.getId() === editedMessage.getId()
    );

    if (messageIndex !== -1) {
      const newMessages = [...currentMessages];
      newMessages[messageIndex] = editedMessage;
      this.messagesSubject.next(newMessages);
    }
  }

  /**
   * Handle message delete updates
   */
  public handleMessageDelete(deletedMessage: CometChat.BaseMessage) {
    const currentMessages = this.messagesSubject.getValue();

    const updatedMessages = currentMessages.map((msg) => {
      if (msg.getId() === deletedMessage.getId()) {
        // Locally mark the message as deleted
        (msg as any).deletedAt = Date.now();
      }
      return msg;
    });

    this.messagesSubject.next(updatedMessages);
  }

  public updateDeliveryReceipt(
    receipt: CometChat.MessageReceipt,
    action: 'delivered' | 'read'
  ) {
    const currentMessages = this.messagesSubject.getValue();
    const receiptMsgId = Number(receipt.getMessageId());

    const updatedMessages = currentMessages.map((msg) => {
      const msgId = Number(msg.getId());

      // Clone message if we need to modify it
      let updatedMessage = msg;

      if (action === 'delivered' && msgId === receiptMsgId && !msg.getDeliveredAt()) {
        updatedMessage = Object.assign(Object.create(Object.getPrototypeOf(msg)), msg);
        updatedMessage.setDeliveredAt(receipt.getDeliveredAt());
      }

      if (action === 'read' && msgId <= receiptMsgId && !msg.getReadAt()) {
        updatedMessage = Object.assign(Object.create(Object.getPrototypeOf(msg)), msg);
        updatedMessage.setReadAt(receipt.getReadAt());
      }

      return updatedMessage;
    });

    this.messagesSubject.next(updatedMessages);
  }
  /**
   * Handle reaction updates
   */
  // private handleReactionUpdate(reaction: CometChat.ReactionEvent) {
  //   const currentMessages = this.messagesSubject.getValue();
  //   const messageIndex = currentMessages.findIndex(
  //     msg => msg.getId() === reaction.getMessageId()
  //   );

  //   if (messageIndex !== -1) {
  //     const updatedMessages = [...currentMessages];
  //     const message = updatedMessages[messageIndex];

  //     // Update the message with new reaction data
  //     // Note: You might need to fetch the updated message from CometChat
  //     // as the reaction event might not contain the full message data
  //     this.fetchMessageById(reaction.getMessageId()).then(updatedMessage => {
  //       if (updatedMessage) {
  //         updatedMessages[messageIndex] = updatedMessage;
  //         this.messagesSubject.next(updatedMessages);
  //       }
  //     });
  //   }
  // }

  /**
   * Edit a message
   */
  async editMessage(
    mid: number,
    newText: string
  ): Promise<CometChat.BaseMessage | null> {
    try {
      let receiverID = this.chatWithUser;
      let messageText = newText;
      let receiverType = CometChat.RECEIVER_TYPE.USER;
      let textMessage = new CometChat.TextMessage(
        receiverID,
        messageText,
        receiverType
      );
      textMessage.setId(mid);
      const message = await CometChat.editMessage(textMessage);
      this.handleMessageEdit(message);
      return message;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    messageId: number
  ): Promise<CometChat.BaseMessage | null> {
    try {
      const message = await CometChat.deleteMessage(messageId.toString());
      this.handleMessageDelete(message);
      return message;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  sendMeetingBubble(callType: string) {
    let receiverID = this.currentConversationId;
    let customData = {
      callType: callType,
      sessionId: this.currentConversationId,
    };
    let customType = 'meeting';
    let receiverType = CometChat.RECEIVER_TYPE.GROUP;
    let customMessage = new CometChat.CustomMessage(
      receiverID,
      receiverType,
      customType,
      customData
    );

    CometChat.sendCustomMessage(customMessage).then(
      (message) => {
        console.log('custom message sent successfully', message);
        this.addMessage(message);
      },
      (error) => {
        console.log('custom message sending failed with error', error);
      }
    );
  }

  /**
   * Get reactions for a message
   */
  async getReactions(
    message: CometChat.BaseMessage
  ): Promise<CometChat.ReactionCount[]> {
    try {
      const reactions = message.getReactions();
      return reactions;
    } catch (error) {
      console.error('Error getting reactions:', error);
      return [];
    }
  }

  /**
   * Fetch a specific message by ID
   */
  private async fetchMessageById(
    messageId: string
  ): Promise<CometChat.BaseMessage | null> {
    try {
      const message = await CometChat.getMessageDetails(messageId);
      return message;
    } catch (error) {
      console.error('Error fetching message by ID:', error);
      return null;
    }
  }

  getMessageForEdit(): any {
    // Return message object with text and id
    // This would typically come from your backend or local storage
    return this.messageToEdit();
  }

  setMessageToEdit(message: CometChat.TextMessage | null): any {
    this.messageToEdit.set(message);
  }
  // Method to clear editing state
  clearEditingMessage(): void {
    // Clear any editing state in your service
    this.setMessageToEdit(null);
    console.log('Clearing edit state');
  }

  createActionMessage = (
    actionOn: CometChat.GroupMember,
    action: string,
    group: CometChat.Group,
    loggedInUser: CometChat.User
  ) => {
    try {
      const actionMessage = new CometChat.Action(
        group.getGuid(),
        'groupMember',
        'group',
        'action' as CometChat.MessageCategory
      );
      actionMessage.setAction(action);
      actionMessage.setActionBy(loggedInUser);
      actionMessage.setSender(loggedInUser);
      actionMessage.setMessage(
        `${loggedInUser.getName()} ${action} ${actionOn.getName()}`
      );
      actionMessage.setActionFor(group);
      actionMessage.setActionOn(actionOn);
      actionMessage.setReceiver(group);
      actionMessage.setConversationId('group_' + group.getGuid());
      actionMessage.setSentAt(Date.now() / 1000);
      actionMessage.setReceiverType('group');
      actionMessage.setData({
        extras: {
          scope: {
            new: actionOn.getScope(),
          },
        },
      });

      this.addMessage(actionMessage);
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Send a new message
   */
  async sendTextMessage(
    text: string,
    parentMessageID?: number
  ): Promise<CometChat.TextMessage | null> {
    try {
      const message = new CometChat.TextMessage(
        this.currentConversationId,
        text,
        this.isGroupConversation
          ? CometChat.RECEIVER_TYPE.GROUP
          : CometChat.RECEIVER_TYPE.USER
      );
      message.setSentAt(Date.now());
      if (parentMessageID) {
        message.setParentMessageId(parentMessageID);
      }
      const currentMessages = this.messagesSubject.getValue();
      const updatedMessages = currentMessages.map((msg) => {
        if (msg.getId?.() === message.getParentMessageId?.()) {
          const currentCount = msg.getReplyCount?.() ?? 0;
          msg.setReplyCount?.(currentCount + 1);
          console.log('Updated parent message:', msg);
        }
        return msg;
      });

      this.messagesSubject.next([...updatedMessages]);
      const sentMessage = await CometChat.sendMessage(message);
      this.addMessage(sentMessage);
      this.conversationService.updateConversationOnNewMessage(sentMessage);
      this.scrollToBottomSubject.next({ value: true, message: message });
      return sentMessage as CometChat.TextMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  onReactionAddedByUser(message: BaseMessage) {
    const currentMessages = this.messagesSubject.getValue();
    const messageIndex = currentMessages.findIndex(
      (msg) => msg.getId() === message.getId()
    );
    const updatedMessages = [...currentMessages];
    updatedMessages[messageIndex] = message;
    this.messagesSubject.next(updatedMessages);
  }

  // Update your onReactionUpdated method to work with ReactionsService
  onReactionUpdated(message: CometChat.ReactionEvent, isAdded: boolean) {
    const messageId = message.getReaction()?.getMessageId();
    const messageObject = this.getMessageById(messageId);
    if (!messageObject) {
      return false;
    }

    let action: CometChat.REACTION_ACTION;
    if (isAdded) {
      action = CometChat.REACTION_ACTION.REACTION_ADDED;
    } else {
      action = CometChat.REACTION_ACTION.REACTION_REMOVED;
    }

    let modifiedMessage =
      CometChat.CometChatHelper.updateMessageWithReactionInfo(
        messageObject,
        message.getReaction(),
        action
      );

    // let modifiedMessage = messageObject;
    console.log(modifiedMessage, 'modified message\n\n\n');
    if (modifiedMessage instanceof CometChat.BaseMessage) {
      const currentMessages = this.messagesSubject.getValue();
      const messageIndex = currentMessages.findIndex(
        (msg) => msg.getId() === modifiedMessage.getId()
      );
      const updatedMessages = [...currentMessages];
      updatedMessages[messageIndex] = modifiedMessage;
      this.messagesSubject.next(updatedMessages);

      // Notify ReactionsService about the update
      this.reactionsService.emitReactionUpdate(
        modifiedMessage.getId(),
        modifiedMessage.getReactions() || [],
        action
      );
    }
    return true;
  }
  /**
   * Send a media message
   */
  /**
   * Send a media message, accepting either File or Blob
   */
  async sendMediaMessage(
    media: File | Blob,
    messageType: string
  ): Promise<CometChat.MediaMessage | null> {
    try {
      // Convert Blob to File if necessary
      const file = media instanceof File ? media : new File([media], 'recorded-media.' + this.getFileExtension(messageType), { type: media.type });

      const message = new CometChat.MediaMessage(
        this.currentConversationId,
        file,
        messageType,
        this.isGroupConversation
          ? CometChat.RECEIVER_TYPE.GROUP
          : CometChat.RECEIVER_TYPE.USER
      );

      const tempId = Date.now();
      const pendingMessage = new CometChat.MediaMessage(
        this.currentConversationId,
        file,
        messageType,
        this.isGroupConversation
          ? CometChat.RECEIVER_TYPE.GROUP
          : CometChat.RECEIVER_TYPE.USER
      );

      const loggedInUser = await CometChat.getLoggedinUser();
      // assign temp ID and attach a preview URL if needed
      pendingMessage.setId(tempId);
      pendingMessage.setData({ attachments: [URL.createObjectURL(media)] });
      pendingMessage.setSender(loggedInUser as any);
      (pendingMessage as any).sentAt = Date.now() / 1000;
      this.addMessage(pendingMessage);

      const currentMessages = this.messagesSubject.getValue();
      const index = currentMessages.findIndex(
        (msg) => (msg as any).id === tempId
      );
      const sentMessage = await CometChat.sendMessage(message);
      if (index !== -1) {
        const updatedMessages = [...currentMessages];
        updatedMessages[index] = sentMessage;
        this.messagesSubject.next(updatedMessages);
        this.conversationService.updateConversationOnNewMessage(sentMessage);
      } else {
        // Fallback in case not found
        this.addMessage(sentMessage);
      }
      return sentMessage as CometChat.MediaMessage;
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  // Helper to get file extension based on media type
  private getFileExtension(mediaType: string): string {
    switch (mediaType) {
      case 'audio':
        return 'mp3'; // or 'webm', 'ogg' as appropriate
      case 'video':
        return 'mp4'; // or 'mov', etc.
      case 'image':
        return 'png'; // or 'jpg', 'jpeg'
      default:
        return 'bin';
    }
  }


  /**
   * Mark messages as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      await CometChat.markAsRead(
        messageId,
        this.currentConversationId,
        this.isGroupConversation
          ? CometChat.RECEIVER_TYPE.GROUP
          : CometChat.RECEIVER_TYPE.USER,
        this.loggedInUserId
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  /**
   * Get message info (delivery receipts, read receipts)
   */
  async getMessageInfo(messageId: string): Promise<CometChat.MessageReceipt[]> {
    try {
      const messageInfo: any = await CometChat.getMessageReceipts(messageId);
      return messageInfo;
    } catch (error) {
      console.error('Error getting message info:', error);
      return [];
    }
  }

  /**
   * Clean up listeners when service is destroyed
   */
  ngOnDestroy() {
    CometChat.removeMessageListener('message_listener');
  }
}
