import { Injectable, Signal, signal } from '@angular/core';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { BehaviorSubject } from 'rxjs';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private convRequest?: CometChat.ConversationsRequest;
  private convListSubject = new BehaviorSubject<Array<CometChat.Conversation>>(
    []
  );
  loggedInUserId = '';
  public convList$ = this.convListSubject.asObservable();
  private conversationToDelete = signal<CometChat.Conversation | null>(null);

  constructor(private userStoreService: UserStoreService) {
    this.initConvRequestBuilder();
    this.loggedInUserId = userStoreService.getLoggedInUser()!.getUid();
  }
  /**
   * Initialize request for users
   */
  initConvRequestBuilder() {
    // Clear previous users if any
    this.convListSubject.next([]);

    this.convRequest = new CometChat.ConversationsRequestBuilder()
      .setLimit(20)
      .build();
  }

  updateConversationOnNewMessage(message: CometChat.BaseMessage) {
    const currentList = [...this.convListSubject.getValue()];
    const index = currentList.findIndex(
      (c) => c.getConversationId() === message.getConversationId()
    );
    if (index !== -1) {
      const updatedConv = currentList[index];
      // Update unread count only if message is from someone else
      if (message && message?.getSender().getUid() !== this.loggedInUserId) {
        updatedConv.setUnreadMessageCount(updatedConv.getUnreadMessageCount() + 1);
      }
  
      updatedConv.setLastMessage(message);
  
      // Move updated conversation to the top
      currentList.splice(index, 1);
      this.convListSubject.next([updatedConv, ...currentList]);
    }
  }

  getConversationToDelete(): Signal<CometChat.Conversation | null> {
    return this.conversationToDelete;
  }

  setConversationToDelete(conversation: CometChat.Conversation | null) {
    this.conversationToDelete.set(conversation);
  }
  /**
   * Fetch next set of conversations
   */
  fetchNext(): Promise<CometChat.Conversation[]> {
    if (!this.convRequest) {
      console.error('conversations request not initialized.');
      return Promise.resolve([]);
    }

    return this.convRequest.fetchNext().then(
      (conversations: CometChat.Conversation[]) => {
        const currentUsers = this.convListSubject.getValue();
        this.convListSubject.next([...currentUsers, ...conversations]);
        return conversations;
      },
      (error) => {
        console.error('conversations fetching failed:', error);
        return [];
      }
    );
  }

  flushData(){
    this.convListSubject.next([])
    this.initConvRequestBuilder();
  }
  ngOnDestroy(){
    CometChat.removeMessageListener('message_listener');
  }
}
