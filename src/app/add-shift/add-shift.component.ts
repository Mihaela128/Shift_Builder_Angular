import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-add-shift',
  templateUrl: './add-shift.component.html',
  styleUrls: ['./add-shift.component.css']
})
export class AddShiftComponent implements OnInit {

  addShiftForm: FormGroup | any;
  
  constructor(private auth: DatabaseService, private router: Router, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.addShiftForm = this.formBuilder.group({
      id: [this.generateRandomId(), Validators.required],
      dateShift: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', [Validators.required]],
      hourlyWage: ['', Validators.required],
      workPlace: ['', Validators.required],
      shiftName: ['', [Validators.required], [this.shiftNameExistsValidator.bind(this)]],
      Comments: ['']
    }, { validators: this.endTimeValidator });
}


  async addShift() {
    const shift ={
      id: this.addShiftForm.value.id,
      dateShift: this.addShiftForm.value.dateShift,
      startTime: this.addShiftForm.value.startTime,
      endTime: this.addShiftForm.value.endTime,
      hourlyWage: this.addShiftForm.value.hourlyWage,
      workPlace: this.addShiftForm.value.workPlace,
      shiftName: this.addShiftForm.value.shiftName,
      Comments: this.addShiftForm.value.Comments
    };
    (await this.auth.addNewShift(shift)).subscribe(()=>{
    console.log('shift added');
    this.router.navigate(['/my-shifts']);
  }),
  (error: any)=>{
    console.log(error);
  }
  
  }
  
  generateRandomId(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for(let i = 0; i < 6; i++){
      const randomIndex = Math.floor((Math.random() * charactersLength));
      result += characters.charAt(randomIndex);
    }
    return result;
  }

  async onCancel() {
    const userRole = await this.auth.getUserRole();
      this.router.navigate(['/my-shifts']);
    
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
  
    return null;
  }
  
  

  
}


  





