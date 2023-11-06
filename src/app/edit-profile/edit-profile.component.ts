import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  editProfileForm: FormGroup | any;
  editProfileError: string | null = null;
  userData: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private service: DatabaseService,
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.getUserData(); 
  }

  initializeForm() {
    this.editProfileForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(6), this.validateUsername]],
      birthDate: ['', [Validators.required, this.validateBirthDate]],
    });
  }

  updateProfile() {
    if (this.editProfileForm.valid) {
      const formValues = this.editProfileForm.value;
  
      const user = this.userData;
  
      if (user) {
        const updatedUserData = {
          email: formValues.email,
          password: formValues.password,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          username: formValues.username,
          birthDate: formValues.birthDate,
        };
  
        if (user.uid) { 
          this.service.updateUser(user.uid, updatedUserData)
            .then(async () => {
              alert('The user profile has been updated');
              const userRole = await this.service.getUserRole();
              if (userRole === 'admin') {
                this.router.navigate(['/home-admin']);
              } else {
                this.router.navigate(['/home']);
              }
            })
            .catch((error: any) => {
              console.error('Error updating user data', error);
            });
        } else {
          console.error('User ID is not defined');
        }
      } else {
        console.error('User data is undefined');
      }
    }
  }
  

  validateBirthDate(control: AbstractControl): { [key: string]: boolean } | null {
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

  async getUserData() {
    try {
      (await this.service.getCurrentUser()).subscribe((user: any) => {
        if (user) {
          this.userData = user;
          this.editProfileForm.patchValue({
            email: user.email,
            password: user.password,
            confirmPassword: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            birthDate: user.birthDate, 
          });
        }
      });
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  }

  async cancelEdit() {
    const userRole = await this.service.getUserRole();
    if (userRole === 'admin') {
      this.router.navigate(['/home-admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
