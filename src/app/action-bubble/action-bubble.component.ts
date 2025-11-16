import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';

@Component({
  selector: 'app-action-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-bubble.component.html',
  styleUrl: './action-bubble.component.css'
})
export class ActionBubbleComponent {
  @Input() message: any = null;
}
