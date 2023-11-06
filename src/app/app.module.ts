import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IntroductionPageComponent } from './introduction-page/introduction-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { LoginComponent } from './login/login.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { DatabaseService } from '../app/database.service';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { MyShiftsComponent } from './my-shifts/my-shifts.component';
import { NavbarComponent } from './navbar/navbar.component';
import { EditShiftModalComponent } from './edit-shift-modal/edit-shift-modal.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { AllUsersComponent } from './all-users/all-users.component';
import { MaterialModule } from './ang-material/ang-material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AllShiftsComponent } from './all-shifts/all-shifts.component';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { EditUserAdminComponent } from './edit-user-admin/edit-user-admin.component';
import { EditShiftAdminComponent } from './edit-shift-admin/edit-shift-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    IntroductionPageComponent,
    RegistrationPageComponent,
    LoginComponent,
    HomeComponent,
    FooterComponent,
    AddShiftComponent,
    MyShiftsComponent,
    NavbarComponent,
    EditShiftModalComponent,
    EditProfileComponent,
    AllUsersComponent,
    AllShiftsComponent,
    HomeAdminComponent,
    EditUserAdminComponent,
    EditShiftAdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    FontAwesomeModule
  ],
  providers: [
    ScreenTrackingService,UserTrackingService,DatabaseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
