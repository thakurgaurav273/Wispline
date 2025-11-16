import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoBubbleComponent } from './video-bubble.component';

describe('VideoBubbleComponent', () => {
  let component: VideoBubbleComponent;
  let fixture: ComponentFixture<VideoBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
