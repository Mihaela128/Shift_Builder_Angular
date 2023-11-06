import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: string | null = null;
  database: any;
  invalidCredentials: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  loginUser() {
    this.databaseService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).then(async () => {
      console.log('User logged in');
      const userRole = await this.databaseService.getUserRole();
      
      if (userRole === 'admin') {
        this.router.navigate(['/home-admin']);
      } else {
        this.router.navigate(['/home']);
      }
    }).catch((err) => {
      console.log('Error logging in user');
      this.invalidCredentials = true;
    });
 
  }
  

  // forgot password

  deleteUserAccount(email: string) {
    if (confirm('Are you sure you want to delete your account?')) {
      this.databaseService.deleteUserByEmail(email)
        .then(() => {
          alert("User account deleted successfully");
          this.router.navigate(['/registration']);
        })
        .catch((error) => {
          console.error('Error deleting account:', error);
        });
    }
  }

}