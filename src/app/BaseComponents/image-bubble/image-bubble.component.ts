import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FullscreenViewerComponent } from "../../fullscreen-viewer/fullscreen-viewer.component";
import { UserStoreService } from '../../user-store.service';

@Component({
  selector: 'app-image-bubble',
  standalone: true,
  imports: [CommonModule, FullscreenViewerComponent],
  templateUrl: './image-bubble.component.html',
  styleUrl: './image-bubble.component.css'
})
export class ImageBubbleComponent {
  @Input() message: any = null;

  @Input() onImageClickHandle: any = null;

  showFullScreen: boolean = false;
  loggedInUserID: string | undefined = undefined;

  constructor (private userStoreService: UserStoreService){
    this.loggedInUserID = this.userStoreService.getLoggedInUser()?.getUid()
  }
  showFullScreenImage = () =>{
    this.userStoreService.setIsFullScreenPreview(this.message);
    console.log(this.message);
  } 

  closeCallBack = () =>{
    this.userStoreService.setIsFullScreenPreview(null);
  }
}
