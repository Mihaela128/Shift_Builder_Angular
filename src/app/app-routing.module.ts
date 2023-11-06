import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntroductionPageComponent } from './introduction-page/introduction-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { LoginComponent } from './login/login.component'; 
import { HomeComponent } from './home/home.component';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { MyShiftsComponent } from './my-shifts/my-shifts.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { AllUsersComponent } from './all-users/all-users.component';
import { AllShiftsComponent } from './all-shifts/all-shifts.component';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { EditUserAdminComponent } from './edit-user-admin/edit-user-admin.component'
import { EditShiftAdminComponent } from './edit-shift-admin/edit-shift-admin.component'

const routes: Routes = [
  { path: '', redirectTo: 'introduction', pathMatch: 'full' },
  { path: 'introduction', component: IntroductionPageComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'login', component: LoginComponent }, 
  { path: 'home', component: HomeComponent},
  { path: 'add-shift', component: AddShiftComponent},
  { path: 'my-shifts', component: MyShiftsComponent},
  { path: 'edit-profile', component: EditProfileComponent},
  { path: 'all-users', component: AllUsersComponent},
  { path: 'all-shifts', component: AllShiftsComponent},
  { path: 'home-admin', component: HomeAdminComponent},
  { path: 'edit-user-admin/:id', component: EditUserAdminComponent},
  { path: 'edit-shift-admin/:id', component: EditShiftAdminComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
