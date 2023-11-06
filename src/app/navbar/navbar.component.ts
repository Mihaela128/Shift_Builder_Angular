import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';
import { NavigationEnd, Router } from '@angular/router';
import { getAuth, signOut } from '@angular/fire/auth';
import { faHome, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: any | null;
  icon = faHome;
  icon1 = faSignOut;
  isMenuOpen = false;

  isAllUsersPage: boolean = false;

  constructor(private databaseService: DatabaseService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAllUsersPage = event.url === '/all-users';
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Welcome currentUser

async ngOnInit(): Promise<void> {
  (await this.databaseService.getCurrentUser()).subscribe((user)=>{
    this.currentUser = user;
  }) 
}

// Logout

logout(){
  if(this.currentUser){
    const auth = getAuth();
    signOut(auth);
  }
}

isActive(route: string): boolean {
  return this.router.isActive(route, true);
}

}