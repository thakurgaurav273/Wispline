import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { UserStoreService } from '../user-store.service';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { UsersShimmerComponent } from '../users-shimmer/users-shimmer.component';
import { CometChat, GroupMember } from '@cometchat/chat-sdk-javascript';

@Component({
  selector: 'app-add-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    AvatarComponent,
    UsersShimmerComponent,
  ],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.css',
})
export class AddMembersComponent {
  searchTerm = '';
  selectedUserIds: Set<string> = new Set();
  selectedMember: Array<GroupMember> = [];
  loading: boolean = true;
  @Output() back = new EventEmitter<void>();

  goBack() {
    this.back.emit();
  }
  users: Array<CometChat.User> = [];

  constructor(private userStoreService: UserStoreService) {
    // effect(()=>{
    //   this.group = userStoreService.getSelectedGroup()();
    // })
  }

  ngOnInit() {
    this.loading = true;
    this.userStoreService.initAddMemberRequestBuilder();
    this.userStoreService.addMembersList$.subscribe((usersList) => {
      console.log(usersList);
      this.users = usersList;
      if (usersList.length > 0) {
        this.loading = false;
      }
    });

    this.userStoreService.fetchNextAddMembersList();
    // Initial load
    // this.loadMore();
  }

  toggleSelection(userId: string) {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
      this.selectedMember = this.selectedMember.filter((mem)=> mem.getUid() !== userId);
    } else {
      this.selectedMember.push(
        new CometChat.GroupMember(
          userId,
          CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT
        )
      );
      this.selectedUserIds.add(userId);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUserIds.has(userId);
  }

  get filteredUsers() {
    return this.users.filter((user) =>
      user.getName().toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addMembers() {
    this.userStoreService.addMembersToGroup(this.selectedMember)
    this.userStoreService.initGroupMembersRequestBuilder();
    this.userStoreService.fetchNextMembersList();
    this.back.emit();
  }
}
