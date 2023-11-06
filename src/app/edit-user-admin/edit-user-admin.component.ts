import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../database.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-user-admin',
  templateUrl: './edit-user-admin.component.html',
  styleUrls: ['./edit-user-admin.component.css']
})
export class EditUserAdminComponent implements OnInit {
  editUserForm: FormGroup | any;
  userUid: any;

  constructor(
    private authService: DatabaseService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private location: Location
  ) {}

  async ngOnInit(): Promise<void> {
    this.editUserForm = this.formBuilder.group({
      uid: [''], 
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isAdmin: [false], 
      birthDate: ['', [Validators.required, this.validateBirthDate]]
    });

    this.userUid = this.activatedRoute.snapshot.paramMap.get('id');

    (await this.authService.getUserByUidIfAdmin(this.userUid)).subscribe((data:any) => {
      // console.log(this.userUid);
      this.editUserForm.patchValue({
        uid: data['uid'],
        firstName: data['firstName'],
        lastName: data['lastName'],
        email: data['email'],
        password: data['password'],
        isAdmin: data['isAdmin'],
        birthDate: data['birthDate']
      });
    });
  }

  async updateUser() {
    const newData = {
      firstName: this.editUserForm.value.firstName,
      lastName: this.editUserForm.value.lastName,
      email: this.editUserForm.value.email,
      password: this.editUserForm.value.password,
      isAdmin: this.editUserForm.value.isAdmin,
      birthDate: this.editUserForm.value.birthDate
    };

    // console.log(this.userUid, newData);

    (await this.authService.updateProfileUserIfAdmin(this.userUid, newData)).subscribe(() => {
      console.log('updated');
      alert('Profile updated successfully'); 
      this.location.back();
    });
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

  closeForm() {
    this.router.navigate(['/all-users']);
  }
}
