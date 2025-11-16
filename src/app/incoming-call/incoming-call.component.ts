import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { UserStoreService } from '../user-store.service';
import { AvatarComponent } from "../BaseComponents/avatar/avatar.component";

@Component({
  selector: 'app-incoming-call',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './incoming-call.component.html',
  styleUrl: './incoming-call.component.css',
})
export class IncomingCallComponent {
  public callObject: CometChat.Call | null = null;

  constructor(private userStoreService: UserStoreService) {
    effect(
      () => {
        this.callObject = this.userStoreService.getIncomingCall()();
      },
      { allowSignalWrites: true }
    );
  }

  handleDeclineIncomingCall() {
    this.userStoreService.handleDeclineIncomingCall();
  }

  acceptCall(){
    this.userStoreService.acceptCall();
  }  
}
