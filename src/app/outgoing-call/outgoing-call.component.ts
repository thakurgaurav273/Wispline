import { Component, effect } from '@angular/core';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { UserStoreService } from '../user-store.service';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from "../BaseComponents/avatar/avatar.component";

@Component({
  selector: 'app-outgoing-call',
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent],
  templateUrl: './outgoing-call.component.html',
  styleUrl: './outgoing-call.component.css'
})
export class OutgoingCallComponent {
  public callObject: CometChat.Call | null = null;
  constructor (private userStoreService: UserStoreService){
    effect(
      () => {
        this.callObject = this.userStoreService.getOutgoingCall()();
      },
      { allowSignalWrites: true }
    );

  }
  cancelCall(){
    this.userStoreService.cancelOutgoingCall();
  }
}
