import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { UserStoreService } from '../user-store.service';
import { TextBubbleComponent } from '../text-bubble/text-bubble.component';
import { StatusViewComponent } from '../status-view/status-view.component';
import { ImageBubbleComponent } from '../BaseComponents/image-bubble/image-bubble.component';
import { VideoBubbleComponent } from '../video-bubble/video-bubble.component';
import { ActionBubbleComponent } from '../action-bubble/action-bubble.component';
import { CallBubbleComponent } from '../BaseComponents/call-bubble/call-bubble.component';
import { MessagesService } from '../messages.service';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { EmojiPickerComponent } from '../features/emoji-picker/emoji-picker.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { MeetingBubbleComponent } from '../meeting-bubble/meeting-bubble.component';
import { CometchatReactionsComponent } from '../cometchat-reactions/cometchat-reactions.component';
import { ReactionsService } from '../reactions.service';
import { BubbleService } from '../bubble.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { Placement } from '../context-menu/context-menu.model';
import { CometChatAudioBubbleComponent } from '../BaseComponents/cometchat-audio-bubble/cometchat-audio-bubble.component';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [
    CommonModule,
    TextBubbleComponent,
    StatusViewComponent,
    ImageBubbleComponent,
    VideoBubbleComponent,
    ActionBubbleComponent,
    CallBubbleComponent,
    AvatarComponent,
    EmojiPickerComponent,
    MeetingBubbleComponent,
    CometchatReactionsComponent,
    ClickOutsideDirective,
    ContextMenuComponent,
    CometChatAudioBubbleComponent
],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.css',
})
export class MessageBubbleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() id!: string | number;
  @Input() leadingView?: any;
  @Input() headerView?: any;
  @Input() replyView?: any;
  menuPlacement: Placement = Placement.bottom
  @Input() contentView?: any;
  @Input() bottomView?: any;
  @Input() threadView?: any;
  @Input() footerView?: any;
  @Input() statusInfoView?: any;
  @Input() alignment: 'left' | 'right' | 'center' = 'left';
  @Input() type?: string;
  @Input() category?: string;
  @Input() metadata: any;
  @Input() message: any;
  @Input() loggedInUserId: any;
  @Input() listType: 'main' | 'thread' = 'main';
  @Input() options: any[] = [];
  @Input() bubbleTypeClass: string = '';
  @Input() scrollContainer?: HTMLElement;
  color: string = '--cometchat-text-primary-color';
  @ViewChild('messageBubble') messageBubbleRef!: ElementRef;
  @ViewChild('contentViewRef') contentViewRef!: ElementRef;
  @Input() showAvatar: boolean = true;
  @Input() showUserAvatar: boolean = false;

  @Input() showSenderName: boolean = true;
  @Input() showUserName: boolean = false;
  copied = false;

  statusInfoInjector!: Injector;
  showOptions = false;
  showMoreOptions = false;
  placement: 'left' | 'right' = 'left';
  primaryOption: any;
  moreOptions: any[] = [];
  @Input() reactions: any[] = [];

  @Input() isThreadParentBubble: boolean = false;

  // Reaction state
  showReactionsPanel = false;
  showUsersList = false;
  selectedReactionFilter = 'all';
  detailedReactions: any[] = []; // Will hold detailed reactions from SDK
  isLoadingReactions = false;
  showEmojiKeyboard = false;
  constructor(
    private userStoreService: UserStoreService,
    private messageService: MessagesService,
    private cdr: ChangeDetectorRef,
    private reactionService: ReactionsService,
  ) {}
  ngOnInit() {
    this.setupOptions();
  }

  // Remove all the existing reaction methods as they're now handled by the cometchat-reactions component

  onReactionAdded(event: { messageId: string | number; emoji: string }): void {
    console.log('Reaction added:', event);

  }

  onReactionRemoved(event: {
    messageId: string | number;
    emoji: string;
  }): void {
    console.log('Reaction removed:', event);

  }

  addReaction(emoji: string): void {
    // Call your SDK method to add reaction
    console.log('Adding reaction:', emoji);
    this.showEmojiKeyboard = false;
    this.hideMessageOptions();
    this.reactionService.addReaction(this.message.getId(), emoji).then((msg) => {
    this.messageService.onReactionAddedByUser(msg);
    this.reactionService.emitReactionUpdate(msg.getId(),msg.getData().reactions,'message_reaction_added');
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupOptions() {
    if (this.options && this.options.length > 0) {
      this.primaryOption = this.options[0];
      this.moreOptions = this.options.slice(1);
    } else {
      // Fallback options
      this.setDefaultOptions();
    }
  }

  private setDefaultOptions() {
    const defaultOptions = [
      {
        id: 'react',
        title: 'React',
        iconURL: 'assets/addreaction.svg',
        onClick: () => {
          this.showEmojiKeyboard = true;
        },
      },
      {
        id: 'reply',
        title: 'Reply',
        iconURL: 'assets/reply_in_thread.svg',
        onClick: () => {
          this.userStoreService.setParentMessage(this.message);
          console.log('Reply clicked!');
        },
      },
      this.message.type === 'text' && {
        id: 'edit',
        title: 'Edit',
        iconURL: 'assets/edit_icon.svg',
        onClick: () => console.log('Edit clicked!'),
      },
      this.message.type === 'text' && {
        id: 'copy',
        title: 'Copy',
        iconURL: 'assets/Copy.svg',
        onClick: () => {
          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(this.message.getData().text)
              .then(() => {
                console.log('Text copied to clipboard');
                this.showCopiedNotification();
              })
              .catch((err) => {
                console.error('Could not copy text: ', err);
              });
          }
        },
      },
      {
        id: 'delete',
        title: 'Delete',
        iconURL: 'assets/delete_icon.svg',
        onClick: () => console.log('Delete clicked!'),
      },
    ].filter(Boolean);

    this.options = defaultOptions;
    this.primaryOption = this.options[0];
    this.moreOptions = this.options.slice(1);
  }

  showCopiedNotification(): void {
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 2000); // Show for 2 seconds
  }


  private handleOptionClick(option: any) {
    switch (option.id) {
      case 'react':
        this.showEmojiKeyboard = true;
        option.onClick();
        break;
      case 'reply':
        option.onClick();
        break;
      case 'edit':
        this.messageService.setMessageToEdit(this.message);
        break;
      case 'delete':
        this.messageService.deleteMessage(this.message.getId());
        console.log('Delete clicked!');
        break;
      default:
        if (option.onClick) {
          option.onClick();
        }
        break;
    }
    this.showOptions = false;
  }

  showMessageOptions() {
    this.showOptions = true;
  }

  hideMessageOptions() {
    this.showOptions = false;
    this.showEmojiKeyboard = false;
    this.showMoreOptions = false;
  }

  handleOptionClicked(event: any) {
    console.log('Option clicked:', event);
  }

  onOptionClicked(event: any) {
    this.showOptions = false;
  }

  toggleMoreOptions() {
    this.showMoreOptions = true;
  }

  hideMoreMessage(){
    this.showMoreOptions = false;
  }

  handleMoreOptionClick(option: any) {
    this.showMoreOptions = false;
    console.log(option)
    this.handleOptionClick(option);
  }

  openThread() {
    this.userStoreService.setParentMessage(this.message);
  }

  getBubbleClassName() {
    if (this.alignment === 'left') return 'chat-message-bubble-incoming';
    if (this.alignment === 'right') return 'chat-message-bubble-outgoing';
    if(this.message.getCategory() === 'action' && this.message.getType() === 'message') return 'no-render-needed';
    return 'chat-message-bubble-center';
  }
}
