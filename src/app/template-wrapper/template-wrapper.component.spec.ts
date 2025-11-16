import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateWrapperComponent } from './template-wrapper.component';

describe('TemplateWrapperComponent', () => {
  let component: TemplateWrapperComponent;
  let fixture: ComponentFixture<TemplateWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
