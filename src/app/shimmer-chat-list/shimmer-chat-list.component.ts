import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shimmer-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer-chat-list.component.html',
  styleUrl: './shimmer-chat-list.component.css'
})
export class ShimmerChatListComponent {
  @Input() itemCount: number = 8;

  get shimmerItems() {
    return Array(this.itemCount).fill(0).map((_, index) => index);
  }

}
