import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  effect,
} from '@angular/core';
import { MessagesService } from '../messages.service';
import { UsersService } from '../users.service';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { UserStoreService } from '../user-store.service';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { IconComponent } from '../BaseComponents/icon/icon.component';
import { Router } from '@angular/router';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { UsersShimmerComponent } from "../users-shimmer/users-shimmer.component";

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [TitleCasePipe, CommonModule, AvatarComponent, IconComponent, ClickOutsideDirective, UsersShimmerComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  @Input() title: string = 'Users';
  @Input() loadingStateView!: TemplateRef<any>;
  @Input() listType: 'users' | 'chats' | 'group' = 'users';

  list: Array<CometChat.User> = [];
  loading: boolean = false;
  noMoreItems = false;
  showMenuPopover: boolean = false;
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;
  user: CometChat.User | null = null;
  selectedUser: CometChat.User | null = null;
  constructor(
    private messageService: MessagesService,
    private userService: UsersService,
    private userStoreService: UserStoreService,
    private router: Router
  ) {
    effect(() => {
      this.user = this.userStoreService.getLoggedInUser();
    });
  }

  ngOnInit(): void {
    if (this.listType === 'users') {
      this.userService.usersList$.subscribe((users) => {
        this.list = users;
      });
      // Initial load
      this.loadMore();
    }
  }

  onScroll() {
    const scrollEl = this.scrollContainer?.nativeElement;
    if (!scrollEl || this.loading || this.noMoreItems) return;

    const threshold = 300; // pixels from bottom

    const scrollPosition = scrollEl.scrollTop + scrollEl.clientHeight;
    const scrollHeight = scrollEl.scrollHeight;

    if (scrollHeight - scrollPosition <= threshold) {
      this.loadMore();
    }
  }

  handleUserClick(user: CometChat.User){
    this.selectedUser = user;
    this.userStoreService.setSelectedUser(user);
  }

  loadMore() {
    if (this.loading || this.noMoreItems) return;

    this.loading = true;

    this.userService.fetchNext().then((newUsers) => {
      this.loading = false;

      if (!newUsers || newUsers.length === 0) {
        this.noMoreItems = true;
      }
    });
  }
  ngOnDestroy(){
    this.userService.flushData();
  }
}
