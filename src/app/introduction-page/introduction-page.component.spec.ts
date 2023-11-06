import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionPageComponent } from './introduction-page.component';

describe('IntroductionPageComponent', () => {
  let component: IntroductionPageComponent;
  let fixture: ComponentFixture<IntroductionPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntroductionPageComponent]
    });
    fixture = TestBed.createComponent(IntroductionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
