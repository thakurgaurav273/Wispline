import { Component, effect } from '@angular/core';
import { MessagesService } from '../messages.service';
import { UserStoreService } from '../user-store.service';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { CometChat } from '@cometchat/chat-sdk-javascript';
@Component({
  selector: 'app-message-header',
  standalone: true,
  imports: [CommonModule, AvatarComponent, IconComponent],
  templateUrl: './message-header.component.html',
  styleUrl: './message-header.component.css',
})
export class MessageHeaderComponent {
  chatWithUser: CometChat.User | null = null;
  chatWithGroup: CometChat.Group | null = null;
  name: string = 'N/A';
  call: CometChat.Call | null = null;
  constructor(
    private messageService: MessagesService,
    private userStoreService: UserStoreService
  ) {
    effect(() => {
      this.chatWithUser = this.userStoreService.getSelectedUser()();
      this.chatWithGroup = this.userStoreService.getSelectedGroup()();
      if (this.chatWithGroup) {
        this.name = this.chatWithGroup.getName();
      } else if (this.chatWithUser) {
        this.name = this.chatWithUser?.getName();
      }
      this.call = this.userStoreService.getOutgoingCall()();
    });
  }

  toggleShowDetails(shouldShow: boolean) {
    this.userStoreService.setShowDetailsComponent(shouldShow);
  }
  handleBackClick() {
    this.userStoreService.setSelectedUser(null);
    this.userStoreService.setSelectedGroup(null);
  }
  initiateCall(callType: string) {
    if (this.chatWithGroup) {
      this.messageService.sendMeetingBubble(callType);
      this.userStoreService.startDefaultCall(this.chatWithGroup.getGuid());
      var call = new CometChat.Call(
        this.chatWithGroup!.getGuid(),
        callType,
        'group'
      );
      this.userStoreService.setOngoingCall(call);
    } else {
      this.userStoreService.initiateCall(callType);
      if(this.call){
        this.messageService.addMessage(this.call);
      }
    }
  }
}
