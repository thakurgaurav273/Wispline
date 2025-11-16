import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css'
})
export class IconComponent {
  @Input() iconUrl!: string;
  @Input() color: string = '#a1a1a1';
  @Input() hoverColor: string = '#a1a1a1';
  @Input() height: string = '20px';
  @Input() width: string = '20px';
  isHovered = false;
}
