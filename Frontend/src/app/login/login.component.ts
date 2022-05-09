import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  employeeLogin = true;
  registerEmployee = false;
  forgotPassword = false;

  constructor() {}

  ngOnInit(): void {}

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
}
