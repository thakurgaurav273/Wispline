import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannedMembersComponent } from './banned-members.component';

describe('BannedMembersComponent', () => {
  let component: BannedMembersComponent;
  let fixture: ComponentFixture<BannedMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannedMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannedMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
