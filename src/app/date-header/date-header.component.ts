import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-date-header',
  standalone: true,
  imports: [],
  templateUrl: './date-header.component.html',
  styleUrl: './date-header.component.css'
})
export class DateHeaderComponent {
  @Input() date!: string;

}
