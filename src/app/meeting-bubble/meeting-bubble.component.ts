import { Component, Input } from '@angular/core';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { UserStoreService } from '../user-store.service';
import { DatePipe } from '@angular/common';
import {CometChat} from '@cometchat/chat-sdk-javascript';

@Component({
  selector: 'app-meeting-bubble',
  standalone: true,
  imports: [IconComponent, DatePipe],
  templateUrl: './meeting-bubble.component.html',
  styleUrl: './meeting-bubble.component.css',
})
export class MeetingBubbleComponent {
  @Input() message: CometChat.BaseMessage | null = null;
  @Input() loggedInUserId: string | undefined = undefined;

  constructor(private userStoreService: UserStoreService) {}

  handleMeetingJoin = () => {
    var call = new CometChat.Call(
      this.message?.getData().customData.sessionId,
      this.message?.getData().customData.callType,
      'group'
    );
    this.userStoreService.setOngoingCall(call);
    this.userStoreService.startDefaultCall(
      this.message?.getData().customData.sessionId
    );
  };
}
