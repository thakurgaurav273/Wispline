import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingBubbleComponent } from './meeting-bubble.component';

describe('MeetingBubbleComponent', () => {
  let component: MeetingBubbleComponent;
  let fixture: ComponentFixture<MeetingBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
