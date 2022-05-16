import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Admin } from '../admin.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-view-admin',
  templateUrl: './view-admin.component.html',
  styleUrls: ['./view-admin.component.css'],
})
export class ViewAdminComponent implements OnInit {
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.fetchAllAdmin();
  }

  // to view a single admin, singleAdmin will = true
  singleAdmin = false;

  // view all admins

  admins: Admin[] = [];

  adminsUrl = 'http://localhost:3000/admin';

  private fetchAllAdmin() {
    this.http
      .get<{ [key: string]: Admin }>(this.adminsUrl)
      .pipe(
        map((responseData) => {
          const admins: Admin[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              admins.push({ ...responseData[key], id: key });
            }
          }

          return admins;
        })
      )
      .subscribe((admin) => {
        this.admins = admin;
      });
  }

  // add admin

  addAdminCard = false;

  addAdmin(adminData: Admin) {
    this.http
      .post(this.adminsUrl, adminData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`${adminData.email} added successfully`);
  }
}
