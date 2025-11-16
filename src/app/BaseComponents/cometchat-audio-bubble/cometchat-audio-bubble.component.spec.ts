import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CometchatAudioBubbleComponent } from './cometchat-audio-bubble.component';

describe('CometchatAudioBubbleComponent', () => {
  let component: CometchatAudioBubbleComponent;
  let fixture: ComponentFixture<CometchatAudioBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CometchatAudioBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CometchatAudioBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
