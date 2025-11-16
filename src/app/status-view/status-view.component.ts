import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { IconComponent } from '../BaseComponents/icon/icon.component';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule, IconComponent],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css',
})
export class StatusViewComponent implements OnInit {
  isOutgoing = false;
  receiptStatus: 'sent' | 'delivered' | 'read' = 'sent';

  constructor() {}

  @Input() message: any = null;
  @Input() loggedInUserId: any = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message']) {
      // this.updateStatus(); // recalculate status for new message!
      if (this.loggedInUserId && this.message?.getSender?.()?.getUid?.()) {
        this.isOutgoing =
          this.message.getSender().getUid() === this.loggedInUserId;
      }

      if (this.isOutgoing) {
        if (this.message?.getReadAt?.()) {
          this.receiptStatus = 'read';
        } else if (this.message?.getDeliveredAt?.()) {
          this.receiptStatus = 'delivered';
        } else {
          this.receiptStatus = 'sent';
        }
      } else {
        this.receiptStatus = 'sent';
      }
    }
  }
  ngOnInit() {
    if (this.loggedInUserId && this.message?.getSender?.()?.getUid?.()) {
      this.isOutgoing =
        this.message.getSender().getUid() === this.loggedInUserId;
    }

    if (this.isOutgoing) {
      if (this.message?.getReadAt?.()) {
        this.receiptStatus = 'read';
      } else if (this.message?.getDeliveredAt?.()) {
        this.receiptStatus = 'delivered';
      } else {
        this.receiptStatus = 'sent';
      }
    } else {
      this.receiptStatus = 'sent';
    }
  }
}
