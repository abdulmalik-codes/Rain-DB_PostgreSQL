import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { map } from 'rxjs';
import { Admin } from './admin.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  adminsUrl = 'http://localhost:3000/admin';

  showAdmin = false;
  showAddAmin = false;
  showSingleAdmin = false;

  editOptions = true;
  editCard = false;

  aLLAdmins: Admin[] = [];
  singleAdmin: Admin[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllAdmin();
  }

  onFetchAllAdmin() {
    this.fetchAllAdmin();
  }

  private fetchAllAdmin() {
    this.http
      .get<{ [key: string]: Admin }>(this.adminsUrl)
      .pipe(
        map((responseData) => {
          const admins: Admin[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              admins.push({ ...responseData[key], id: key });

              console.log(responseData);
            }
          }

          return admins;
        })
      )
      .subscribe((admin) => {
        console.log(admin[1].email);
        this.aLLAdmins = admin;
      });
  }

  onSelectAdmin(getAdmin: any) {
    this.showAdmin = false;
    this.showSingleAdmin = true;
    this.fetchAdmin(getAdmin);
  }

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

              console.log(responseData);
            }
          }
          return admin;
        })
      )
      .subscribe((admin) => {
        // console.log(admin[0].email);
        this.singleAdmin = admin;
      });
  }

  onShowAdmins() {
    this.showAdmin = !this.showAdmin;
    this.showAddAmin = false;
    this.showSingleAdmin = false;
  }

  onShowAddAdmin() {
    this.showAddAmin = !this.showAddAmin;
    this.showAdmin = false;
  }

  onAddAdmin(adminData: Admin) {
    this.http
      .post(this.adminsUrl, adminData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    this.showAdmin = true;
    this.showAddAmin = false;
  }

  onShowEditAdmin() {
    this.editCard = true;
    this.editOptions = false;
  }
  onSaveEdit(editAdmin: string) {
    alert('hey');
    this.http
      .put(
        `http://localhost:3000/admin/${editAdmin}`,
        { password: editAdmin },
        {
          responseType: 'json',
        }
      )
      .subscribe((responseData) => {
        console.log(responseData);
      });

    this.showAdmin = true;
    this.editCard = false;
  }

  // [(ngModel)]="admin.email"
  // [(ngModel)]="admin.password"

  onDelete(deleteAdmin: string) {
    this.http
      .delete(`http://localhost:3000/admin/${deleteAdmin}`)
      .subscribe((responseData) => {
        console.log(responseData);
      });
    this.showAdmin = true;
    this.showSingleAdmin = false;
  }

  onCancel() {
    this.showAdmin = true;
    this.showSingleAdmin = false;
  }
}
