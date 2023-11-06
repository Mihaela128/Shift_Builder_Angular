import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';


@Component({
  selector: 'app-all-shifts',
  templateUrl: './all-shifts.component.html',
  styleUrls: ['./all-shifts.component.css']
})
export class AllShiftsComponent implements OnInit {

  shifts:any;

  constructor(private auth: DatabaseService){}

// Function to calculate total profit
calculateTotalProfit(shift:any): number {
  const startTime = new Date('1970-01-01T' + shift.startTime);
  const endTime = new Date('1970-01-01T' + shift.endTime);

  const timeDiff = endTime.getTime() - startTime.getTime();

  const hoursWorked = timeDiff / (1000 * 3600);

  const totalProfit = parseFloat((hoursWorked * shift.hourlyWage).toFixed(2));

  return totalProfit;
}

  async ngOnInit():Promise<void>{
    (await this.auth.getAllUsersAndShifts()).subscribe((data:any)=>{
      this.shifts = data;
    })
  
}

async deleteShift(uidUser: any, shiftId: any){
  if (confirm("Are you sure you want to delete this shift?")) {
  (await this.auth.deleteShiftUserIfAdmin(uidUser, shiftId)).subscribe((data:any) => {
    this.shifts = data;
    alert('Shift deleted successfully');
  })
}
}

async searchByLastName() {
  console.log("Search by last name button clicked");
  const lastNameFilter = (document.getElementById('lastNameFilter') as HTMLInputElement).value;
  console.log("Last Name Filter:", lastNameFilter);

  if (!lastNameFilter) {
    (await this.auth.getAllUsersAndShifts()).subscribe((data: any) => {
      this.shifts = data;
      console.log("All Shifts:", this.shifts); 
    });
    return;
  }
  this.auth.getShiftsByLastName(lastNameFilter).subscribe((filteredShifts) => {
    console.log("Filtered Shifts:", filteredShifts); 
    this.shifts = filteredShifts.flat();
    console.log("Final Shifts:", this.shifts); 
  });
}



async searchByShiftPlace() {
  console.log("Search by shift place button clicked");
  const shiftPlaceFilter = (document.getElementById('shiftPlaceFilter') as HTMLInputElement).value;
  console.log("Shift Place Filter:", shiftPlaceFilter);

  if (!shiftPlaceFilter) {
    (await this.auth.getAllUsersAndShifts()).subscribe((data: any) => {
      this.shifts = data;
      console.log("All Shifts:", this.shifts);
    });
    return;
  }

  this.auth.getShiftsByShiftPlace(shiftPlaceFilter).subscribe((filteredShifts) => {
    console.log("Filtered Shifts:", filteredShifts);
    this.shifts = filteredShifts.flat();
    console.log("Final Shifts:", this.shifts);
  });
}



async searchByDate() {
  const startDateElement = document.getElementById('startDateFilter') as HTMLInputElement;
  const endDateElement = document.getElementById('endDateFilter') as HTMLInputElement;

  if (startDateElement && endDateElement) {
    const sDate = startDateElement.value;
    const eDate = endDateElement.value;

    this.auth.getShiftsByDate(sDate, eDate).subscribe((filteredShifts: any) => {
      this.shifts = filteredShifts.flat();
      console.log("Filtered Shifts:", filteredShifts);
    });
  } else {
    console.error("Start Date or End Date elements not found.");
  }
}



}