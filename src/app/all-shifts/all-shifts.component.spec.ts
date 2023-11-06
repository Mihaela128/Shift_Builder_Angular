import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllShiftsComponent } from './all-shifts.component';

describe('AllShiftsComponent', () => {
  let component: AllShiftsComponent;
  let fixture: ComponentFixture<AllShiftsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllShiftsComponent]
    });
    fixture = TestBed.createComponent(AllShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
