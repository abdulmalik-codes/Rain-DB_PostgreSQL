import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AdminComponent } from '../admin/admin.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnChanges {
  constructor(
    private http: HttpClient,
    private titleService: Title,
    public router?: Router
  ) {}

  ngOnInit(): void {
    this.loggedAdmin;
    console.log(this.loggedAdmin);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.errors);
  }

  loginUrl = `http://localhost:3000/login`;

  errors: string[] = [];
  // showAdminOption = new AdminComponent(this.http, this.titleService);
  // loggedAdmin = this.showAdminOption.adminLogged; //false

  navOptions = new NavbarComponent(this.http, this.titleService);
  loggedAdmin = this.navOptions.adminLogged;

  loginAdmin(adminEmail: string) {
    this.http
      .post(this.loginUrl, adminEmail, {
        responseType: 'json',
      })
      .subscribe((responseData) => {
        console.log(responseData);

        let noEmployee = 'Employee Does not Exist';
        let logged = 'Login success';

        if (responseData === noEmployee) {
          this.errors.push(noEmployee);
        }

        if (responseData === logged) {
          console.log('login true');
          console.log('admin log value : ', this.loggedAdmin);

          this.loggedAdmin = true;

          console.log('admin log value : ', this.loggedAdmin);

          this.router?.navigate(['admin']);
        }

        if (this.errors.length > 0) {
          console.log(this.errors);

          // this.errors = this.errors;
        }

        return this.loggedAdmin;
      });
  }
}
