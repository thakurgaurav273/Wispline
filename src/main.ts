import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { Creds } from './AppConstants';
import { CometChatCalls } from '@cometchat/calls-sdk-javascript';

let appID: string = Creds.APP_ID,
  region: string = Creds.REGION,
  appSetting: CometChat.AppSettings = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(region)
    .autoEstablishSocketConnection(true)
    .build();
CometChat.init(appID, appSetting).then(
  (initialized: boolean) => {
    console.log('Initialization completed successfully', initialized);
    const callAppSetting = new CometChatCalls.CallAppSettingsBuilder()
      .setAppId(appID)
      .setRegion(region)
      .build();

    CometChatCalls.init(callAppSetting).then(
      () => {
        console.log('CometChatCalls initialization completed successfully');
        bootstrapApplication(AppComponent, appConfig).catch((err) =>
          console.error(err)
        );
      },
      (error) => {
        console.log('CometChatCalls initialization failed with error:', error);
      }
    );
  },
  (error: CometChat.CometChatException) => {
    console.log('Initialization failed with error:', error);
  }
);
