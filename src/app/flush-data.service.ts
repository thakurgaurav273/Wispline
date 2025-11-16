import { Injectable } from '@angular/core';
import { ConversationService } from './conversation.service';
import { GroupsService } from './groups.service';
import { UsersService } from './users.service';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root',
})
export class FlushDataService {
  constructor(
    private coversationService: ConversationService,
    private groupService: GroupsService,
    private userService: UsersService,
    private userStoreService: UserStoreService
  ) {}

  flushAppData(){
    this.coversationService.flushData();
    this.groupService.flushData();
    this.userService.flushData();
    this.userStoreService.flushData();
  }
}
