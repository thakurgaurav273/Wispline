import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReactionsService, ReactionUpdate } from '../reactions.service';
import { BaseMessage, CometChat } from '@cometchat/chat-sdk-javascript';
import { UsersShimmerComponent } from "../users-shimmer/users-shimmer.component";
import { AvatarComponent } from "../BaseComponents/avatar/avatar.component";
import { CommonModule } from '@angular/common';
import { MessagesService } from '../messages.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-cometchat-reactions',
  standalone: true,
  templateUrl: './cometchat-reactions.component.html',
  styleUrls: ['./cometchat-reactions.component.scss'],
  imports: [UsersShimmerComponent, AvatarComponent, CommonModule, ClickOutsideDirective]
})
export class CometchatReactionsComponent implements OnInit, OnDestroy {
  @Input() message: BaseMessage | null = null;
  @Input() isThreadParentBubble: boolean = false;
  @Output() reactionAdded = new EventEmitter<{messageId: string | number, emoji: string}>();
  @Output() reactionRemoved = new EventEmitter<{messageId: string | number, emoji: string}>();

  reactions: any[] = [];
  detailedReactions: any[] = [];
  showUsersList: boolean = false;
  isLoadingReactions: boolean = false;
  selectedReactionFilter: string = 'all';

  private reactionSubscription?: Subscription;
  public loggedInUser: any;
  private isProcessingReaction: boolean = false; // Prevent duplicate reactions

  constructor(
    private reactionsService: ReactionsService,
    private cdr: ChangeDetectorRef,
    private messageService: MessagesService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loggedInUser = await CometChat.getLoggedinUser();
    this.initializeReactions();
    this.subscribeToReactionUpdates();
  }

  ngOnDestroy(): void {
    if (this.reactionSubscription) {
      this.reactionSubscription.unsubscribe();
    }
  }

  /**
   * Initialize reactions from message
   */
  private initializeReactions(): void {
    if (this.message && this.message.getReactions) {
      this.reactions = this.message.getReactions() || [];
      this.reactionsService.updateMessageReactions(this.message.getId(), this.reactions);
    }
  }

  /**
   * Subscribe to real-time reaction updates
   */
  private subscribeToReactionUpdates(): void {
    this.reactionSubscription = this.reactionsService.getReactionUpdates()
      .subscribe((update: ReactionUpdate) => {
        if (update.messageId === this.message?.getId()) {
          this.reactions = update.reactions;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Add reaction to message - Fixed to prevent conflicts
   */
  async addReaction(emoji: string): Promise<void> {
    if (this.isProcessingReaction || !this.message) {
      return;
    }

    this.isProcessingReaction = true;

    try {
      // Check if user already reacted with this emoji
      if (this.hasUserReacted(emoji)) {
        console.log('User already reacted with this emoji');
        this.isProcessingReaction = false;
        return;
      }

      await this.reactionsService.addReaction(this.message.getId(), emoji);
      
      // The MessageService will handle the update via CometChat listeners
      // So we don't need to manually emit updates here
      
      this.reactionAdded.emit({ messageId: this.message.getId(), emoji });
      
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      this.isProcessingReaction = false;
    }
  }

  /**
   * Remove reaction from message - Fixed to prevent conflicts
   */
  async removeReaction(emoji: string): Promise<void> {
    if (this.isProcessingReaction || !this.message || !this.canRemoveReaction(emoji)) {
      console.log("Cannot remove reaction - either processing or user doesn't have permission");
      return;
    }

    this.isProcessingReaction = true;

    try {
      await this.reactionsService.removeReaction(this.message.getId(), emoji).then((msg)=>{
        this.messageService.onReactionAddedByUser(msg);
        this.detailedReactions = this.detailedReactions.filter((reac)=> reac.reaction !== emoji)
        this.reactions = this.reactions.filter((reac)=> reac.reaction !== emoji)
        this.reactionsService.emitReactionUpdate(msg.getId(),msg.getData().reactions,'message_reaction_removed');
        this.messageService.onReactionAddedByUser(msg)
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
    } finally {
      this.isProcessingReaction = false;
    }
  }

  /**
   * Load detailed reactions when +X button is clicked
   */
  async loadDetailedReactions(): Promise<void> {
    if (this.isLoadingReactions || !this.message) return;
    
    this.showUsersList = true;
    this.isLoadingReactions = true;
    
    try {
      this.detailedReactions = await this.reactionsService.getDetailedReactions(
        this.message.getId(), 
        20
      );
    } catch (error) {
      console.error('Error loading detailed reactions:', error);
    } finally {
      this.isLoadingReactions = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Get the first reaction to display
   */
  getFirstReaction(): { emoji: string; count: number; reactedByMe: boolean; } | null {
    if (!this.reactions || this.reactions.length === 0) return null;
    return {
      emoji: this.reactions[0].reaction,
      count: this.reactions[0].count,
      reactedByMe: this.reactions[0].reactedByMe,
    };
  }

  /**
   * Check if user has reacted with specific emoji
   */
  hasUserReacted(emoji: string): boolean {
    return this.reactions.some((r) => r.reaction === emoji && r.reactedByMe);
  }

  /**
   * Get remaining reactions count for the +X button
   */
  getRemainingReactionsCount(): number {
    if (!this.reactions || this.reactions.length <= 1) return 0;
    return this.reactions
      .slice(1)
      .reduce((total, reaction) => total + reaction.count, 0);
  }

  /**
   * Get total reactions count
   */
  getTotalReactionsCount(): number {
    if (!this.reactions || this.reactions.length === 0) return 0;
    return this.reactions.reduce((total, reaction) => total + reaction.count, 0);
  }

  /**
   * Get unique reactions from detailed reactions
   */
  getUniqueReactionsFromDetailed(): any[] {
    const uniqueReactions = new Map();
    this.detailedReactions.forEach(reaction => {
      const emoji = reaction.getReaction();
      if (!uniqueReactions.has(emoji)) {
        uniqueReactions.set(emoji, { emoji, count: 0 });
      }
      uniqueReactions.get(emoji).count++;
    });
    return Array.from(uniqueReactions.values());
  }

  /**
   * Get reaction count from detailed reactions
   */
  getDetailedReactionCount(emoji: string): number {
    return this.detailedReactions.filter((r) => r.getReaction() === emoji).length;
  }

  /**
   * Filter detailed reactions
   */
  getFilteredDetailedReactions(): any[] {
    if (this.selectedReactionFilter === 'all') {
      return this.detailedReactions;
    }
    return this.detailedReactions.filter(
      (r) => r.getReaction() === this.selectedReactionFilter
    );
  }

  /**
   * Filter reactions by emoji or show all
   */
  filterReactions(filter: string): void {
    this.selectedReactionFilter = filter;
  }

  /**
   * Check if user can remove reaction
   */
  canRemoveReaction(emoji: string): boolean {
    if (!this.loggedInUser) return false;
    
    const userReaction = this.reactions.find(r => 
      r.reaction === emoji && r.reactedByMe
    );
    
    return !!userReaction;
  }

  /**
   * Hide reactions panel
   */
  hideReactionsPanel(): void {
    this.showUsersList = false;
    this.selectedReactionFilter = 'all';
    this.detailedReactions = [];
  }

  /**
   * Format reaction time for display
   */
  formatReactionTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }

  /**
   * Handle click outside to close panel
   */
  onClickOutside(): void {
    this.hideReactionsPanel();
  }
}