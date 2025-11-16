import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingCallComponent } from './outgoing-call.component';

describe('OutgoingCallComponent', () => {
  let component: OutgoingCallComponent;
  let fixture: ComponentFixture<OutgoingCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutgoingCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
