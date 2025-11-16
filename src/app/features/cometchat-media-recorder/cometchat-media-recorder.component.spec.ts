import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CometchatMediaRecorderComponent } from './cometchat-media-recorder.component';

describe('CometchatMediaRecorderComponent', () => {
  let component: CometchatMediaRecorderComponent;
  let fixture: ComponentFixture<CometchatMediaRecorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CometchatMediaRecorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CometchatMediaRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
