import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationsWithMessagesComponent } from './conversations-with-messages.component';

describe('ConversationsWithMessagesComponent', () => {
  let component: ConversationsWithMessagesComponent;
  let fixture: ComponentFixture<ConversationsWithMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationsWithMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationsWithMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
