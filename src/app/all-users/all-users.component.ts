import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { DatabaseService } from '../database.service';
import { faTrashCan, faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.css']
})
export class AllUsersComponent implements OnInit {

  allUsers: any;
  existingUser: any;
  icon=faTrashCan;
  icon1=faEdit;

  constructor(private auth: DatabaseService, private router: Router){}

   async ngOnInit():Promise<void>{
  (await this.auth.getAllUsersAndShifts()).subscribe((usersFromService)=>{
    this.allUsers = usersFromService;
  })

}

async deleteUser(uidUser: any) {
  if (confirm("Are you sure you want to delete this user?")) {
    (await this.auth.deleteUser(uidUser)).subscribe((data) => {
      this.allUsers = data;
      alert("User deleted successfully");
    });
  }
}


onEditUser(id: string) {
  this.router.navigate(['/edit-user-admin', id]);
}
}