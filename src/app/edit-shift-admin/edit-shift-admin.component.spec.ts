import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShiftAdminComponent } from './edit-shift-admin.component';

describe('EditShiftAdminComponent', () => {
  let component: EditShiftAdminComponent;
  let fixture: ComponentFixture<EditShiftAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditShiftAdminComponent]
    });
    fixture = TestBed.createComponent(EditShiftAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
