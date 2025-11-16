import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallBubbleComponent } from './call-bubble.component';

describe('CallBubbleComponent', () => {
  let component: CallBubbleComponent;
  let fixture: ComponentFixture<CallBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
