import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  constructor(private http: HttpClient, public router: Router) {}

  forgotPasswordUrl = `http://localhost:3000/forgot-password/employees`;

  ngOnInit(): void {}
  requestPassword(employeeEmail: string) {
    this.http
      .post(this.forgotPasswordUrl, employeeEmail, {
        responseType: 'json',
      })
      .subscribe((responseData) => {
        let employeeNull = 'Email not in DB';
        let checkEmail = 'Please check your email';

        if (responseData === employeeNull) {
          console.log(employeeNull);
        }

        if (responseData === checkEmail) {
          console.log(checkEmail);

          this.router.navigate(['login']);
        }
      });
  }
}
