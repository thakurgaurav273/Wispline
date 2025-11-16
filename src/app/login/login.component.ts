import { Component } from '@angular/core';
import {CometChat} from '@cometchat/chat-sdk-javascript';
import { Creds } from '../../AppConstants';
import { UserStoreService } from '../user-store.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {users} from '../sample/users'
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  uid: string = '';
  constructor(private userStoreService: UserStoreService, private router: Router){

  }
  users = users;
  handleUIDChange(event: any) {
    this.uid = event.target.value;
  }

  handleUIDLogin() {
    CometChat.login(this.uid, Creds.AUTH_KEY).then(async (user) => {
      console.log('User loggedin successfully: ', user);
      this.userStoreService.setLoggedInUser(user);
      this.router.navigate(['/chat']);
    });
  }
  async loginWithAuthToken(authToken: string) {
    await CometChat.login({ authToken: authToken }).then(async (user) => {
      console.log('User loggedin', user);
      this.userStoreService.setLoggedInUser(user);
      this.router.navigate(['/chat']);
    });
  }
}
