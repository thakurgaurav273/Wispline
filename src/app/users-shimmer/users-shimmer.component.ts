import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface IShimmerAvatarStyle {
  height?: number;
  width?: number;
  borderRadius?: string;
}
@Component({
  selector: 'app-users-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-shimmer.component.html',
  styleUrl: './users-shimmer.component.css'
})
export class UsersShimmerComponent {
  @Input() itemCount: number = 8;
  @Input() shouldShowStatus = true;
  @Input() avatarStyle: IShimmerAvatarStyle = {} ;
  get shimmerItems() {
    return Array(this.itemCount).fill(0).map((_, index) => index);
  }
  get getAvatarStyle() {
    return {
      height: `${this.avatarStyle.height}px` ? `${this.avatarStyle.height}px` : '48px',
      width: `${this.avatarStyle.width}px` ? `${this.avatarStyle.width}px` : '48px',
      borderRadius: this.avatarStyle.borderRadius ?? '50%',
    };
  }
}
