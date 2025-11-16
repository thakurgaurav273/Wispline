// template-registry.service.ts
import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemplateRegistryService {
  private templates = new Map<string, TemplateRef<any>>();

  registerTemplate(type: string, template: TemplateRef<any>) {
    this.templates.set(type, template);
  }

  getTemplate(type: string): TemplateRef<any> | null {
    console.log(type, "message type")
    return this.templates.get(type) ?? null;
  }
}