import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';
import { getAuth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 
  mostProfitableMonth:any;
  
  constructor(private auth:DatabaseService) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const uid = user.uid;
      this.mostProfitableMonth = await this.auth.findMostProfitableMonthForUser(uid);
    }else{
      this.mostProfitableMonth = 'No data available';
    }
  }


  
}
