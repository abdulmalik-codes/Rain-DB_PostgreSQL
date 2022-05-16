import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Admin } from '../../admin.model';
import { ViewAdminComponent } from '../view-admin.component';

@Component({
  selector: 'app-single-admin',
  templateUrl: './single-admin.component.html',
  styleUrls: ['./single-admin.component.css'],
})
export class SingleAdminComponent implements OnInit {
  constructor(private http: HttpClient, private route?: ActivatedRoute) {}

  ngOnInit(): void {
    this.adminEmail = this.route?.snapshot.params['adminEmail'];
    this.fetchAdmin(this.adminEmail);
  }

  singleAdminOption = new ViewAdminComponent(this.http);
  singleAdmin = (this.singleAdminOption.singleAdmin = true);

  showSingleAdmin = false;
  seeEditAdmin = false;

  admin: Admin[] = [];

  adminEmail = '';

  private fetchAdmin(getAdmin: any) {
    this.http
      .get<{ [adminUser: string]: Admin }>(
        `http://localhost:3000/admin/${getAdmin}`
      )
      .pipe(
        map((responseData) => {
          const admin: Admin[] = [];

          for (const adminUser in responseData) {
            if (responseData.hasOwnProperty(adminUser)) {
              admin.push({ ...responseData[adminUser], id: adminUser });
            }
          }
          return admin;
        })
      )
      .subscribe((admin) => {
        this.admin = admin;
        console.log(this.admin);
      });
  }

  // edit admin password

  password: any;
  passwordInput(p: any) {
    this.password = p.target.value;
  }

  updateAdmin(editAdmin: string) {
    let responseBody = {
      password: this.password,
    };
    this.http
      .put(`http://localhost:3000/admin/${editAdmin}`, responseBody, {
        responseType: 'json',
      })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`${editAdmin}'s password has been updated successfully`);

    this.seeEditAdmin = false;
  }

  // delete admin
  deleteAdmin(deleteAdmin: string) {
    if (confirm(`Are you sure you want to delete ${deleteAdmin}?`) == true) {
      this.http
        .delete(`http://localhost:3000/admin/${deleteAdmin}`)
        .subscribe((responseData) => {
          console.log(responseData);
        });

      alert(`${deleteAdmin} deleted successfully`);
    } else {
      alert(`${deleteAdmin} was not deleted`);
    }
  }
}
