// template.service.ts
import { Injectable, Type, ComponentRef, ViewContainerRef, ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

// Import all bubble components
import { DeleteMessageComponent } from './delete-message/delete-message.component';
import { TextBubbleComponent } from './text-bubble/text-bubble.component';
import { ImageBubbleComponent } from './BaseComponents/image-bubble/image-bubble.component';
import { VideoBubbleComponent } from './video-bubble/video-bubble.component';
import { FileBubbleComponent } from './BaseComponents/file-bubble/file-bubble.component';
import { ActionBubbleComponent } from './action-bubble/action-bubble.component';
import { CallBubbleComponent } from './BaseComponents/call-bubble/call-bubble.component';
import { StatusViewComponent } from './status-view/status-view.component';
import { MessageBubbleComponent } from './message-bubble/message-bubble.component';

export interface TemplateConfig {
  component: Type<any>;
  props: any;
  metadata?: any;
  bubbleTypeClass?: string;
  alignment?: 'left' | 'right' | 'center';
  options?: any[];
}

export interface BubbleTemplate {
  leadingView?: Type<any>;
  headerView?: Type<any>;
  replyView?: Type<any>;
  contentView: Type<any>;
  bottomView?: Type<any>;
  threadView?: Type<any>;
  footerView?: Type<any>;
  statusInfoView?: Type<any>;
  bubbleTypeClass: string;
  alignment: 'left' | 'right' | 'center';
  metadata: any;
  options: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private templatesInitialized$ = new BehaviorSubject<boolean>(false);
  private contentTemplatesSubject$ = new BehaviorSubject<Map<string, TemplateConfig>>(new Map());
  private bubbleTemplatesSubject$ = new BehaviorSubject<Map<string, BubbleTemplate>>(new Map());
  
  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  // Initialize all templates when app starts
  initializeTemplates(): void {
    this.createContentTemplates();
    this.createBubbleTemplates();
    this.templatesInitialized$.next(true);
  }

  // Observable to know when templates are ready
  get templatesReady$(): Observable<boolean> {
    return this.templatesInitialized$.asObservable();
  }

  // Get content templates observable
  get contentTemplates$(): Observable<Map<string, TemplateConfig>> {
    return this.contentTemplatesSubject$.asObservable();
  }

  // Get bubble templates observable
  get bubbleTemplates$(): Observable<Map<string, BubbleTemplate>> {
    return this.bubbleTemplatesSubject$.asObservable();
  }

  // Create all content templates
  private createContentTemplates(): void {
    const templates = new Map<string, TemplateConfig>();

    // Base options for regular messages
    const baseOptions = [
      {
        id: 'reply',
        title: 'Reply',
        iconURL: 'assets/reply_in_thread.svg',
        onClick: (message:any) => {console.log('Reply clicked!', message.getId())}
      },
      {
        id: 'edit',
        title: 'Edit',
        iconURL: 'assets/edit_icon.svg',
        onClick: () => console.log('Edit clicked!')
      },
      {
        id: 'delete',
        title: 'Delete',
        iconURL: 'assets/delete_icon.svg',
        onClick: () => console.log('Delete clicked!')
      }
    ];

    // Deleted message template
    templates.set('deleted', {
      component: DeleteMessageComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__deleted-message',
      alignment: 'left',
      options: []
    });

    // Call message template
    templates.set('call', {
      component: CallBubbleComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__call',
      alignment: 'center',
      options: []
    });

    // Action message template
    templates.set('action', {
      component: ActionBubbleComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__action',
      alignment: 'center',
      options: []
    });

    // Text message template
    templates.set('text', {
      component: TextBubbleComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__text-message',
      alignment: 'left',
      options: baseOptions
    });

    // Image message template
    templates.set('image', {
      component: ImageBubbleComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__image-message',
      alignment: 'left',
      options: baseOptions
    });

    // Video message template
    templates.set('video', {
      component: VideoBubbleComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__video-message',
      alignment: 'left',
      options: baseOptions
    });

    // File message template
    templates.set('file', {
      component: FileBubbleComponent,
      props: {},
      metadata: {},
      bubbleTypeClass: 'chat-message-bubble__file-message',
      alignment: 'left',
      options: baseOptions
    });

    // Custom message template
    templates.set('custom', {
      component: TextBubbleComponent,
      props: {},
      metadata: { text: 'Custom Message Type' },
      bubbleTypeClass: 'chat-message-bubble__custom-message',
      alignment: 'left',
      options: baseOptions
    });

    this.contentTemplatesSubject$.next(templates);
  }

  // Create all bubble templates
  private createBubbleTemplates(): void {
    const templates = new Map<string, BubbleTemplate>();

    const baseOptions = [
      {
        id: 'reply',
        title: 'Reply',
        iconURL: 'assets/reply_in_thread.svg',
        onClick: () => console.log('Reply clicked!')
      },
      {
        id: 'edit',
        title: 'Edit',
        iconURL: 'assets/edit_icon.svg',
        onClick: () => console.log('Edit clicked!')
      },
      {
        id: 'delete',
        title: 'Delete',
        iconURL: 'assets/delete_icon.svg',
        onClick: () => console.log('Delete clicked!')
      }
    ];

    // Deleted message bubble template
    templates.set('deleted', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: DeleteMessageComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: undefined,
      bubbleTypeClass: 'chat-message-bubble__deleted-message',
      alignment: 'left',
      metadata: {},
      options: []
    });

    // Call message bubble template
    templates.set('call', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: CallBubbleComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: undefined,
      bubbleTypeClass: 'chat-message-bubble__call',
      alignment: 'center',
      metadata: {},
      options: []
    });

    // Action message bubble template
    templates.set('action', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: ActionBubbleComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: undefined,
      bubbleTypeClass: 'chat-message-bubble__action',
      alignment: 'center',
      metadata: {},
      options: []
    });

    // Text message bubble template
    templates.set('text', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: TextBubbleComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: StatusViewComponent,
      bubbleTypeClass: 'chat-message-bubble__text-message',
      alignment: 'left',
      metadata: {},
      options: baseOptions
    });

    // Image message bubble template
    templates.set('image', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: ImageBubbleComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: StatusViewComponent,
      bubbleTypeClass: 'chat-message-bubble__image-message',
      alignment: 'left',
      metadata: {},
      options: baseOptions
    });

    // Video message bubble template
    templates.set('video', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: VideoBubbleComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: StatusViewComponent,
      bubbleTypeClass: 'chat-message-bubble__video-message',
      alignment: 'left',
      metadata: {},
      options: baseOptions
    });

    // File message bubble template
    templates.set('file', {
      leadingView: undefined,
      headerView: undefined,
      replyView: undefined,
      contentView: FileBubbleComponent,
      bottomView: undefined,
      threadView: undefined,
      footerView: undefined,
      statusInfoView: StatusViewComponent,
      bubbleTypeClass: 'chat-message-bubble__file-message',
      alignment: 'left',
      metadata: {},
      options: baseOptions
    });

    this.bubbleTemplatesSubject$.next(templates);
  }

  // Get content component configuration for a message
  getContentTemplate(message: any, loggedInUserId: string): Observable<TemplateConfig | null> {
    return this.contentTemplates$.pipe(
      map(templates => {
        const templateKey = this.getTemplateKey(message);
        const template = templates.get(templateKey);
        
        if (!template) return null;

        const config = { ...template };
        const isOwnMessage = message.getSender().getUid() === loggedInUserId;
        
        // Update props with message-specific data
        config.props = {
          ...config.props,
          message: message,
          loggedInUserId: loggedInUserId,
          isOwnMessage: isOwnMessage
        };

        // Update metadata based on message type
        config.metadata = this.getMessageMetadata(message, templateKey);
        
        // Update alignment
        config.alignment = this.getMessageAlignment(message, loggedInUserId, templateKey);

        return config;
      })
    );
  }

  // Get bubble template configuration for a message
  getBubbleTemplate(message: any, loggedInUserId: string): Observable<BubbleTemplate | null> {
    return this.bubbleTemplates$.pipe(
      map(templates => {
        const templateKey = this.getTemplateKey(message);
        const template = templates.get(templateKey);
        
        if (!template) return null;

        const config = { ...template };
        
        // Update metadata based on message type
        config.metadata = this.getMessageMetadata(message, templateKey);
        
        // Update alignment
        config.alignment = this.getMessageAlignment(message, loggedInUserId, templateKey);

        return config;
      })
    );
  }

  // Get dynamic message bubble configuration (for backward compatibility)
  getDynamicMessageBubble(message: any, loggedInUserId: string): Observable<any> {
    console.log("fetching bubble details")
    return this.getBubbleTemplate(message, loggedInUserId).pipe(
      map(template => {
        if (!template) return null;
        return {
          component: MessageBubbleComponent,
          props: {
            id: message.getId(),
            leadingView: template.leadingView,
            headerView: template.headerView,
            replyView: template.replyView,
            contentView: template.contentView,
            bottomView: template.bottomView,
            threadView: template.threadView,
            footerView: template.footerView,
            statusInfoView: template.statusInfoView,
            bubbleTypeClass: template.bubbleTypeClass,
            alignment: template.alignment,
            metadata: template.metadata,
            message: message,
            type: message.getType(),
            category: message.getCategory(),
            loggedInUserId: loggedInUserId,
            options: template.options
          }
        };
      })
    );
  }

  // Helper method to determine template key
  private getTemplateKey(message: any): string {
    const isDeleted = !!message.getDeletedAt();
    const category = message.getCategory();
    const type = message.getType();

    if (isDeleted) return 'deleted';
    if (category === 'call') return 'call';
    if (category === 'action') return 'action';
    
    switch (type) {
      case 'text': return 'text';
      case 'image': return 'image';
      case 'video': return 'video';
      case 'file': return 'file';
      default: return 'custom';
    }
  }

  // Helper method to get message metadata
  private getMessageMetadata(message: any, templateKey: string): any {
    switch (templateKey) {
      case 'call':
      case 'action':
        return { action: message.getData()?.action || '' };
      case 'text':
        return { text: message.getData()?.text || '' };
      case 'image':
        return { url: message.getData()?.url || '' };
      case 'video':
        return { url: message.getData()?.attachments?.[0]?.url || '' };
      case 'file':
        return { 
          url: message.getData()?.url || '', 
          name: message.getData()?.name || '' 
        };
      case 'custom':
        return { text: 'Custom Message Type' };
      default:
        return {};
    }
  }

  // Helper method to get message alignment
  private getMessageAlignment(message: any, loggedInUserId: string, templateKey: string): 'left' | 'right' | 'center' {
    if (templateKey === 'call' || templateKey === 'action') {
      return 'center';
    }
    
    const isOwnMessage = message.getSender().getUid() === loggedInUserId;
    return isOwnMessage ? 'right' : 'left';
  }
}