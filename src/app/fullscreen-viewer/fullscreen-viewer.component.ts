import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { AvatarComponent } from "../BaseComponents/avatar/avatar.component";
import { IconComponent } from "../BaseComponents/icon/icon.component";
import { CommonModule, DatePipe } from '@angular/common';
import { UserStoreService } from '../user-store.service';

@Component({
  selector: 'app-fullscreen-viewer',
  standalone: true,
  imports: [AvatarComponent, IconComponent, DatePipe, CommonModule],
  templateUrl: './fullscreen-viewer.component.html',
  styleUrl: './fullscreen-viewer.component.css'
})
export class FullscreenViewerComponent {
  message: any = null;
  @Input() loggedInUserUID: string | undefined = undefined;
  constructor(private userStoreService: UserStoreService){
    effect(()=>{
      this.message = this.userStoreService.getIsFullScreenPreview()();
    })

    console.log("In full screen")
  }
  handleClose = () =>{
    this.userStoreService.setIsFullScreenPreview(null);
  }
}
