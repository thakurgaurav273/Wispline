import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBubbleComponent } from './action-bubble.component';

describe('ActionBubbleComponent', () => {
  let component: ActionBubbleComponent;
  let fixture: ComponentFixture<ActionBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
