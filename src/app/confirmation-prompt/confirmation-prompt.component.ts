import { CommonModule } from '@angular/common';
import { Component, effect, Input } from '@angular/core';
import { UserStoreService } from '../user-store.service';
import { UsersService } from '../users.service';
import { ConversationService } from '../conversation.service';

@Component({
  selector: 'app-confirmation-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-prompt.component.html',
  styleUrl: './confirmation-prompt.component.css',
})
export class ConfirmationPromptComponent {
  showConvDeleteModal: boolean = false;
  showSuccessToast: boolean = false;
  showBan: boolean = false;
  showDeleteChat: boolean = false;
  showLeaveGroup: boolean = false;
  currentUser: CometChat.User | undefined | null = undefined;
  conversationToDelete: CometChat.Conversation | null = null;
  @Input() title: string = 'Delete Conversation';
  @Input() modalText: string =
    'Are you sure you want to delete this conversation?';
  constructor(
    private userStoreService: UserStoreService,
    private userService: UsersService,
    private conversationService: ConversationService
  ) {
    effect(() => {
      const showDelete = this.userStoreService.shouldShowDeleteChatDialog();
      const showBan = this.userStoreService.shouldShowBanUserDialog();
      const leaveGroup = this.userStoreService.shouldShowLeaveDialog();
      this.currentUser = this.userStoreService.getSelectedUser()();
      this.conversationToDelete =
        this.conversationService.getConversationToDelete()();

      if (this.conversationToDelete) {
        console.log('conversation delete', this.conversationToDelete);
        this.showDeleteChat = true;
        console.log(this.showDeleteChat, 'conversatoin goe');
        this.title = 'Delete Conversation';
        this.modalText = 'Are you sure you want to delete this conversation?';
      }
      else if (showDelete()) {
        this.showDeleteChat = true;
        this.title = 'Delete Conversation';
        this.modalText = 'Are you sure you want to delete this conversation?';
      } else if (showBan()) {
        this.showBan = true;
        if (!this.currentUser?.getBlockedByMe()) {
          this.title = 'Block this contact?';
          this.modalText =
            "Are you sure you want to block this contact? You won't receive messages from them anymore.";
        } else {
          this.title = 'Unblock this contact?';
          this.modalText =
            'Are you sure you want to unblock this contact? You will start receive messages from them.';
        }
      } else if (leaveGroup()) {
        this.showLeaveGroup = true;
        this.title = 'Leave Group';
        this.modalText = 'Are you sure you want to leave this group?';
      } else {
        this.showConvDeleteModal = false;
        this.showBan = false;
        this.showDeleteChat = false;
      }
    });
  }
  confirmation() {
    if (this.showBan) {
      this.showBan = false;
      if (!this.currentUser?.getBlockedByMe()) {
        this.userService.banUser();
        this.currentUser = this.currentUser?.setBlockedByMe(true) as any;
      } else {
        this.userService.unbanUser();
        this.currentUser = this.currentUser?.setBlockedByMe(false) as any;
      }
      this.showConvDeleteModal = false;
      this.userStoreService.setShowBanUserDialog(false);
    } else if (this.conversationToDelete) {
      if (this.conversationToDelete.getConversationType() === 'group') {
        const group =
          this.conversationToDelete.getConversationWith() as CometChat.Group;
        this.userService.deleteChat('', group.getGuid(), 'group');
      } else {
        const user =
          this.conversationToDelete.getConversationWith() as CometChat.User;
        this.userService.deleteChat(user.getUid(), '', 'user');
      }
    } else {
      this.showDeleteChat = false;
      this.userService.deleteChat();
      this.userStoreService.setShowDeleteChatDialog(false);
    }
  }
  cancelDelete() {
    this.showBan = false;
    this.showDeleteChat = false;
    this.showLeaveGroup = false;
    this.userStoreService.setShowDeleteChatDialog(false);
    this.userStoreService.setShowBanUserDialog(false);
    this.userStoreService.setShowLeaveGroupDialog(false);
    this.conversationService.setConversationToDelete(null);
  }
  closeToast() {
    this.showSuccessToast = false;
  }
}
