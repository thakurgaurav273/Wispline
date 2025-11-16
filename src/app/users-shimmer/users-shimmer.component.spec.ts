import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersShimmerComponent } from './users-shimmer.component';

describe('UsersShimmerComponent', () => {
  let component: UsersShimmerComponent;
  let fixture: ComponentFixture<UsersShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersShimmerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersShimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
