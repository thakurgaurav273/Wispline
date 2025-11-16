import { Injectable } from '@angular/core';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { BehaviorSubject } from 'rxjs';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private userRequest?: CometChat.UsersRequest;
  private usersListSubject = new BehaviorSubject<Array<CometChat.User>>([]);

  public usersList$ = this.usersListSubject.asObservable();

  constructor(private userStoreService: UserStoreService) {
    this.initUserRequestBuilder();
  }

  /**
   * Initialize request for users
   */
  initUserRequestBuilder() {
    // Clear previous users if any
    this.usersListSubject.next([]);

    this.userRequest = new CometChat.UsersRequestBuilder().setLimit(20).build();
  }

  /**
   * Fetch next set of users
   */
  fetchNext(): Promise<CometChat.User[]> {
    if (!this.userRequest) {
      console.error('User request not initialized.');
      return Promise.resolve([]);
    }

    return this.userRequest.fetchNext().then(
      (users: CometChat.User[]) => {
        const currentUsers = this.usersListSubject.getValue();
        this.usersListSubject.next([...currentUsers, ...users]);
        console.log('users fetched', users);
        return users;
      },
      (error) => {
        console.error('User fetching failed:', error);
        return [];
      }
    );
  }
  banUser() {
    const uid = this.userStoreService.getSelectedUser()()?.getUid() as string;
    CometChat.blockUsers([uid]).then(
      (list) => {
        console.log('users list blocked', { list });
      },
      (error) => {
        console.log('Blocking user fails with error', error);
      }
    );
  }
  unbanUser() {
    const uid = this.userStoreService.getSelectedUser()()?.getUid() as string;
    CometChat.unblockUsers([uid]).then(
      (list) => {
        console.log('users list unblocked', { list });
      },
      (error) => {
        console.log('unblocking user fails with error', error);
      }
    );
  }
  deleteChat(uid?: string, guid?: string, convType?: string) {
    let UID = uid
      ? uid
      : guid
      ? guid
      : this.userStoreService.getSelectedUser()()
      ? this.userStoreService.getSelectedUser()()?.getUid()
      : this.userStoreService.getSelectedGroup()()?.getGuid();
    let type = convType ? convType : this.userStoreService.getSelectedUser()() ? 'user' : 'group';
    CometChat.deleteConversation(UID as string, type).then(
      (deletedConversation) => {
        console.log(deletedConversation);
        this.userStoreService.setSelectedUser(null);
        this.userStoreService.setSelectedGroup(null);
        this.userStoreService.setShowBanUserDialog(false);
        this.userStoreService.setShowDeleteChatDialog(false);
        this.userStoreService.setShowDetailsComponent(false);
      },
      (error) => {
        console.log('error while deleting a conversation', error);
      }
    );
  }
  flushData(){
    this.usersListSubject.next([]);
    this.initUserRequestBuilder();
  }
}
