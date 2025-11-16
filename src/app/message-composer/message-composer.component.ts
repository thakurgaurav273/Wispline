// import { CommonModule } from '@angular/common';
// import { Component, effect, Input, ElementRef, ViewChild } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { MessagesService } from '../messages.service';
// import { ClickOutsideDirective } from '../directives/click-outside.directive';
// import { IconComponent } from "../icon/icon.component";
// import { EmojiPickerComponent } from "../emoji-picker/emoji-picker.component";
// import { UserStoreService } from '../user-store.service';
// import {CometChat, Group, GroupMember} from '@cometchat/chat-sdk-javascript';
// import { AvatarComponent } from "../BaseComponents/avatar/avatar.component";
// import { UsersShimmerComponent } from "../users-shimmer/users-shimmer.component";

// interface User {
//   uid: string;
//   name: string;
//   avatar?: string;
//   status?: string;
// }

// interface MentionData {
//   uid: string;
//   name: string;
//   startIndex: number;
//   endIndex: number;
// }

// @Component({
//   selector: 'app-message-composer',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ClickOutsideDirective, IconComponent, EmojiPickerComponent, IconComponent, AvatarComponent, UsersShimmerComponent],
//   templateUrl: './message-composer.component.html',
//   styleUrl: './message-composer.component.css',
// })
// export class MessageComposerComponent {
//   @ViewChild('messageTextarea', { static: false }) messageTextarea!: ElementRef<HTMLTextAreaElement>;
  
//   messageText = '';
//   displayText = ''; // Text shown to user with formatted mentions
//   showEmojiPicker = false;
//   showAttachOptions = false;
//   showMentionDropdown = false;
//   editingMessage: any = null;
  
//   // Mention-related properties
//   users: GroupMember[] = [];
//   filteredUsers: GroupMember[] = [];
//   selectedMentionIndex = 0;
//   currentMentionQuery = '';
//   mentionStartIndex = -1;
//   cursorPosition = 0;
//   mentions: MentionData[] = [];
//   selectedGroup: CometChat.Group | null = null;
//   mentionsListLoading: boolean = false;
//   @Input() parentMessageId: number | undefined = undefined;
//   constructor(private messageService: MessagesService, private userStoreService: UserStoreService) {
//     effect(() => {
//       this.editingMessage = messageService.getMessageForEdit();
//       if (this.editingMessage) {
//         this.loadEditingMessage();
//       }
//       this.selectedGroup = this.userStoreService.getSelectedGroup()();
//     });
//   }

//   async ngOnInit() {

//   }

//   private loadEditingMessage() {
//     if (this.editingMessage?.text) {
//       // Parse existing message text to extract mentions and display text
//       const { displayText, mentions } = this.parseMessageText(this.editingMessage.text);
//       this.displayText = displayText;
//       this.messageText = this.editingMessage.text;
//       this.mentions = mentions;
      
//       // Focus textarea after loading
//       setTimeout(() => this.focusTextarea(), 100);
//     }
//   }

//   private parseMessageText(text: string): { displayText: string; mentions: MentionData[] } {
//     const mentions: MentionData[] = [];
//     let displayText = text;
//     let offset = 0; // Track offset for display text positions
    
//     // Parse existing mentions in format <@uid:cometchat-uid-1>
//     const mentionRegex = /<@uid:([^>]+)>/g;
//     let match;
//     const replacements: { original: string; replacement: string; index: number }[] = [];
    
//     while ((match = mentionRegex.exec(text)) !== null) {
//       const uid = match[1];
//       const user = this.users.find(u => u.getUid().toString() === uid);
//       if (user) {
//         const mentionDisplay = `@${user.getName()}`;
//         replacements.push({
//           original: match[0],
//           replacement: mentionDisplay,
//           index: match.index
//         });
        
//         mentions.push({
//           uid,
//           name: user.getName().toString(),
//           startIndex: match.index - offset, // Adjust for display text
//           endIndex: match.index - offset + mentionDisplay.length
//         });
        
//         // Update offset
//         offset += match[0].length - mentionDisplay.length;
//       }
//     }
    
//     // Apply replacements
//     for (const replacement of replacements) {
//       displayText = displayText.replace(replacement.original, replacement.replacement);
//     }
    
//     return { displayText, mentions };
//   }
  

//   onTextareaInput(event: any) {
//     const textarea = event.target as HTMLTextAreaElement;
//     const value = textarea.value;
//     const oldText = this.displayText;
//     const oldCursor = this.cursorPosition;
    
//     this.cursorPosition = textarea.selectionStart;
//     this.displayText = value;
    
//     // Update mention positions if text changed
//     if (oldText !== value) {
//       const changeStart = Math.min(oldCursor, this.cursorPosition);
//       const changeLength = Math.abs(value.length - oldText.length);
//       this.updateMentionPositions(oldText, value, changeStart, changeLength);
//     }
    
//     // Check for @ symbol for mentions
//     this.handleMentionInput(value, this.cursorPosition);
//   }

//   onTextareaKeydown(event: KeyboardEvent) {
//     if (this.showMentionDropdown) {
//       switch (event.key) {
//         case 'ArrowUp':
//           event.preventDefault();
//           this.selectedMentionIndex = Math.max(0, this.selectedMentionIndex - 1);
//           break;
//         case 'ArrowDown':
//           event.preventDefault();
//           this.selectedMentionIndex = Math.min(this.filteredUsers.length - 1, this.selectedMentionIndex + 1);
//           break;
//         case 'Enter':
//         case 'Tab':
//           event.preventDefault();
//           this.selectMention(this.filteredUsers[this.selectedMentionIndex]);
//           break;
//         case 'Escape':
//           this.hideMentionDropdown();
//           break;
//       }
//       return;
//     }

//     if (event.key === 'Enter' && !event.shiftKey) {
//       this.sendMessage(event);
//     }
//   }

//   private handleMentionInput(text: string, cursorPos: number) {
//     // Find the last @ symbol before cursor position
//     const beforeCursor = text.substring(0, cursorPos);
//     const lastAtIndex = beforeCursor.lastIndexOf('@');
//     this.mentionsListLoading = true;
    
//     if (lastAtIndex === -1) {
//       this.hideMentionDropdown();
//       return;
//     }
    
//     // Check if there's a space between @ and cursor (which would mean it's not a mention)
//     const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
//     if (textAfterAt.includes(' ')) {
//       this.hideMentionDropdown();
//       return;
//     }
//     if(this.selectedGroup){
//       const groupMembersRequestBuilder = new CometChat.GroupMembersRequestBuilder(this.selectedGroup!.getGuid()).setLimit(30).build();
//       groupMembersRequestBuilder.fetchNext().then((list)=>{
//         this.users = list;
//         this.mentionsListLoading = false
//       })  
//     }else{
//       const userRequestBuilder = new CometChat.UsersRequestBuilder().setLimit(30).build();
//       userRequestBuilder.fetchNext().then((list)=>{
//         this.users = list as any;
//         this.mentionsListLoading = false
//       })  
//     }
//     // Check if @ is at the beginning or preceded by whitespace
//     const charBeforeAt = lastAtIndex > 0 ? beforeCursor[lastAtIndex - 1] : ' ';
//     if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
//       this.hideMentionDropdown();
//       return;
//     }
    
//     // We have a valid mention trigger
//     this.mentionStartIndex = lastAtIndex;
//     this.currentMentionQuery = textAfterAt.toLowerCase();
    
//     // Filter users based on query
//     this.filteredUsers = this.users.filter(user => 
//       user.getName().toLowerCase().includes(this.currentMentionQuery)
//     ).slice(0, 10); // Limit to 10 results
    
//     this.selectedMentionIndex = 0;
//     this.showMentionDropdown = this.filteredUsers.length > 0;
//   }

//   private updateMentionPositions(oldText: string, newText: string, changeStart: number, changeLength: number) {
//     const lengthDiff = newText.length - oldText.length;
    
//     // Update mention positions that come after the change
//     this.mentions = this.mentions.map(mention => {
//       if (mention.startIndex > changeStart) {
//         return {
//           ...mention,
//           startIndex: mention.startIndex + lengthDiff,
//           endIndex: mention.endIndex + lengthDiff
//         };
//       }
//       return mention;
//     }).filter(mention => {
//       // Remove mentions that were deleted
//       const mentionText = `@${mention.name}`;
//       const mentionInText = newText.substring(mention.startIndex, mention.endIndex);
//       return mentionInText === mentionText;
//     });
//   }

//   selectMention(user: GroupMember) {
//     if (this.mentionStartIndex === -1) return;
    
//     const beforeMention = this.displayText.substring(0, this.mentionStartIndex);
//     const afterMention = this.displayText.substring(this.cursorPosition);
    
//     // Update display text with mention
//     const mentionDisplay = `@${user.getName()} `;
//     this.displayText = beforeMention + mentionDisplay + afterMention;
    
//     // Store mention data based on display text position
//     const mention: MentionData = {
//       uid: user.getUid(),
//       name: user.getName(),
//       startIndex: this.mentionStartIndex,
//       endIndex: this.mentionStartIndex + mentionDisplay.length - 1 // -1 for the space
//     };
    
//     // Remove any existing mention at this position and add new one
//     this.mentions = this.mentions.filter(m => 
//       !(m.startIndex <= this.mentionStartIndex && m.endIndex > this.mentionStartIndex)
//     );
//     this.mentions.push(mention);
    
//     // Position cursor after mention
//     const newCursorPos = this.mentionStartIndex + mentionDisplay.length;
    
//     setTimeout(() => {
//       if (this.messageTextarea) {
//         const textarea = this.messageTextarea.nativeElement;
//         textarea.value = this.displayText;
//         textarea.setSelectionRange(newCursorPos, newCursorPos);
//         textarea.focus();
//         this.cursorPosition = newCursorPos;
//       }
//     });
    
//     this.hideMentionDropdown();
//   }

//   private hideMentionDropdown() {
//     this.showMentionDropdown = false;
//     this.filteredUsers = [];
//     this.currentMentionQuery = '';
//     this.mentionStartIndex = -1;
//     this.selectedMentionIndex = 0;
//   }

//   sendMessage(event?: any) {
//     if (event) {
//       event.preventDefault();
//     }
    
//     let finalMessageText = '';
    
//     // Determine what text to send
//     if (this.mentions.length > 0) {
//       // If we have mentions, convert display text to message format
//       finalMessageText = this.convertDisplayTextToMessageText(this.displayText);
//     } else {
//       // If no mentions, use the display text
//       finalMessageText = this.displayText.trim();
//     }
    
//     if (!finalMessageText) return;
  
//     // Sending logic
//     if (this.editingMessage) {
//       this.messageService.editMessage(
//         this.editingMessage.id,
//         finalMessageText
//       );
//       this.editingMessage = null;
//     } else {
//       if (this.parentMessageId) {
//         this.messageService.sendTextMessage(finalMessageText, this.parentMessageId);
//       } else {
//         this.messageService.sendTextMessage(finalMessageText);
//       }
//     }
  
//     this.resetComposer();
//   }

//   private convertDisplayTextToMessageText(displayText: string): string {
//     let result = displayText;
    
//     // Create a map of mention names to their format
//     const mentionMap = new Map<string, string>();
//     this.mentions.forEach(mention => {
//       mentionMap.set(`@${mention.name}`, `<@uid:${mention.uid}>`);
//     });
    
//     // Replace mentions in the text
//     mentionMap.forEach((format, display) => {
//       // Use word boundary to ensure we match complete mentions
//       const regex = new RegExp(`\\B${display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
//       result = result.replace(regex, format);
//     });
    
//     return result;
//   }
  
  

//   private resetComposer() {
//     this.messageText = '';
//     this.displayText = '';
//     this.mentions = [];
//     this.showEmojiPicker = false;
//     this.hideMentionDropdown();
//   }

//   private focusTextarea() {
//     if (this.messageTextarea) {
//       const textarea = this.messageTextarea.nativeElement;
//       textarea.focus();
//       textarea.setSelectionRange(
//         textarea.value.length,
//         textarea.value.length
//       );
//     }
//   }

//   // Existing methods remain the same
//   toggleAttachOptions(event: Event) {
//     event.stopPropagation();
//     this.showAttachOptions = !this.showAttachOptions;
//   }

//   cancelEdit() {
//     this.editingMessage = null;
//     this.resetComposer();
//     this.messageService.clearEditingMessage();
//   }

//   editMessage(message: any) {
//     this.editingMessage = message;
//     this.loadEditingMessage();
//   }

//   closeAttachOptions() {
//     this.showAttachOptions = false;
//   }

//   toggleEmojiPicker() {
//     this.showEmojiPicker = !this.showEmojiPicker;
//   }

//   addEmoji(emoji: string) {
//     const cursorPos = this.cursorPosition;
//     const beforeCursor = this.displayText.substring(0, cursorPos);
//     const afterCursor = this.displayText.substring(cursorPos);
    
//     this.displayText = beforeCursor + emoji + afterCursor;
//     this.messageText = this.displayText; // Update both texts
    
//     // Update cursor position
//     setTimeout(() => {
//       const newCursorPos = cursorPos + emoji.length;
//       if (this.messageTextarea) {
//         const textarea = this.messageTextarea.nativeElement;
//         textarea.setSelectionRange(newCursorPos, newCursorPos);
//         this.cursorPosition = newCursorPos;
//       }
//     });
//   }

//   onAttach() {
//     console.log('Open file picker...');
//     this.handleFilePick('file');
//   }

//   async handleFilePick(type: 'image' | 'video' | 'audio' | 'file') {
//     const input = document.createElement('input');
//     input.type = 'file';

//     switch (type) {
//       case 'image':
//         input.accept = 'image/*';
//         (input as any).capture = 'environment';
//         break;
//       case 'video':
//         input.accept = 'video/*,.mkv,.mov,.avi,.mp4,.m4v';
//         (input as any).capture = 'user';
//         break;
//       case 'audio':
//         input.accept = 'audio/*';
//         (input as any).capture = 'microphone';
//         break;
//       case 'file':
//         input.accept = '*/*';
//         break;
//     }

//     input.onchange = async (e: any) => {
//       const file: File = e.target.files?.[0];
//       if (!file) return;

//       console.log('📂 Selected file:', file.name);
//       console.log('✅ File passed validation:', file.name);
//       this.handleSend(type, file);
//     };
//     input.click();
//   }

//   async handleSend(type: string, file: File) {
//     try {
//       this.messageService.sendMediaMessage(file, type);
//     } catch (e) {
//       console.error('🚫 Error sending file:', e);
//       alert('Failed to send file!');
//     }
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, effect, Input, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../messages.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { IconComponent } from "../BaseComponents/icon/icon.component";
import { EmojiPickerComponent } from "../features/emoji-picker/emoji-picker.component";
import { UserStoreService } from '../user-store.service';
import { CometChat, Group, GroupMember } from '@cometchat/chat-sdk-javascript';
import { AvatarComponent } from "../BaseComponents/avatar/avatar.component";
import { UsersShimmerComponent } from "../users-shimmer/users-shimmer.component";
import { Subject, takeUntil } from 'rxjs';
import { MentionData, MentionsService, MentionState } from '../mentions.service';
import { FormatMentionsPipe } from "../format-mentions.pipe";
import { TextFormatterService } from '../text-formatter.service';
import { MentionsFormatterService } from '../mentions-formatter.service';
import { CometChatMediaRecorderComponent } from "../features/cometchat-media-recorder/cometchat-media-recorder.component";
import { CometChatPopoverComponent } from '../popover/popover.component';

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, CometChatPopoverComponent, FormsModule, ClickOutsideDirective, IconComponent, EmojiPickerComponent, IconComponent, AvatarComponent, UsersShimmerComponent, FormatMentionsPipe, CometChatMediaRecorderComponent],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.css',
})
export class MessageComposerComponent implements OnInit, OnDestroy {
  @ViewChild('messageTextarea', { static: false }) messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @Input() parentMessageId: number | undefined = undefined;
  
  // Basic composer properties
  messageText = '';
  displayText = '';
  showEmojiPicker = false;
  showAttachOptions = false;
  editingMessage: any = null;
  cursorPosition = 0;

  showMediaRecorder = false;

  toggleMediaRecorder() {
    this.showMediaRecorder = !this.showMediaRecorder;
  }
  
  closeMediaRecorder() {
    this.showMediaRecorder = false;
  }
  
  handleAudioRecording(blob: Blob) {
    this.closeMediaRecorder();
    // Send or process the audio blob
    this.messageService.sendMediaMessage(blob, 'audio');
  }
  
  // Mention-related properties (managed by service)
  mentionState: MentionState = {
    showDropdown: false,
    filteredUsers: [],
    selectedIndex: 0,
    query: '',
    startIndex: -1,
    loading: false
  };
  mentions: MentionData[] = [];
  
  private selectedGroup: CometChat.Group | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessagesService, 
    private userStoreService: UserStoreService,
    private mentionService: MentionsService,
    private formatterService: TextFormatterService,
    private mentionsFormatter: MentionsFormatterService
  ) {
    this.formatterService.registerFormatter(this.mentionsFormatter);

    effect(() => {
      this.editingMessage = messageService.getMessageForEdit();
      if (this.editingMessage) {
        this.loadEditingMessage();
      }
      
      const newSelectedGroup = this.userStoreService.getSelectedGroup()();
      if (newSelectedGroup !== this.selectedGroup) {
        this.selectedGroup = newSelectedGroup;
        this.mentionService.refreshUsers(this.selectedGroup);
      }
    });
  }

  async ngOnInit() {
    // Subscribe to mention state changes
    this.mentionService.getMentionState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state:any) => {
        this.mentionState = state;
      });

    // Subscribe to mentions changes
    this.mentionService.getMentions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mentions:any) => {
        this.mentions = mentions;
      });

    // Initialize users on component load
    await this.mentionService.initializeUsers(this.selectedGroup);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadEditingMessage() {
    if (this.editingMessage?.text) {
      // Parse existing message text to extract mentions and display text
      const { displayText, mentions } = this.mentionService.parseMessageText(this.editingMessage.text);
      this.displayText = displayText;
      this.messageText = this.editingMessage.text;
      
      // Focus textarea after loading
      setTimeout(() => this.focusTextarea(), 100);
    }
  }

  // onTextareaInput(event: any) {
  //   const textarea = event.target as HTMLTextAreaElement;
  //   const value = textarea.value;
  //   const oldText = this.displayText;
  //   const oldCursor = this.cursorPosition;
    
  //   this.cursorPosition = textarea.selectionStart;
  //   this.displayText = value;
    
  //   // Update mention positions if text changed
  //   if (oldText !== value) {
  //     const changeStart = Math.min(oldCursor, this.cursorPosition);
  //     this.mentionService.updateMentionPositions(oldText, value, changeStart);
  //   }
    
  //   // Handle mention input
  //   this.mentionService.handleMentionInput(value, this.cursorPosition);
  // }

  onTextareaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart || 0;
    
    // Handle input through formatter service
    this.formatterService.handleInput(this.displayText, cursorPos);
    
    // Auto-resize textarea
    this.adjustTextareaHeight();
  }

  private adjustTextareaHeight(): void {
    const textarea = this.messageTextarea?.nativeElement;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  onTextareaKeydown(event: KeyboardEvent) {
    if (this.mentionState.showDropdown) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.mentionService.navigateMentions('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.mentionService.navigateMentions('down');
          break;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          this.selectCurrentMention();
          break;
        case 'Escape':
          this.mentionService.hideMentionDropdown();
          break;
      }
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      this.sendMessage(event);
    }
  }

  selectMention(user: GroupMember) {
    const result = this.mentionService.applyMention(this.displayText, this.cursorPosition, user);
    
    this.displayText = result.displayText;
    this.updateTextareaAndCursor(result.cursorPosition);
  }

  selectCurrentMention() {
    const result = this.mentionService.applyMention(this.displayText, this.cursorPosition);
    
    this.displayText = result.displayText;
    this.updateTextareaAndCursor(result.cursorPosition);
  }

  private updateTextareaAndCursor(newCursorPos: number) {
    setTimeout(() => {
      if (this.messageTextarea) {
        const textarea = this.messageTextarea.nativeElement;
        textarea.value = this.displayText;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        this.cursorPosition = newCursorPos;
      }
    });
  }

  sendMessage(event?: any) {
    if (event) {
      event.preventDefault();
    }
    
    let finalMessageText = '';
    
    // Determine what text to send
    if (this.mentions.length > 0) {
      // If we have mentions, convert display text to message format
      finalMessageText = this.mentionService.convertDisplayTextToMessageText(this.displayText);
    } else {
      // If no mentions, use the display text
      finalMessageText = this.displayText.trim();
    }
    
    if (!finalMessageText) return;
  
    // Sending logic
    if (this.editingMessage) {
      this.messageService.editMessage(
        this.editingMessage.id,
        finalMessageText
      );
      this.editingMessage = null;
    } else {
      if (this.parentMessageId) {
        this.messageService.sendTextMessage(finalMessageText, this.parentMessageId);
      } else {
        this.messageService.sendTextMessage(finalMessageText);
      }
    }
  
    this.resetComposer();
  }

  private resetComposer() {
    this.messageText = '';
    this.displayText = '';
    this.showEmojiPicker = false;
    this.mentionService.resetMentions();
  }

  private focusTextarea() {
    if (this.messageTextarea) {
      const textarea = this.messageTextarea.nativeElement;
      textarea.focus();
      textarea.setSelectionRange(
        textarea.value.length,
        textarea.value.length
      );
    }
  }

  // Existing methods remain the same
  toggleAttachOptions(event: Event) {
    event.stopPropagation();
    this.showAttachOptions = !this.showAttachOptions;
  }

  cancelEdit() {
    this.editingMessage = null;
    this.resetComposer();
    this.messageService.clearEditingMessage();
  }

  editMessage(message: any) {
    this.editingMessage = message;
    this.loadEditingMessage();
  }

  closeAttachOptions() {
    this.showAttachOptions = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    const cursorPos = this.cursorPosition;
    const beforeCursor = this.displayText.substring(0, cursorPos);
    const afterCursor = this.displayText.substring(cursorPos);
    
    this.displayText = beforeCursor + emoji + afterCursor;
    this.messageText = this.displayText;
    
    // Update cursor position
    setTimeout(() => {
      const newCursorPos = cursorPos + emoji.length;
      if (this.messageTextarea) {
        const textarea = this.messageTextarea.nativeElement;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        this.cursorPosition = newCursorPos;
      }
    });
  }

  onAttach() {
    console.log('Open file picker...');
    this.handleFilePick('file');
  }

  async handleFilePick(type: 'image' | 'video' | 'audio' | 'file') {
    const input = document.createElement('input');
    input.type = 'file';

    switch (type) {
      case 'image':
        input.accept = 'image/*';
        (input as any).capture = 'environment';
        break;
      case 'video':
        input.accept = 'video/*,.mkv,.mov,.avi,.mp4,.m4v';
        (input as any).capture = 'user';
        break;
      case 'audio':
        input.accept = 'audio/*';
        (input as any).capture = 'microphone';
        break;
      case 'file':
        input.accept = '*/*';
        break;
    }

    input.onchange = async (e: any) => {
      const file: File = e.target.files?.[0];
      if (!file) return;

      console.log('📂 Selected file:', file.name);
      console.log('✅ File passed validation:', file.name);
      this.handleSend(type, file);
    };
    input.click();
  }

  async handleSend(type: string, file: File) {
    try {
      this.messageService.sendMediaMessage(file, type);
    } catch (e) {
      console.error('🚫 Error sending file:', e);
      alert('Failed to send file!');
    }
  }
}