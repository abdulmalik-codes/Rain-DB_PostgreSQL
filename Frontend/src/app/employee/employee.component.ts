import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Employee } from '../admin/admin.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEmployee();
  }

  // get employee

  employee: Employee[] = [];

  // employeeEmail = 'abdul-malik.mohamed@rain.co.za';
  // employeeEmail: string ${employeeEmail}
  fetchEmployee() {
    this.http
      .get<{ [rainEmployee: string]: Employee }>(
        `http://localhost:3000/employee/abdul-malik.mohamed@rain.co.za`
      )
      .pipe(
        map((responseData) => {
          const employee: Employee[] = [];
          for (const rainEmployee in responseData) {
            if (responseData.hasOwnProperty(rainEmployee)) {
              employee.push({
                ...responseData[rainEmployee],
                id: rainEmployee,
              });
            }
          }
          return employee;
        })
      )
      .subscribe((employee) => {
        this.employee = employee;
        console.log(this.employee);
      });
  }

  employeeCard = true;
  showEmployee = false;
  showEmployeeDetails = true;

  options = true;

  viewEmployee = true;

  onShowEmployee() {
    this.showEmployee = true;
    this.employeeCard = false;

    this.showMessages = false;
    this.showTasks = false;

    // this.viewEmployee = true;
  }

  onCancelViewProfile() {
    this.showEmployee = false;
    this.showMessages = true;
    this.showTasks = true;
    this.employeeCard = true;
  }

  // edit
  editEmployee = false;

  onShowEdit() {
    this.editEmployee = true;
    this.showEmployeeDetails = false;
  }

  // get input values
  employeeName: any;
  updateEmployeeName(n: any) {
    this.employeeName = n.target.value;
  }

  employeeSurname: any;
  updateEmployeeSurname(s: any) {
    this.employeeSurname = s.target.value;
  }

  employeeCell: any;
  updateEmployeeCell(c: any) {
    this.employeeCell = c.target.value;
  }

  employeePosition: any;
  updateEmployeePosition(po: any) {
    this.employeePosition = po.target.value;
  }

  employeePassword: any;
  updateEmployeePassword(pa: any) {
    this.employeePassword = pa.target.value;
  }

  onEditEmployee(employeeEmail: string) {
    let responseBody = {
      name: this.employeeName,
      surname: this.employeeSurname,
      cell: this.employeeCell,
      position: this.employeePosition,
      password: this.employeePassword,
    };

    this.http
      .put(
        `http://localhost:3000/employee/abdul-malik.mohamed@rain.co.za`,
        responseBody,
        { responseType: 'json' }
      )
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`Employee ${employeeEmail} updated successfully`);

    this.editEmployee = false;
    this.showEmployeeDetails = true;
  }

  onCancelEdit() {
    this.editEmployee = false;
    this.showEmployeeDetails = true;
  }

  // messages
  showMessages = true;

  // tasks
  showTasks = true;
}
