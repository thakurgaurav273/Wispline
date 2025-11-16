import { Injectable, Signal, signal } from '@angular/core';
import { CometChatCalls } from '@cometchat/calls-sdk-javascript';
import { CallConstants, CometChat } from '@cometchat/chat-sdk-javascript';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private loggedInUser = signal<CometChat.User | null>(null);
  private chatWithUser = signal<CometChat.User | null>(null);
  private chatWithGroup = signal<CometChat.Group | null>(null);
  private outgoingCallDetails = signal<CometChat.Call | null>(null);
  private incomingCallDetails = signal<CometChat.Call | null>(null);
  private ongoingCallDetails = signal<CometChat.Call | null>(null);
  private showUserGroupDetails = signal<boolean>(false);
  private showDeleteChatConfirmation = signal<boolean>(false);
  private showBlockUserConfirmation = signal<boolean>(false);
  private parentMessage = signal<CometChat.BaseMessage | null>(null);
  private showLeaveGroupDialog = signal<boolean>(false);
  public groupMembersRequest?: CometChat.GroupMembersRequest;

  private fullScreenPreviewImage = signal<CometChat.BaseMessage | null>(null);

  private groupMembersListSubject = new BehaviorSubject<
    Array<CometChat.GroupMember>
  >([]);
  public groupMembersList$ = this.groupMembersListSubject.asObservable();

  public bannedGroupMembersRequest?: CometChat.BannedMembersRequest;

  private bannedGroupMembersListSubject = new BehaviorSubject<
    Array<CometChat.GroupMember>
  >([]);
  public bannedGroupMembersList$ =
    this.bannedGroupMembersListSubject.asObservable();

  public addMembersRequest?: CometChat.UsersRequest;

  private addMembersListSubject = new BehaviorSubject<Array<CometChat.User>>(
    []
  );
  public addMembersList$ = this.addMembersListSubject.asObservable();

  constructor() {}

  initGroupMembersRequestBuilder() {
    this.groupMembersListSubject.next([]);
    this.groupMembersRequest = new CometChat.GroupMembersRequestBuilder(
      this.chatWithGroup()!.getGuid()
    )
      .setLimit(20)
      .build();
  }

  initGroupBannedMemberRequestBuilder() {
    this.bannedGroupMembersListSubject.next([]);
    this.bannedGroupMembersRequest = new CometChat.BannedMembersRequestBuilder(
      this.chatWithGroup()!.getGuid()
    )
      .setLimit(20)
      .build();
  }

  initAddMemberRequestBuilder() {
    this.addMembersListSubject.next([]);
    this.addMembersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(20)
      .build();
  }
  /**
   * Fetch next set of users
   */
  fetchNextMembersList(): Promise<CometChat.GroupMember[]> {
    if (!this.groupMembersRequest) {
      console.error('User request not initialized.');
      return Promise.resolve([]);
    }

    return this.groupMembersRequest.fetchNext().then(
      (users: CometChat.GroupMember[]) => {
        const currentUsers = this.groupMembersListSubject.getValue();
        this.groupMembersListSubject.next([...currentUsers, ...users]);
        console.log('users fetched', users);
        return users;
      },
      (error) => {
        console.error('User fetching failed:', error);
        return [];
      }
    );
  }

  fetchNextBannedMembersList(): Promise<CometChat.GroupMember[]> {
    if (!this.bannedGroupMembersRequest) {
      console.error('User request not initialized.');
      return Promise.resolve([]);
    }

    return this.bannedGroupMembersRequest.fetchNext().then(
      (users: CometChat.GroupMember[]) => {
        const currentUsers = this.bannedGroupMembersListSubject.getValue();
        this.bannedGroupMembersListSubject.next([...currentUsers, ...users]);
        console.log('users fetched', users);
        return users;
      },
      (error) => {
        console.error('User fetching failed:', error);
        return [];
      }
    );
  }

  fetchNextAddMembersList(): Promise<CometChat.User[]> {
    if (!this.addMembersRequest) {
      console.error('User request not initialized.');
      return Promise.resolve([]);
    }

    return this.addMembersRequest.fetchNext().then(
      (users: CometChat.User[]) => {
        const currentUsers = this.addMembersListSubject.getValue();
        this.addMembersListSubject.next([...currentUsers, ...users]);
        console.log('users fetched', users);
        return users;
      },
      (error) => {
        console.error('User fetching failed:', error);
        return [];
      }
    );
  }

  setSelectedUser(user: CometChat.User | null) {
    this.chatWithGroup.set(null);
    this.chatWithUser.set(user);
    console.log('User updated');
  }
  setIsFullScreenPreview(message: CometChat.BaseMessage | null) {
    this.fullScreenPreviewImage.set(message);
  }
  getIsFullScreenPreview() {
    return this.fullScreenPreviewImage;
  }
  // ✅ Return the signal, not the value
  getSelectedUser(): Signal<CometChat.User | null> {
    return this.chatWithUser;
  }

  getParentMessage(): Signal<CometChat.BaseMessage | null> {
    return this.parentMessage;
  }

  setParentMessage(message: CometChat.BaseMessage | null) {
    this.parentMessage.set(message);
    console.log(message);
  }
  getOutgoingCall(): Signal<CometChat.Call | null> {
    return this.outgoingCallDetails;
  }

  shouldShowDetailsComponent(): Signal<boolean> {
    return this.showUserGroupDetails;
  }

  setShowDetailsComponent(toggle: boolean) {
    this.showUserGroupDetails.set(toggle);
  }

  shouldShowDeleteChatDialog(): Signal<boolean> {
    return this.showDeleteChatConfirmation;
  }
  shouldShowLeaveDialog(): Signal<boolean> {
    return this.showLeaveGroupDialog;
  }
  setShowLeaveGroupDialog(toggle: boolean) {
    this.showLeaveGroupDialog.set(toggle);
  }
  setShowDeleteChatDialog(toggle: boolean) {
    this.showDeleteChatConfirmation.set(toggle);
  }

  shouldShowBanUserDialog(): Signal<boolean> {
    return this.showBlockUserConfirmation;
  }

  setShowBanUserDialog(toggle: boolean) {
    this.showBlockUserConfirmation.set(toggle);
  }

  setOngoingCall(call: CometChat.Call | null) {
    this.ongoingCallDetails.set(call);
    if (this.outgoingCallDetails()) {
      this.outgoingCallDetails.set(null);
    } else if (this.incomingCallDetails()) {
      this.incomingCallDetails.set(null);
    }
  }

  setIncomingCall(call: CometChat.Call | null) {
    this.incomingCallDetails.set(call);
    console.log('setting incoming call object');
  }

  setOutgoingCall(call: CometChat.Call | null) {
    this.outgoingCallDetails.set(call);
  }

  getOngoingCall(): Signal<CometChat.Call | null> {
    return this.ongoingCallDetails;
  }
  getIncomingCall(): Signal<CometChat.Call | null> {
    return this.incomingCallDetails;
  }

  initiateCall(callType: string) {
    var receiverID = this.chatWithUser()?.getUid();
    var callType =
      callType === 'audio'
        ? CometChat.CALL_TYPE.AUDIO
        : CometChat.CALL_TYPE.VIDEO;
    var receiverType = CometChat.RECEIVER_TYPE.USER;

    var call = new CometChat.Call(receiverID, callType, receiverType);
    CometChat.initiateCall(call).then(
      (outGoingCall: any) => {
        this.outgoingCallDetails.set(outGoingCall);
        console.log('Call initiated successfully:', outGoingCall);
      },
      (error: any) => {
        console.log(
          'Call initialization failed with exception:',
          JSON.stringify(error)
        );
      }
    );
  }

  cancelOutgoingCall() {
    CometChat.rejectCall(
      this.outgoingCallDetails()!.getSessionId(),
      'cancelled'
    )
      .then((call) => {
        this.outgoingCallDetails.set(null);
      })
      .catch((error) => {});
  }

  addMembersToGroup = (membersList: Array<CometChat.GroupMember>) => {
    let GUID = this.chatWithGroup()!.getGuid();
    CometChat.addMembersToGroup(GUID, membersList, []).then(
      (response) => {
        console.log('response', response);
      },
      (error) => {
        console.log('Something went wrong', error);
      }
    );
  };

  banMembersInGroup = (uid: string) => {
    var GUID = this.chatWithGroup()!.getGuid();
    CometChat.banGroupMember(GUID, uid).then(
      (response) => {
        console.log('Group member banned successfully', response);
      },
      (error) => {
        console.log('Group member banning failed with error', error);
      }
    );
  };

  unbanMembersInGroup = (uid: string) => {
    var GUID = this.chatWithGroup()!.getGuid();
    CometChat.unbanGroupMember(GUID, uid).then(
      (response) => {
        console.log('Group member unbanned successfully', response);
      },
      (error) => {
        console.log('Group member unbanning failed with error', error);
      }
    );
  };

  kickMemberFromGroup = (uid: string) => {
    var GUID = this.chatWithGroup()!.getGuid();
    CometChat.kickGroupMember(GUID, uid).then(
      (response) => {
        console.log('Group member kicked successfully', response);
        this;
      },
      (error) => {
        console.log('Group member kicking failed with error', error);
      }
    );
  };

  async startDefaultCall(sessionId: string) {
    if (this.loggedInUser) {
      console.log('Call is start', sessionId);
      const authToken = this.loggedInUser()!.getAuthToken();
      const { token } = await CometChatCalls.generateToken(
        sessionId,
        authToken
      );
      let audioOnly: boolean = false;
      let defaultLayout: boolean = true;
      let callListener: any = new CometChatCalls.OngoingCallListener({
        onRecordingStarted: (event) =>
          console.log('Listener => onRecordingStarted', event.user),
        onRecordingStopped: (event) =>
          console.log('Listener => onRecordingStopped', event.user),
        onUserJoined: (user) => {
          console.log('user joined:', user);
        },
        onUserLeft: (user) => {},
        onUserListUpdated: (userList) => {
          console.log('user list:', userList);
        },
        onCallEndButtonPressed: async () => {
          console.log('End call button pressed:');
          if (this.ongoingCallDetails()) {
            CometChat.endCall(this.ongoingCallDetails()!.getSessionId()).then(
              () => {
                CometChat.clearActiveCall();
                CometChatCalls.endSession();
              }
            );
          }
          this.ongoingCallDetails.set(null);
        },
        onCallEnded: async () => {
          console.log('Call ended:');
          if (this.ongoingCallDetails()) {
            this.ongoingCallDetails.set(null);
          }
        },
        onError: (error: CometChat.CometChatException) => {
          console.log('Error :', error);
        },
      });

      let callSettings = new CometChatCalls.CallSettingsBuilder()
        .enableDefaultLayout(defaultLayout)
        .setIsAudioOnlyCall(audioOnly)
        .showSwitchToVideoCallButton(true)
        .showVirtualBackgroundSetting(false)
        .setCallListener(callListener)
        .startWithVideoMuted(true)
        .showRecordingButton(true)
        .build();
      const htmlElement: any = document.getElementById('ELEMENT_ID');
      CometChatCalls.startSession(token, callSettings, htmlElement);
    }
  }
  handleDeclineIncomingCall = async () => {
    CometChat.rejectCall(
      this.incomingCallDetails()!.getSessionId(),
      CometChat.CALL_STATUS.REJECTED
    ).then(
      (rejectedCall: CometChat.Call) => {
        this.incomingCallDetails.set(null);
        console.log('Call has been declined');
      },
      (error: CometChat.CometChatException) => {}
    );
  };

  acceptCall() {
    CometChat.acceptCall(this.incomingCallDetails()!.getSessionId()).then(
      (call: any) => {
        console.log('Call accepted successfully:', call);
        this.setOngoingCall(call);
        this.startDefaultCall(call.getSessionId());
        this.incomingCallDetails.set(null);
      },
      (error: any) => {
        console.log('Call acceptance failed with error', JSON.stringify(error));
      }
    );
  }

  setSelectedGroup(group: CometChat.Group | null) {
    this.chatWithUser.set(null);
    this.chatWithGroup.set(group);
    console.log('Group updated');
  }

  getSelectedGroup(): Signal<CometChat.Group | null> {
    return this.chatWithGroup;
  }

  setLoggedInUser(user: CometChat.User | null) {
    this.loggedInUser.set(user);
  }

  getLoggedInUser() {
    return this.loggedInUser();
  }

  flushData(){
    this.addMembersListSubject.next([])
    this.groupMembersListSubject.next([])
    this.bannedGroupMembersListSubject.next([])
    this.setLoggedInUser(null);
    this.setIncomingCall(null);
    this.setOutgoingCall(null);
    this.setSelectedGroup(null);
    this.setSelectedUser(null);
    this.setShowLeaveGroupDialog(false);
  }

  async markAsDelivered(message:CometChat.BaseMessage): Promise<void> {
    try {
      await CometChat.markAsDelivered(
        message
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
  
  deleteChat() {}
}
