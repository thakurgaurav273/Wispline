import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CometchatUsersWithMessagesComponent } from './cometchat-users-with-messages.component';

describe('CometchatUsersWithMessagesComponent', () => {
  let component: CometchatUsersWithMessagesComponent;
  let fixture: ComponentFixture<CometchatUsersWithMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CometchatUsersWithMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CometchatUsersWithMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
