import { Component, Inject, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-call-bubble',
  standalone: true,
  imports: [IconComponent, CommonModule],
  templateUrl: './call-bubble.component.html',
  styleUrl: './call-bubble.component.css'
})
export class CallBubbleComponent {
  @Input() message: any = null;
  @Input() loggedInUserId: string = '';
}
