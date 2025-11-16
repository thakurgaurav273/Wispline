import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMembersComponent } from './view-members.component';

describe('ViewMembersComponent', () => {
  let component: ViewMembersComponent;
  let fixture: ComponentFixture<ViewMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
