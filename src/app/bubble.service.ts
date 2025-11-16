import { Injectable, TemplateRef, Type } from '@angular/core';
import { TemplateRegistryService } from './template-registry.service';
import { BehaviorSubject } from 'rxjs';

export interface ComponentData {
  context: any;
  template?: TemplateRef<any> | any;
}

@Injectable({
  providedIn: 'root'
})
export class BubbleService {

  constructor(private templateRegistry: TemplateRegistryService) { }
  createDynamicMessageBubble(message: CometChat.BaseMessage, loggedInUserId: string): ComponentData {
    const type = message.getType(); // 'text', 'image', etc.
    const template = this.templateRegistry.getTemplate(type);
    return {
      template,
      context: { message, loggedInUserId }
    };
  }
  private templateMap = new Map<string, Map<string, TemplateRef<any>>>();

  private messageTextTemplate$ = new BehaviorSubject<TemplateRef<any> | null>(null);


  registerTemplate(category: string, type: string, template: TemplateRef<any>) {
    if (!this.templateMap.has(category)) {
      this.templateMap.set(category, new Map<string, TemplateRef<any>>());
    }
  
    this.templateMap.get(category)!.set(type, template);
  }

  getTemplate(category: string, type: string): TemplateRef<any> | null {
    return this.templateMap.get(category)?.get(type) || null;
  }
  
  setMessageTextTemplate(template: TemplateRef<any>) {
    this.messageTextTemplate$.next(template);
  }

  registerDefaultTemplate(category: string, type: string, template: TemplateRef<any>) {
    if (!this.templateMap.has(category)) {
      this.templateMap.set(category, new Map<string, TemplateRef<any>>());
    }
    this.templateMap.get(category)!.set(type, template);
  }


  getMessageTextTemplate$() {
    return this.messageTextTemplate$.asObservable();
  }
}
