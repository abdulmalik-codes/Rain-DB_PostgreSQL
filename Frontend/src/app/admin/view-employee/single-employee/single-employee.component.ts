import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Employee } from '../../admin.model';

@Component({
  selector: 'app-single-employee',
  templateUrl: './single-employee.component.html',
  styleUrls: ['./single-employee.component.css'],
})
export class SingleEmployeeComponent implements OnInit {
  constructor(private http: HttpClient, private route?: ActivatedRoute) {}

  employeeEmail = '';
  ngOnInit(): void {
    this.employeeEmail = this.route?.snapshot.params['employeeEmail'];
    this.fetchEmployee(this.employeeEmail);
  }

  employee: Employee[] = [];
  // get employee details

  private fetchEmployee(employee: string) {
    this.http
      .get<{ [singleEmployee: string]: Employee }>(
        `http://localhost:3000/admin/employee/${employee}`
      )
      .pipe(
        map((responseData) => {
          const employee: Employee[] = [];

          for (const singleEmployee in responseData) {
            if (responseData.hasOwnProperty(singleEmployee)) {
              employee.push({
                ...responseData[singleEmployee],
                id: singleEmployee,
              });
            }
          }
          return employee;
        })
      )
      .subscribe((employee) => {
        this.employee = employee;
      });
  }
}
