import { Component, effect } from '@angular/core';
import { UserStoreService } from '../user-store.service';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { ConfirmationPromptComponent } from '../confirmation-prompt/confirmation-prompt.component';
import { ViewMembersComponent } from '../view-members/view-members.component';
import { BannedMembersComponent } from '../banned-members/banned-members.component';
import { AddMembersComponent } from "../add-members/add-members.component";

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    IconComponent,
    AvatarComponent,
    CommonModule,
    ConfirmationPromptComponent,
    ViewMembersComponent,
    BannedMembersComponent,
    AddMembersComponent
],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  user: CometChat.User | null = null;
  group: CometChat.Group | null = null;
  title: string = 'User Info';
  showDetailsPage = false;
  showBlockModal = false;
  showDeleteChatModal = false;
  activeTab: 'members' | 'banned' = 'members';
  showAddMembers = false;
  showDeleteConversation = false;
  setShowAddMembers(show: boolean) {
    this.showAddMembers = show;
  }

  onBackClick = () =>{
    this.showAddMembers = false;
  }
  constructor(private userStoreService: UserStoreService) {
    effect(() => {
      this.user = this.userStoreService.getSelectedUser()();
      this.group = this.userStoreService.getSelectedGroup()();
      console.log(this.user);
      if (this.group) {
        this.title = 'Group Info';
      }else{
        this.title = 'User Info'
      }
    });
    effect(() => {
      this.showDetailsPage =
        this.userStoreService.shouldShowDetailsComponent()();
    });
  }

  setActiveTab(tab: 'members' | 'banned') {
    this.activeTab = tab;
  }

  handleBlockUser() {
    this.showDeleteConversation = true;
    this.userStoreService.setShowBanUserDialog(true);
  }
  onClose() {
    this.userStoreService.setShowDetailsComponent(false);
  }
  handleDeleteChatCallback() {
    this.showDeleteConversation = true;
    this.userStoreService.setShowDeleteChatDialog(true);
  }

  handleLeaveGroup() {
    this.showDeleteConversation = true;
    this.userStoreService.setShowLeaveGroupDialog(true);
  }
}
