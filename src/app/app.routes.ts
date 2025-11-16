import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CometchatUsersWithMessagesComponent } from './cometchat-users-with-messages/cometchat-users-with-messages.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'chat', component: HomeComponent },
    {path: 'home', component: CometchatUsersWithMessagesComponent}

];
