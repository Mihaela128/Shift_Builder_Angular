import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';


@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent implements OnInit {
  mostProfitableUser:any;
  userOfTheMonth: any;

  constructor(private auth: DatabaseService){}

  async ngOnInit(): Promise<void> {
    this.findMostShiftsUser();
    this.findMostProfitableUser();
  }

  async findMostShiftsUser() {
    const mostShiftsUser = await this.auth.findUserWithMostShifts();
    this.userOfTheMonth = mostShiftsUser;
  }

  async findMostProfitableUser() {
    const mostProfitableUser = await this.auth.findUserWithMostProfitableShift();
    this.mostProfitableUser = mostProfitableUser;
  }
  
}