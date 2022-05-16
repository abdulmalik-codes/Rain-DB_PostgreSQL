import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.adminLoggedIn;
    console.log(this.adminLoggedIn);
  }

  adminLoggedIn: boolean = false;

  onLoginAdmin(adminLoggedIn: boolean = true) {
    // console.log('>>>admin is logged in', this.adminLoggedIn);
    return (this.adminLoggedIn = adminLoggedIn);
  }
  // old code

  employeeLogin = true;
  registerEmployee = false;
  forgotPassword = false;

  // login
  onLoginEmployee() {}

  // register

  onShowRegisterEmployee() {
    this.employeeLogin = false;
    this.forgotPassword = false;
    this.registerEmployee = true;
  }
  requestRegister() {}

  onCancelRequest() {
    this.registerEmployee = false;
    this.forgotPassword = false;
    this.employeeLogin = true;
  }

  // forgot password
  onForgotPassword() {
    this.registerEmployee = false;
    this.employeeLogin = false;
    this.forgotPassword = true;
  }

  requestPassword() {}

  onCancelForgot() {
    this.forgotPassword = false;
    this.employeeLogin = true;
  }

  // test
  adminsUrl = 'http://localhost:3000/admin/admin/admin';

  submitProfile(pp: string) {
    this.http
      .post(this.adminsUrl, pp, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`added successfully`);
    // ${pp}
  }
}
