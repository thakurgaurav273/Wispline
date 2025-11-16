import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shimmer-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer-messages.component.html',
  styleUrl: './shimmer-messages.component.css'
})
export class ShimmerMessagesComponent {
  @Input() messageCount: number = 6;

  get shimmerItems() {
    return Array(this.messageCount).fill(0).map((_, index) => ({
      isOwn: index % 2 === 1 // Alternate between left and right
    }));
  }
}
