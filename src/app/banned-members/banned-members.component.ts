import { Component, effect } from '@angular/core';
import { UsersShimmerComponent } from '../users-shimmer/users-shimmer.component';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { UserStoreService } from '../user-store.service';
import { GroupsService } from '../groups.service';
import { IconComponent } from "../BaseComponents/icon/icon.component";

@Component({
  selector: 'app-banned-members',
  standalone: true,
  imports: [UsersShimmerComponent, AvatarComponent, CommonModule, IconComponent],
  templateUrl: './banned-members.component.html',
  styleUrl: './banned-members.component.css',
})
export class BannedMembersComponent {
  group: CometChat.Group | null = null;
  loading: boolean = true;
  constructor(
    private userStoreService: UserStoreService,
  ) {
    effect(() => {
      this.group = userStoreService.getSelectedGroup()();
    });
  }
  members: Array<CometChat.GroupMember> = [];

  ngOnInit() {
    this.loading = true;

    this.userStoreService.initGroupBannedMemberRequestBuilder();
    
    this.userStoreService.bannedGroupMembersList$.subscribe((groupMembers) => {
      console.log(groupMembers);
      this.members = groupMembers;
    });

    this.userStoreService.fetchNextBannedMembersList().then(()=>{
      this.loading = false;
    });
  }

  unbanUser = (uid: string) =>{
    console.log("unban user...", uid)
    this.userStoreService.unbanMembersInGroup(uid);
    this.members = this.members.filter(member => member.getUid() !== uid);
  }
}
