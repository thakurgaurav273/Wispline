import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CometchatReactionsComponent } from './cometchat-reactions.component';

describe('CometchatReactionsComponent', () => {
  let component: CometchatReactionsComponent;
  let fixture: ComponentFixture<CometchatReactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CometchatReactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CometchatReactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
