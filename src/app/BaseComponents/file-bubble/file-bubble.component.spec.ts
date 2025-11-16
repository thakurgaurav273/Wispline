import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileBubbleComponent } from './file-bubble.component';

describe('FileBubbleComponent', () => {
  let component: FileBubbleComponent;
  let fixture: ComponentFixture<FileBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
