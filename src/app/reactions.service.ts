import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BaseMessage, CometChat } from '@cometchat/chat-sdk-javascript';

export interface ReactionUpdate {
  messageId: string | number;
  reactions: any[];
  action: 'message_reaction_added' | 'message_reaction_removed';
  emoji?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReactionsService {
  private reactionUpdates$ = new Subject<ReactionUpdate>();
  private messageReactions = new Map<string | number, any[]>();

  constructor() {
  }

  /**
   * Get reaction updates observable
   */
  getReactionUpdates(): Observable<ReactionUpdate> {
    return this.reactionUpdates$.asObservable();
  }

  /**
   * Emit reaction update (called by MessagesService)
   */
  emitReactionUpdate(messageId: string | number, reactions: any[], actions : 'message_reaction_added' | 'message_reaction_removed'): void {
    
    const updatedReactions = [...this.getMessageReactions(messageId)];

    for (const reaction of reactions) {
      const index = updatedReactions.findIndex(r => r.reaction === reaction.reaction && r.user === reaction.user);
      if (actions === 'message_reaction_added' && index === -1) {
        updatedReactions.push(reaction);
      } else if (actions === 'message_reaction_removed' && index !== -1) {
        updatedReactions.splice(index, 1);
      }
    }
  
    this.messageReactions.set(messageId, updatedReactions);
    this.reactionUpdates$.next({
      messageId,
      reactions,
      action: actions // MessagesService will handle the specific action
    });
  }

  /**
   * Add reaction to a message
   */
  async addReaction(messageId: string | number, emoji: string): Promise<BaseMessage> {
    try {
      // Use the same method as MessagesService
      const response = await CometChat.addReaction(messageId, emoji)
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from a message
   */
  async removeReaction(messageId: number, emoji: string): Promise<BaseMessage> {
    try {
      // Use the same method as MessagesService  
      const response = await CometChat.removeReaction(messageId.toString(), emoji);
      return response;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Get detailed reactions for a message
   */
  async getDetailedReactions(messageId:number, limit: number = 10): Promise<any[]> {
    try {
      const reactionRequest = new CometChat.ReactionsRequestBuilder()
        .setMessageId(messageId)
        .setLimit(limit)
        .build();

      const reactions = await reactionRequest.fetchPrevious();
      return reactions;
    } catch (error) {
      console.error('Error fetching detailed reactions:', error);
      throw error;
    }
  }

  /**
   * Get cached reactions for a message
   */
  getMessageReactions(messageId: string | number): any[] {
    return this.messageReactions.get(messageId) || [];
  }

  /**
   * Update cached reactions for a message
   */
  updateMessageReactions(messageId: string | number, reactions: any[]): void {
    this.messageReactions.set(messageId, reactions);
  }

  /**
   * Clear cached reactions (optional cleanup)
   */
  clearMessageReactions(messageId: string | number): void {
    this.messageReactions.delete(messageId);
  }

  /**
   * Cleanup service
   */
  ngOnDestroy(): void {
    this.reactionUpdates$.complete();
  }
}