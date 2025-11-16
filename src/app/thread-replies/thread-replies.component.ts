import { Component, effect } from '@angular/core';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { UserStoreService } from '../user-store.service';
import { MessagesService } from '../messages.service';
import { MessageListComponent } from '../message-list/message-list.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { CommonModule } from '@angular/common';
import { BubbleService } from '../bubble.service';

@Component({
  selector: 'app-thread-replies',
  standalone: true,
  imports: [IconComponent, MessageListComponent, MessageComposerComponent, MessageBubbleComponent, CommonModule],
  templateUrl: './thread-replies.component.html',
  styleUrl: './thread-replies.component.css',
})
export class ThreadRepliesComponent {
  parentMessageId: number | undefined = undefined
  parentMessage: any = null;
  loggedInUserId: any = null;
  constructor(
    private userStoreService: UserStoreService,
    private bubbleWrapperService: BubbleService
  ) {
    effect(()=>{
      this.parentMessage = userStoreService.getParentMessage()();
      this.loggedInUserId = userStoreService.getLoggedInUser()?.getUid();
      this.parentMessageId = this.parentMessage ? this.parentMessage.getId() : null;
    })
  }

  getBubbleConfig(message: CometChat.BaseMessage): any {
    const type = message.getType();
    const category = message.getCategory();
    const template = this.bubbleWrapperService.getTemplate(category, type);
    return {
      template,
      context: { message, loggedInUserId: this.loggedInUserId }
    };
  }

  onClose() {
    this.userStoreService.setParentMessage(null);
  }
}
