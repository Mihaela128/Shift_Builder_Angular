import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatabaseService } from '../database.service';
import { faTrashCan, faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-my-shifts',
  templateUrl: './my-shifts.component.html',
  styleUrls: ['./my-shifts.component.css']
})
export class MyShiftsComponent implements OnInit{

  startDate: any;
  endDate: any;
  shifts:any;
  shiftForm: FormGroup | any;
  icon=faTrashCan;
  icon1=faEdit;

  constructor (private auth: DatabaseService){}

  async ngOnInit(): Promise<void> {
    if (this.startDate && this.endDate) {
      (await this.auth.getShiftsForRegularUser(this.startDate, this.endDate)).subscribe((shifts) => {
        this.shifts = shifts;
      });
    } else {
      (await this.auth.getShiftsForCurrentUser()).subscribe((shifts) => {
        this.shifts = shifts;
      });
    }
  }
  

// calculate the total profit

calculateTotalProfit(shift: any): number {
  const startTime = new Date('1970-01-01T' + shift.startTime);
  const endTime = new Date('1970-01-01T' + shift.endTime);

  const timeDiff = endTime.getTime() - startTime.getTime();

  const hoursWorked = timeDiff / (1000 * 3600);

  const totalProfit = parseFloat((hoursWorked * shift.hourlyWage).toFixed(2));

  return totalProfit;
}


// delete shift

delete(shift: any) {
  if (window.confirm('Do you want to delete this shift?')) {
    const shiftIndex = this.shifts.findIndex((s: any) => {
      return (
        s.dateShift === shift.dateShift &&
        s.startTime === shift.startTime &&
        s.endTime === shift.endTime &&
        s.hourlyWage === shift.hourlyWage &&
        s.shiftName === shift.shiftName &&
        s.workPlace === shift.workPlace &&
        s.Comments === shift.Comments
      );
    });

    if (shiftIndex !== -1) {
      this.auth.deleteShift(shift).then(() => {
        this.shifts.splice(shiftIndex, 1); 
        alert('Shift deleted successfully');
      });
    } else {
      console.log('Shift not found in the shifts array');
    }
  }
}

// edit shift

    openEditModal(shift: any) {
      this.auth.openModal(shift);
    }

    onShiftModified(modifiedShift: any) {
      const shiftIndex = this.shifts.findIndex((s: any) => {
        return (
          s.dateShift === modifiedShift.dateShift &&
          s.startTime === modifiedShift.startTime &&
          s.endTime === modifiedShift.endTime &&
          s.hourlyWage === modifiedShift.hourlyWage &&
          s.shiftName === modifiedShift.shiftName &&
          s.workPlace === modifiedShift.workPlace &&
          s.Comments === modifiedShift.Comments
        );
      });
    
      if (shiftIndex !== -1) {
        this.shifts[shiftIndex] = modifiedShift;
      }
    }
    
async searchByDate(){
  (await this.auth.getShiftsForRegularUser(this.startDate, this.endDate)).subscribe((data)=>{
    this.shifts = data;
})
}

async searchByName() {
  const shiftPlaceInput = document.getElementById('shiftPlace') as HTMLInputElement;
  const place = shiftPlaceInput.value.trim();

  if (place) {
    (await this.auth.getShiftsByPlace(place)).subscribe((data) => {
      this.shifts = data;
    });
  } else {
    console.log('Please enter a place to search for shifts.');
  }
}

}
