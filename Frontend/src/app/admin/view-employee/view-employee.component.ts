import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../admin.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.css'],
})
export class ViewEmployeeComponent implements OnInit {
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.fetchEmployees();
  }

  // to view a single admin, employee will = true
  employee = false;

  // view all employees

  employees: Employee[] = [];

  employeesUrl = 'http://localhost:3000/admin/view/employees';

  private fetchEmployees() {
    this.http
      .get<{ [key: string]: Employee }>(this.employeesUrl)
      .pipe(
        map((responseData) => {
          const employees: Employee[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              employees.push({ ...responseData[key], id: key });
            }
          }
          return employees;
        })
      )
      .subscribe((employees) => {
        this.employees = employees;
        console.log(this.employees);
      });
  }

  // add employee

  addEmployeeCard = false;

  addEmployee(employeeData: Employee) {
    this.http
      .post(this.employeesUrl, employeeData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`${employeeData.email} added successfully`);
  }
}
