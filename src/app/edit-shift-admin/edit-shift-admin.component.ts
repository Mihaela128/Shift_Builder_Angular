import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DatabaseService } from '../database.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-edit-shift-admin',
  templateUrl: './edit-shift-admin.component.html',
  styleUrls: ['./edit-shift-admin.component.css']
})
export class EditShiftAdminComponent implements OnInit {
  editShiftAdminForm: FormGroup | any;
  shiftId: any;

  constructor(private auth: DatabaseService, private router: Router, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.editShiftAdminForm = this.formBuilder.group({
      id: [this.generateRandomId(), Validators.required],
      // lastName: ['', [Validators.required, Validators.minLength(2)]], 
      dateShift: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', [Validators.required]],
      hourlyWage: ['', Validators.required],
      workPlace: ['', Validators.required],
      shiftName: ['', [Validators.required], [this.shiftNameExistsValidator.bind(this)]],
      Comments: ['']
    }, { validators: this.endTimeValidator });
    

    this.shiftId = this.activatedRoute.snapshot.paramMap.get('id');

    (await this.auth.getShiftByIdIfAdmin(this.shiftId)).subscribe((data: any) => {
      this.editShiftAdminForm.patchValue({
          // lastName: data['lastName'],
          dateShift: data['shiftData']['dateShift'],
          startTime: data['shiftData']['startTime'],
          endTime: data['shiftData']['endTime'],
          hourlyWage: data['shiftData']['hourlyWage'],
          workPlace: data['shiftData']['workPlace'],
          shiftName: data['shiftData']['shiftName'],
          Comments: data['shiftData']['Comments']
      });
    });
  }

  async editShiftAdmin() {
    const shiftUpdated = {
      // lastName: this.editShiftAdminForm.value.lastName,
      dateShift: this.editShiftAdminForm.value.dateShift,
      startTime: this.editShiftAdminForm.value.startTime,
      endTime: this.editShiftAdminForm.value.endTime,
      hourlyWage: this.editShiftAdminForm.value.hourlyWage,
      workPlace: this.editShiftAdminForm.value.workPlace,
      shiftName: this.editShiftAdminForm.value.shiftName,
      Comments: this.editShiftAdminForm.value.Comments
    };
    await (await this.auth.updateShiftIfAdmin(this.shiftId, shiftUpdated)).subscribe(() => {
      console.log('shift updated');
      alert('Shift updated successfully');
      this.router.navigate(['/all-shifts']);
    });
  }

  generateRandomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }
    return result;
  }

  endTimeValidator(formGroup: AbstractControl): ValidationErrors | null {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;

    if (startTime && endTime && startTime > endTime) {
      return { endTimeBeforeStartTime: true };
    }
  
    return null;
  }
  

  async shiftNameExistsValidator(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    const shiftName = control.value;
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (control.dirty && user) {
      const userId = user.uid;
      try {
        const otherShifts = await this.auth.getAllOtherShifts(shiftName, userId);
  
        const shiftWithSameName = otherShifts.find((shift: any) => shift.shiftName === shiftName);
  
        if (shiftWithSameName) {
          return { nameExists: true };
        }
      } catch (error) {
        console.error('Error checking shift name uniqueness:', error);
      }
    }
    return null;
  }
  


  onCancel() {
    this.router.navigate(['/all-shifts']);
  }


}