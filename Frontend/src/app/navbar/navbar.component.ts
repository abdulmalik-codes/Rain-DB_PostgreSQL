import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AdminComponent } from '../admin/admin.component';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  showAdminOption = new AdminComponent(this.http, this.titleService);
  showAdminOptions = this.showAdminOption.showAdminOptions;

  seeAdmins = this.showAdminOption.seeAdmins;
  seeEmployees = this.showAdminOption.seeEmployees;
  seeMessages = this.showAdminOption.seeMessages;
  seeTasks = this.showAdminOption.seeTasks;

  title = 'Rain SA Nav';

  constructor(private http: HttpClient, private titleService: Title) {}
}
