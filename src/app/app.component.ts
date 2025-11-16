import {
  Component,
  effect,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { UserStoreService } from './user-store.service';
import { CommonModule } from '@angular/common';
import { OutgoingCallComponent } from './outgoing-call/outgoing-call.component';
import { IncomingCallComponent } from './incoming-call/incoming-call.component';
import { TemplateService } from './template.service';
import { Subject, takeUntil } from 'rxjs';
import { BubbleService } from './bubble.service';
import { FullscreenViewerComponent } from './fullscreen-viewer/fullscreen-viewer.component';
import { MessageBubbleComponent } from "./message-bubble/message-bubble.component";
import { FormatMentionsPipe } from "./format-mentions.pipe";
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    OutgoingCallComponent,
    IncomingCallComponent,
    FullscreenViewerComponent,
    FormatMentionsPipe
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Angular-v5-POC';
  user: CometChat.User | null = null;
  chatWithUser: CometChat.User | null = null;
  chatWithGroup: CometChat.Group | null = null;
  listnerID: string = 'THISISMYCALLLISTENERIDIAMUSING';
  callActive: boolean = false;
  private destroy$ = new Subject<void>();
  templatesLoaded = false;
  showFullScreenImageView: CometChat.BaseMessage | null = null;
  @ViewChild('textMessageTemplate', { static: true })
  textMessageTemplate!: TemplateRef<any>;

  constructor(
    private userStoreService: UserStoreService,
    private router: Router,
    private templateService: TemplateService,
    private bubbleService: BubbleService,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {
    CometChat.getLoggedinUser().then((user) => {
      if (user) {
        console.log('user already loggedin');
        this.userStoreService.setLoggedInUser(user);
        this.user = user;
        this.router.navigate(['/chat']);
      }
    });
    effect(() => {
      this.chatWithUser = this.userStoreService.getSelectedUser()();
    });

    effect(() => {
      this.chatWithGroup = this.userStoreService.getSelectedGroup()();
      this.showFullScreenImageView =
        this.userStoreService.getIsFullScreenPreview()();
    });

    effect(() => {
      this.callActive = this.userStoreService.getOngoingCall()() ? true : false;
    });
  }

  closeCallBack = () => {
    this.userStoreService.setIsFullScreenPreview(null);
  };

  ngOnInit() {
    // Initialize templates when app starts
    this.templateService.initializeTemplates();

    // Listen for templates ready state
    this.templateService.templatesReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ready) => {
        this.templatesLoaded = ready;
        if (ready) {
          console.log('All message templates initialized successfully');
        }
      });
      this.setTheme(this.getBrowserTheme());

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const colorScheme = e.matches ? 'dark' : 'light';
        this.setTheme(colorScheme);
      });
  }

  getBrowserTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setTheme(theme: 'light' | 'dark') {
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    this.themeService.setTheme(theme);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      CometChat.addCallListener(
        this.listnerID,
        new CometChat.CallListener({
          onIncomingCallReceived: (call: CometChat.Call) => {
            console.log('Incoming call:', call);
            this.userStoreService.setIncomingCall(call);
          },
          onOutgoingCallAccepted: async (call: CometChat.Call) => {
            console.log('Outgoing call accepted:', call);
            if (this.userStoreService.getOutgoingCall()) {
              this.userStoreService.setOngoingCall(call);
              this.userStoreService.startDefaultCall(call.getSessionId());
            }
          },
          onOutgoingCallRejected: async (call: CometChat.Call) => {
            console.log('Outgoing call rejected:', call);
            CometChat.clearActiveCall();
            this.userStoreService.setOutgoingCall(null);
          },
          onIncomingCallCancelled: (call: CometChat.Call) => {
            console.log('Incoming call cancelled:', call);
            this.userStoreService.setIncomingCall(null);
          },
          onCallEndedMessageReceived: async (call: CometChat.Call) => {
            console.log('CallEnded Message:', call);
            this.userStoreService.setOngoingCall(null);
          },
        })
      );
    }, 100);
    // console.log(this.bubbleService.getTemplate('message', 'text'))
    // this.bubbleService.registerTemplate('message', 'text', this.textMessageTemplate);
  }
}
