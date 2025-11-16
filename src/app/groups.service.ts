import { Injectable } from '@angular/core';
import {CometChat} from '@cometchat/chat-sdk-javascript';
import { BehaviorSubject } from 'rxjs';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private groupRequest?: CometChat.GroupsRequest;
  private groupsListSubject = new BehaviorSubject<Array<CometChat.Group>>([]);
  public groupsList$ = this.groupsListSubject.asObservable();


  constructor(private userStoreService: UserStoreService) {
    this.initGroupsRequestBuilder();

  }

  /**
   * Initialize request for users
   */
  initGroupsRequestBuilder() {
    // Clear previous users if any
    this.groupsListSubject.next([]);

    this.groupRequest = new CometChat.GroupsRequestBuilder().setLimit(20).build();
  }
  /**
   * Fetch next set of users
   */
  fetchNext(): Promise<CometChat.Group[]> {
    if (!this.groupRequest) {
      console.error('User request not initialized.');
      return Promise.resolve([]);
    }

    return this.groupRequest.fetchNext().then(
      (users: CometChat.Group[]) => {
        const currentUsers = this.groupsListSubject.getValue();
        this.groupsListSubject.next([...currentUsers, ...users]);
        console.log('users fetched', users);
        return users;
      },
      (error) => {
        console.error('User fetching failed:', error);
        return [];
      }
    );
  }
  flushData(){
    this.groupsListSubject.next([])
    this.initGroupsRequestBuilder();
  }
}
