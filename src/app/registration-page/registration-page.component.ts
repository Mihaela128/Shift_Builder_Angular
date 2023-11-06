import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl  } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.css'],
})
export class RegistrationPageComponent implements OnInit {
  registrationForm!: FormGroup; 

  confirmPassword: string = '';
  registrationError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private service: DatabaseService,
  ) {}


  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['',[Validators.required, Validators.minLength(6), this.validateUsername]],
      birthDate: ['', [Validators.required, this.validateBirthDate]],
      shifts: [[]],
      isAdmin:['false']
    });
  }


async registerUser(){
  const { email, password, firstName, lastName, username, birthDate, shifts, isAdmin} = this.registrationForm.value;
  this.service.addUser(email, password, firstName, lastName, username, birthDate, shifts, isAdmin).then(()=>{
    alert('User added successfully!')
  }).catch((err: any)=>{
    console.error('Err adding user:', err);
  })
  this.resetForm();
  this.router.navigate(['/login']);
}
  
  validateBirthDate(control: any) {
    const birthDate = new Date(control.value);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    if (age < 18 || age > 65) {
      return { dateOutOfRange: true };
    }
    return null;
  }

  validateUsername(control: AbstractControl): { [key: string]: boolean } | null {
    const username = control.value;
  
    if (username && username.length >= 6 && !/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/.test(username)) {
      return { usernameInvalidFormat: true };
    }
  
    return null;
  }

  resetForm() {
    this.registrationForm.reset();
    this.confirmPassword = '';
  }
}