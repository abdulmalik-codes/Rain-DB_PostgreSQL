import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin/admin.component';
import { Title } from '@angular/platform-browser';
import { LoginComponent } from '../login/login.component';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  showAdminOption = new AdminComponent(this.http, this.titleService);
  showAdminOptions = this.showAdminOption.showAdminOptions;

  seeAdmins = this.showAdminOption.seeAdmins;
  seeEmployees = this.showAdminOption.seeEmployees;
  seeMessages = this.showAdminOption.seeMessages;
  seeTasks = this.showAdminOption.seeTasks;

  // loginOptions = new LoginComponent(this.http, this.titleService);
  adminLogged = false;

  title = 'Rain SA Nav';

  constructor(private http: HttpClient, private titleService: Title) {}

  ngOnInit(): void {
    console.log(this.adminLogged, 'admin logged nav');
  }
}
