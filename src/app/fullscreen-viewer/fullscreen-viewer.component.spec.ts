import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenViewerComponent } from './fullscreen-viewer.component';

describe('FullscreenViewerComponent', () => {
  let component: FullscreenViewerComponent;
  let fixture: ComponentFixture<FullscreenViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullscreenViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullscreenViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
