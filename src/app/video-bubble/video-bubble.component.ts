import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';

@Component({
  selector: 'app-video-bubble',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-bubble.component.html',
  styleUrl: './video-bubble.component.css'
})
export class VideoBubbleComponent {
  constructor(){
  }
  @Input() message:any = null;
  getVideoThumbnail(message: CometChat.BaseMessage): string {
    return message.getData()!.attachments[0]?.thumbnail || 'assets/free-nature-images.jpg';
  }
}
