import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CometChat, Group, GroupMember } from '@cometchat/chat-sdk-javascript';

export interface MentionData {
  uid: string;
  name: string;
  startIndex: number;
  endIndex: number;
}

export interface MentionState {
  showDropdown: boolean;
  filteredUsers: GroupMember[];
  selectedIndex: number;
  query: string;
  startIndex: number;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MentionsService {
  private users: GroupMember[] = [];
  private usersLoaded = false;
  
  private mentionState$ = new BehaviorSubject<MentionState>({
    showDropdown: false,
    filteredUsers: [],
    selectedIndex: 0,
    query: '',
    startIndex: -1,
    loading: false
  });

  private mentions$ = new BehaviorSubject<MentionData[]>([]);

  constructor() {}

  // Getters for observables
  getMentionState(): Observable<MentionState> {
    return this.mentionState$.asObservable();
  }

  getMentions(): Observable<MentionData[]> {
    return this.mentions$.asObservable();
  }

  formatMentions(text: string, mentionsMap?: { [uid: string]: any }): string {
    console.log(text.replace(/<@uid:([\w-]+)>/g, (match, uid) => {
      const name = this.getUserNameByUid(uid, mentionsMap);
      return `<span class='mention-highlight' data-uid="${uid}" title="${name}">@${name}</span>`;
    }))
    return text.replace(/<@uid:([\w-]+)>/g, (match, uid) => {
      const name = this.getUserNameByUid(uid, mentionsMap);
      return `<span class='mention-highlight' data-uid="${uid}" title="${name}">@${name}</span>`;
    });
  }
    
  private getUserNameByUid(uid: string, mentionsMap?: { [uid: string]: any }): string {
    if (mentionsMap && mentionsMap[uid]) {
      return mentionsMap[uid].name;
    }
    return uid; // fallback to uid if not found
  }
  

  getCurrentMentions(): MentionData[] {
    return this.mentions$.value;
  }

  getCurrentState(): MentionState {
    return this.mentionState$.value;
  }

  // Initialize users list
  async initializeUsers(selectedGroup: Group | null = null): Promise<void> {
    if (this.usersLoaded) return;

    try {
      this.updateState({ loading: true });
      
      if (selectedGroup) {
        const groupMembersRequestBuilder = new CometChat.GroupMembersRequestBuilder(selectedGroup.getGuid())
          .setLimit(50)
          .build();
        
        const list = await groupMembersRequestBuilder.fetchNext();
        this.users = list;
      } else {
        const userRequestBuilder = new CometChat.UsersRequestBuilder()
          .setLimit(50)
          .build();
        
        const list = await userRequestBuilder.fetchNext();
        this.users = list as GroupMember[];
      }
      
      this.usersLoaded = true;
      this.updateState({ loading: false });
    } catch (error) {
      console.error('Error loading users:', error);
      this.updateState({ loading: false });
    }
  }

  // Handle text input for mentions
  handleMentionInput(text: string, cursorPos: number): void {
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      this.hideMentionDropdown();
      return;
    }
    
    // Check if there's a space between @ and cursor
    const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      this.hideMentionDropdown();
      return;
    }
    
    // Check if @ is at the beginning or preceded by whitespace
    const charBeforeAt = lastAtIndex > 0 ? beforeCursor[lastAtIndex - 1] : ' ';
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
      this.hideMentionDropdown();
      return;
    }
    
    // Show mention dropdown
    const query = textAfterAt.toLowerCase();
    const filteredUsers = this.users.filter(user => 
      user.getName().toLowerCase().includes(query)
    ).slice(0, 10);
    
    this.updateState({
      showDropdown: filteredUsers.length > 0,
      filteredUsers,
      selectedIndex: 0,
      query,
      startIndex: lastAtIndex
    });
  }

  // Navigate mention dropdown
  navigateMentions(direction: 'up' | 'down'): void {
    const currentState = this.getCurrentState();
    if (!currentState.showDropdown) return;

    let newIndex = currentState.selectedIndex;
    
    if (direction === 'up') {
      newIndex = Math.max(0, currentState.selectedIndex - 1);
    } else {
      newIndex = Math.min(currentState.filteredUsers.length - 1, currentState.selectedIndex + 1);
    }
    
    this.updateState({ selectedIndex: newIndex });
  }

  // Select a mention
  selectMention(user?: GroupMember): { newText: string; cursorPosition: number } | null {
    const currentState = this.getCurrentState();
    const selectedUser = user || currentState.filteredUsers[currentState.selectedIndex];
    
    if (!selectedUser || currentState.startIndex === -1) {
      return null;
    }

    return {
      newText: `@${selectedUser.getName()} `,
      cursorPosition: currentState.startIndex + `@${selectedUser.getName()} `.length
    };
  }

  // Apply mention to text and update mentions array
  applyMention(
    currentText: string, 
    cursorPos: number, 
    user?: GroupMember
  ): { displayText: string; mentions: MentionData[]; cursorPosition: number } {
    const currentState = this.getCurrentState();
    const selectedUser = user || currentState.filteredUsers[currentState.selectedIndex];
    
    if (!selectedUser || currentState.startIndex === -1) {
      return {
        displayText: currentText,
        mentions: this.getCurrentMentions(),
        cursorPosition: cursorPos
      };
    }

    const beforeMention = currentText.substring(0, currentState.startIndex);
    const afterMention = currentText.substring(cursorPos);
    const mentionDisplay = `@${selectedUser.getName()} `;
    
    const newDisplayText = beforeMention + mentionDisplay + afterMention;
    const newCursorPos = currentState.startIndex + mentionDisplay.length;

    // Create new mention data
    const newMention: MentionData = {
      uid: selectedUser.getUid(),
      name: selectedUser.getName(),
      startIndex: currentState.startIndex,
      endIndex: currentState.startIndex + mentionDisplay.length - 1 // -1 for the space
    };

    // Update mentions array
    const updatedMentions = this.getCurrentMentions()
      .filter(m => !(m.startIndex <= currentState.startIndex && m.endIndex > currentState.startIndex))
      .concat([newMention]);

    this.setMentions(updatedMentions);
    this.hideMentionDropdown();

    return {
      displayText: newDisplayText,
      mentions: updatedMentions,
      cursorPosition: newCursorPos
    };
  }

  // Update mention positions after text change
  updateMentionPositions(oldText: string, newText: string, changeStart: number): void {
    const lengthDiff = newText.length - oldText.length;
    const currentMentions = this.getCurrentMentions();
    
    const updatedMentions = currentMentions.map(mention => {
      if (mention.startIndex > changeStart) {
        return {
          ...mention,
          startIndex: mention.startIndex + lengthDiff,
          endIndex: mention.endIndex + lengthDiff
        };
      }
      return mention;
    }).filter(mention => {
      // Remove mentions that were deleted
      const mentionText = `@${mention.name}`;
      const mentionInText = newText.substring(mention.startIndex, mention.endIndex);
      return mentionInText === mentionText;
    });

    this.setMentions(updatedMentions);
  }

  // Convert display text to message format
  convertDisplayTextToMessageText(displayText: string): string {
    const currentMentions = this.getCurrentMentions();
    let result = displayText;
    
    // Create a map of mention names to their format
    const mentionMap = new Map<string, string>();
    currentMentions.forEach(mention => {
      mentionMap.set(`@${mention.name}`, `<@uid:${mention.uid}>`);
    });
    
    // Replace mentions in the text
    mentionMap.forEach((format, display) => {
      const regex = new RegExp(`\\B${display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      result = result.replace(regex, format);
    });
    
    return result;
  }

  // Parse existing message text (for editing)
  parseMessageText(text: string): { displayText: string; mentions: MentionData[] } {
    const mentions: MentionData[] = [];
    let displayText = text;
    let offset = 0;
    
    const mentionRegex = /<@uid:([^>]+)>/g;
    let match;
    const replacements: { original: string; replacement: string; index: number }[] = [];
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const uid = match[1];
      const user = this.users.find(u => u.getUid().toString() === uid);
      
      if (user) {
        const mentionDisplay = `@${user.getName()}`;
        replacements.push({
          original: match[0],
          replacement: mentionDisplay,
          index: match.index
        });
        
        mentions.push({
          uid,
          name: user.getName().toString(),
          startIndex: match.index - offset,
          endIndex: match.index - offset + mentionDisplay.length
        });
        
        offset += match[0].length - mentionDisplay.length;
      }
    }
    
    // Apply replacements
    for (const replacement of replacements) {
      displayText = displayText.replace(replacement.original, replacement.replacement);
    }
    
    this.setMentions(mentions);
    return { displayText, mentions };
  }

  // Hide mention dropdown
  hideMentionDropdown(): void {
    this.updateState({
      showDropdown: false,
      filteredUsers: [],
      query: '',
      startIndex: -1,
      selectedIndex: 0
    });
  }

  // Reset mentions
  resetMentions(): void {
    this.setMentions([]);
    this.hideMentionDropdown();
  }

  // Force refresh users (when group changes)
  async refreshUsers(selectedGroup: Group | null = null): Promise<void> {
    this.usersLoaded = false;
    this.users = [];
    await this.initializeUsers(selectedGroup);
  }

  // Private helper methods
  private updateState(updates: Partial<MentionState>): void {
    const currentState = this.getCurrentState();
    this.mentionState$.next({ ...currentState, ...updates });
  }

  private setMentions(mentions: MentionData[]): void {
    this.mentions$.next(mentions);
  }
}