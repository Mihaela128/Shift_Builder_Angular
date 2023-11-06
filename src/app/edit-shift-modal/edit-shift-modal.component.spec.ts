import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShiftModalComponent } from './edit-shift-modal.component';

describe('EditShiftModalComponent', () => {
  let component: EditShiftModalComponent;
  let fixture: ComponentFixture<EditShiftModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditShiftModalComponent]
    });
    fixture = TestBed.createComponent(EditShiftModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
