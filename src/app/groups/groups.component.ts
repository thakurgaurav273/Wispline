import { Component, effect, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessagesService } from '../messages.service';
import { UserStoreService } from '../user-store.service';
import { UsersService } from '../users.service';
import { GroupsService } from '../groups.service';
import { AvatarComponent } from '../BaseComponents/avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { UsersShimmerComponent } from "../users-shimmer/users-shimmer.component";
import { IconComponent } from "../BaseComponents/icon/icon.component";
import { CreateGroupComponent } from "../create-group/create-group.component";
import {CometChat} from '@cometchat/chat-sdk-javascript';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [AvatarComponent, CommonModule, UsersShimmerComponent, IconComponent, CreateGroupComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent {
  @Input() title: string = 'Groups';
  @Input() loadingStateView!: TemplateRef<any>;
  @Input() listType: 'users' | 'chats' | 'group' = 'users';
  showCreateGroup: boolean = false;
  public groupName = '';
  public groupType = '';
  public groupPassword = '';

  list: Array<CometChat.Group> = [];
  loading: boolean = false;
  noMoreItems = false;
  showMenuPopover: boolean = false;
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;
  user: CometChat.User | null = null;
  selectedGroup: CometChat.Group | null = null;
  constructor(
    private messageService: MessagesService,
    private groupService: GroupsService,
    private userStoreService: UserStoreService,
    private router: Router
  ) {
    effect(() => {
      this.user = this.userStoreService.getLoggedInUser();
    });
  }

  ngOnInit(): void {
    if (this.listType === 'users') {
      this.groupService.groupsList$.subscribe((groups) => {
        this.list = groups;
      });
      // Initial load
      this.loadMore();
    }
  }


  createGroup = (ev: any) => {
    console.log(ev);
    this.showCreateGroup = false;

    this.groupName = ev.name;
    this.groupType =
      ev.privacy === 'public'
        ? CometChat.GROUP_TYPE.PUBLIC
        : ev.privacy === 'password'
        ? CometChat.GROUP_TYPE.PASSWORD
        : CometChat.GROUP_TYPE.PRIVATE;
    this.groupPassword = ev.password;

    console.log('Group data saved for later creation', {
      groupName: this.groupName,
      groupType: this.groupType,
      groupPassword: this.groupPassword,
    });

  };

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

  toggleCreateGroup = () => {
    this.showMenuPopover = false;
    this.showCreateGroup = !this.showCreateGroup; // Toggle value
  };

  handleGroupClick(group: CometChat.Group){
    this.selectedGroup = group;
    this.userStoreService.setSelectedGroup(group);
  }

  loadMore() {
    if (this.loading || this.noMoreItems) return;

    this.loading = true;

    this.groupService.fetchNext().then((newGroups) => {
      this.loading = false;

      if (!newGroups || newGroups.length === 0) {
        this.noMoreItems = true;
      }
    });
  }
  ngOnDestroy(){
    this.groupService.flushData();
  }
}
