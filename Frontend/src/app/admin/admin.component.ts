import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Admin, Employee } from './admin.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  // ******************************************************************** //
  //  *************************** ADMINS *************************** //
  // ******************************************************************** //
  adminsUrl = 'http://localhost:3000/admin';

  showAdmin = false;
  showAddAmin = false;
  showSingleAdmin = false;

  editOptions = true;
  editCard = false;
  password = '';

  aLLAdmins: Admin[] = [];
  singleAdmin: Admin[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllAdmin();
  }

  onFetchAllAdmin() {
    this.fetchAllAdmin();
  }

  private fetchAllAdmin() {
    this.http
      .get<{ [key: string]: Admin }>(this.adminsUrl)
      .pipe(
        map((responseData) => {
          const admins: Admin[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              admins.push({ ...responseData[key], id: key });
            }
          }

          return admins;
        })
      )
      .subscribe((admin) => {
        this.aLLAdmins = admin;
      });
  }

  onSelectAdmin(getAdmin: any) {
    this.showAdmin = false;
    this.showSingleAdmin = true;
    this.fetchAdmin(getAdmin);
  }

  private fetchAdmin(getAdmin: any) {
    this.http
      .get<{ [adminUser: string]: Admin }>(
        `http://localhost:3000/admin/${getAdmin}`
      )
      .pipe(
        map((responseData) => {
          const admin: Admin[] = [];

          for (const adminUser in responseData) {
            if (responseData.hasOwnProperty(adminUser)) {
              admin.push({ ...responseData[adminUser], id: adminUser });
            }
          }
          return admin;
        })
      )
      .subscribe((admin) => {
        this.singleAdmin = admin;
      });
  }

  onShowAdmins() {
    this.fetchAllAdmin();
    this.showAdmin = !this.showAdmin;
    this.showAddAmin = false;
    this.showSingleAdmin = false;

    this.showEmployees = false;
    this.showEmployee = false;
  }

  onShowAddAdmin() {
    this.showAddAmin = !this.showAddAmin;
    this.showAdmin = false;
    this.showEmployees = false;

    this.showEmployee = false;
  }

  onAddAdmin(adminData: Admin) {
    this.http
      .post(this.adminsUrl, adminData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    this.fetchAllAdmin();
    this.showAddAmin = false;
    alert(`${adminData.email} added successfully`);
  }

  onShowEditAdmin() {
    this.editCard = true;
    this.editOptions = false;
  }

  onSaveEdit(editAdmin: string) {
    alert('edit');

    this.showAdmin = true;
    this.editCard = false;
  }

  onSendSave(adminEmail: any) {
    this.http
      .put(
        `http://localhost:3000/admin/${adminEmail}`,
        { password: this.password },
        {
          responseType: 'json',
        }
      )
      .subscribe((responseData) => {
        console.log(responseData);
      });
  }

  onCancelEdit() {
    this.editCard = false;
    this.editOptions = true;
  }

  onDelete(deleteAdmin: string) {
    if (confirm(`Are you sure you want to delete ${deleteAdmin}?`) == true) {
      this.http
        .delete(`http://localhost:3000/admin/${deleteAdmin}`)
        .subscribe((responseData) => {
          console.log(responseData);
        });
      this.fetchAllAdmin();

      alert(`${deleteAdmin} deleted successfully`);
    } else {
      alert(`${deleteAdmin} was not deleted`);
    }
    this.showSingleAdmin = false;
  }

  onCancel() {
    this.showAdmin = true;
    this.showSingleAdmin = false;
  }

  // ******************************************************************** //
  //  *************************** EMPLOYEES *************************** //
  // ******************************************************************** //

  // show all employees from db

  showEmployees = false;

  employees: Employee[] = [];

  employeesUrl = `http://localhost:3000/admin/view/employees`;

  onShowEmployees() {
    this.showAddAmin = false;
    this.showAdmin = false;
    this.showSingleAdmin = false;
    this.showEmployees = !this.showEmployees;
    this.showEmployee = false;

    this.fetchEmployees();
  }

  fetchEmployees() {
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
      .subscribe((employee) => {
        this.employees = employee;
      });
  }

  // view single employee

  showEmployee = false;

  employee: Employee[] = [];

  onShowEmployee(employee: string) {
    this.showEmployee = true;
    this.showEmployees = false;
    this.fetchEmployee(employee);
  }

  fetchEmployee(employee: string) {
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

  // edit employee options
  showEditEmployee = false;
  showEmployeeDetails = true;
  EditEmployeeButtons = true;
  saveEmployeeButtons = false;

  showEditOptions() {
    this.showEditEmployee = true;
    this.showEmployeeDetails = false;
    this.EditEmployeeButtons = false;
    this.saveEmployeeButtons = true;
  }

  onCancelEditEmployee() {
    this.showEditEmployee = false;
    this.showEmployeeDetails = true;

    this.EditEmployeeButtons = true;
    this.saveEmployeeButtons = false;
  }

  onCancelViewEmployee() {
    this.showEmployee = false;
    this.showEmployees = true;
  }

  // add employees to db

  showAddEmployee = false;

  employeeUrl = `http://localhost:3000/admin/view/employees`;

  onShowAddEmployees() {
    this.showAddEmployee = !this.showAddEmployee;
    this.showEmployees = false;
    this.showEmployee = false;
  }

  onAddEmployee(employeeData: Employee) {
    this.http
      .post(this.employeeUrl, employeeData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    this.fetchEmployees();
    this.showAddEmployee = false;
    alert(`${employeeData.email} added successfully`);
  }

  // delete employee

  onDeleteEmployee(deleteEmployee: string) {
    if (
      confirm(`Are you sure you want to delete employee ${deleteEmployee}?`) ==
      true
    ) {
      this.http
        .delete(`http://localhost:3000/admin/employee/${deleteEmployee}`)
        .subscribe((responseData) => {
          console.log(responseData);
        });

      this.fetchEmployees();

      alert(`${deleteEmployee} deleted successfully`);
    } else {
      alert(`${deleteEmployee} was not deleted `);
    }
    this.showEmployee = false;
  }
}
