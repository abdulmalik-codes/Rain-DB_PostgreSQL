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

  // edit employee
  seeEditEmployee = false;

  editEmployee(employeeEmail: string) {
    let responseBody = {
      name: this.employeeName,
      surname: this.employeeSurname,
      cell: this.employeeCell,
      position: this.employeePosition,
      password: this.employeePassword,
    };

    this.http
      .put(
        `http://localhost:3000/admin/employee/${employeeEmail}`,
        responseBody,
        { responseType: 'json' }
      )
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`Employee ${employeeEmail} updated successfully`);
  }

  // delete employee
  deleteEmployee(deleteEmployee: string) {
    if (
      confirm(`Are you sure you want to delete employee ${deleteEmployee}?`) ==
      true
    ) {
      this.http
        .delete(`http://localhost:3000/admin/employee/${deleteEmployee}`)
        .subscribe((responseData) => {
          console.log(responseData);
        });

      alert(`${deleteEmployee} deleted successfully`);
    } else {
      alert(`${deleteEmployee} was not deleted `);
    }
  }
}
