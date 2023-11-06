import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DatabaseService } from '../database.service';
import { Location } from '@angular/common';
import { getAuth } from '@angular/fire/auth';


@Component({
  selector: 'app-edit-shift-modal',
  templateUrl: './edit-shift-modal.component.html',
  styleUrls: ['./edit-shift-modal.component.css']
})
export class EditShiftModalComponent implements OnInit {
  isModalOpen$ = this.auth.isModalOpen$;
  editData$ = this.auth.editData$;

  editShiftForm: FormGroup | any;
  existingShift: any;
  shifts: any;
  shiftId: any;

  constructor(private auth: DatabaseService, private formBuilder: FormBuilder, private location: Location) {}

  async ngOnInit(): Promise<void> {
    this.editShiftForm = this.formBuilder.group({
      dateShift: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      hourlyWage: ['', Validators.required],
      workPlace: ['', Validators.required],
      shiftName: ['', [Validators.required], [this.shiftNameExistsValidator.bind(this)]],
      Comments: ['']
    }, { validators: this.endTimeValidator });


    this.editShiftForm.valueChanges.subscribe(() => {
      this.shiftModified.emit(this.editShiftForm.value);
    });

    this.editData$.subscribe((data: any) => {
      this.existingShift = data;
      this.editShiftForm.patchValue(this.existingShift);
    });


  (await this.auth.getShiftsForCurrentUser()).subscribe((shifts: any) => {
    this.shifts = shifts;
  });
  }

  @Output() shiftModified = new EventEmitter<any>();


  // Update the shift
  updateShift() {
    const updatedShift = this.editShiftForm.value;
  
    if (
      updatedShift.dateShift &&
      updatedShift.startTime &&
      updatedShift.endTime &&
      updatedShift.hourlyWage &&
      updatedShift.workPlace &&
      updatedShift.shiftName
    ) {
      this.auth
        .updateShift(this.shifts.indexOf(this.existingShift), updatedShift)
        .then(() => {
          const index = this.shifts.indexOf(this.existingShift);
          if (index !== -1) {
            this.shifts[index] = updatedShift;
          }
  
          this.shiftModified.emit(updatedShift);
  
          this.auth.updateShiftInFirestore(this.existingShift, updatedShift).then(() => {
            console.log('Shift updated in Firestore');
            alert('Shift updated successfully');
          this.location.go(this.location.path());
          location.reload();
          }).catch((error: any) => {
            console.error('Error updating shift in Firestore:', error);
          });
  
          this.auth.closeModal();
        })
        .catch((error) => {
          console.error('Error updating shift:', error);
        });
    } else {
      console.error('Some required fields are undefined or null');
    }
  }
  
  

  // Close the modal
  closeModal() {
    this.auth.closeModal();
    window.location.reload();
  }

  endTimeValidator(formGroup: AbstractControl): { [key: string]: boolean } | null {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;

    if (startTime && endTime && startTime > endTime) {
      formGroup.get('endTime')?.setErrors({ endTimeBeforeStartTime: true });
      return { endTimeBeforeStartTime: true };
    }

    return null;
  }

  
  async shiftNameExistsValidator(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    const shiftName = control.value;
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userId = user.uid;
  
      if (control.dirty) {
        try {
          const isUnique = await this.auth.isShiftNameUnique(userId, shiftName);
          console.log('Uniqueness check result:', isUnique);
  
          if (!isUnique) {
            return { nameExists: true };
          }
        } catch (error) {
          console.error('Error checking shift name uniqueness:', error);
        }
      }
    }
  
    return null;
  }
  




}


  



  

