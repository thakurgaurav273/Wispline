import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShimmerMessagesComponent } from './shimmer-messages.component';

describe('ShimmerMessagesComponent', () => {
  let component: ShimmerMessagesComponent;
  let fixture: ComponentFixture<ShimmerMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShimmerMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShimmerMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
