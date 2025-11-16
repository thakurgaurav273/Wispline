import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TemplateRegistryService } from '../template-registry.service';

@Component({
  selector: 'app-template-wrapper',
  standalone: true,
  imports: [],
  templateUrl: './template-wrapper.component.html',
  styleUrl: './template-wrapper.component.css'
})
export class TemplateWrapperComponent {
  @ViewChild('textTemplate') textTemplate!: TemplateRef<any>;
  @ViewChild('imageTemplate') imageTemplate!: TemplateRef<any>;

  constructor(private templateRegistry: TemplateRegistryService) {}

  ngAfterViewInit() {
    this.templateRegistry.registerTemplate('text', this.textTemplate);
    this.templateRegistry.registerTemplate('image', this.imageTemplate);
  }
}
