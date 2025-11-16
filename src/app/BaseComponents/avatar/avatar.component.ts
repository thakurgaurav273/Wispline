import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { InitialsPipePipe } from '../../initials-pipe.pipe';

export interface IAvatarStyle {
  height?: number;
  width?: number;
  backgroundColor?: string;
  fontColor?: string;
  fontSize?: string;
  fontStyle?: string;
  borderRadius?: string;
}
export interface IAvatatProps {
  avatarUrl: string;
  name: string;
  avatarStyle: IAvatarStyle;
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, InitialsPipePipe],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input() avatarUrl?: string = '';
  @Input() name: string = '';
  @Input() avatarStyle: IAvatarStyle = {};

  getAvatarStyles(): { [key: string]: string } {
    return {
      width: this.avatarStyle?.width ? `${this.avatarStyle.width}px` : '48px',
      height: this.avatarStyle?.height ? `${this.avatarStyle.height}px` : '48px',
      backgroundColor: this.avatarStyle?.backgroundColor || '#aa9ee8',
      color: this.avatarStyle?.fontColor || 'white',
      fontSize: this.avatarStyle?.fontSize || '18px',
      fontStyle: this.avatarStyle?.fontStyle || '',
      borderRadius: this.avatarStyle?.borderRadius || '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      textAlign: 'center',
    };
  }
}
