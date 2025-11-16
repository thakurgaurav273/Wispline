import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserStoreService } from '../user-store.service';
import { GroupsService } from '../groups.service';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { UsersShimmerComponent } from '../users-shimmer/users-shimmer.component';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-view-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarComponent,
    IconComponent,
    UsersShimmerComponent,
  ],
  templateUrl: './view-members.component.html',
  styleUrl: './view-members.component.css',
})
export class ViewMembersComponent {
  group: CometChat.Group | null = null;
  loading: boolean = true;
  loggedInUser: CometChat.User | null = null;
  constructor(
    private userStoreService: UserStoreService,
    private groupService: GroupsService,
    private messageService: MessagesService
  ) {
    effect(() => {
      this.group = userStoreService.getSelectedGroup()();
    });

    this.loggedInUser = userStoreService.getLoggedInUser();
  }
  @ViewChild('dropdown', { static: false }) dropdownRef!: ElementRef;
  @ViewChild('trigger', { static: false }) triggerRef!: ElementRef;
  members: Array<CometChat.GroupMember> = [];
  hoveredMember: string | null = null;
  activeMenu: string | null = null;
  showChangScopePopover: boolean = false;

  currentScope: string = 'participant';

  selectedScope: string = this.currentScope;

  scopes = ['participant', 'admin', 'moderator'];

  onSelect(scope: string) {
    this.selectedScope = scope;
  }

  save() {
    if (this.selectedScope !== this.currentScope) {
      console.log('Saving scope:', this.selectedScope);
      // emit event or call service
      this.showChangScopePopover = false;
    }
  }

  cancel() {
    // Close modal logic here
    this.showChangScopePopover = false;
  }

  ngOnInit() {
    this.loading = true;

    this.userStoreService.initGroupMembersRequestBuilder();
    this.userStoreService.groupMembersList$.subscribe((groupMembers) => {
      console.log(groupMembers);
      this.members = groupMembers;
      if (groupMembers.length > 0) {
        this.loading = false;
      }
    });

    this.userStoreService.fetchNextMembersList();
    // Initial load
    // this.loadMore();
  }

  searchTerm = '';

  get filteredMembers() {
    return this.members.filter((member) =>
      member.getName().toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  toggleMenu(userId: string) {
    this.activeMenu = this.activeMenu === userId ? null : userId;
  }

  kickMember(member: CometChat.GroupMember) {
    console.log('Kicking', member.getName());
    this.userStoreService.kickMemberFromGroup(member.getUid());
    this.messageService.createActionMessage(member,'kicked',this.group as any,this.loggedInUser as any);
    this.members = this.members.filter((val)=> val.getUid() !== member.getUid())
    this.activeMenu = null;
  }

  banMember(member: CometChat.GroupMember) {
    console.log('Banning', member.getName());
    this.userStoreService.banMembersInGroup(member.getUid());
    this.activeMenu = null;
  }

  changeScope(member: CometChat.GroupMember) {
    this.activeMenu = null;
    this.selectedScope = member.getScope();
    this.showChangScopePopover = true;
    console.log('Changing scope for', member.getName());
  }
}
