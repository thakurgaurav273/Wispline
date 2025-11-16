import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShimmerChatListComponent } from './shimmer-chat-list.component';

describe('ShimmerChatListComponent', () => {
  let component: ShimmerChatListComponent;
  let fixture: ComponentFixture<ShimmerChatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShimmerChatListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShimmerChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
