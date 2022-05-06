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
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllAdmin();
    this.fetchEmployees();
  }

  // ******************************************************************** //
  //  *************************** ADMINS *************************** //
  // ******************************************************************** //
  adminsView = false;

  // all admins

  showAdmin = false;

  admins: Admin[] = [];

  adminsUrl = 'http://localhost:3000/admin';

  // add admin
  showAddAdmin = false;

  onShowAddAdmin() {
    this.adminsView = true;
    this.employeesView = false;

    this.showAddAdmin = !this.showAddAdmin;
    this.showAdmin = false;
    this.showEmployees = false;

    this.showEmployee = false;
    this.showAddEmployee = false;
  }

  onAddAdmin(adminData: Admin) {
    this.http
      .post(this.adminsUrl, adminData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    this.fetchAllAdmin();
    this.showAddAdmin = false;
    alert(`${adminData.email} added successfully`);
  }

  onCancelAddAdmin() {
    this.showAddAdmin = false;
    this.showAdmin = true;
  }

  // view all admin users from postgres db
  onShowAdmins() {
    this.fetchAllAdmin();
    this.adminsView = true;
    this.employeesView = false;

    this.showAdmin = !this.showAdmin;
    this.showAddAdmin = false;
    this.showSingleAdmin = false;

    this.showEmployees = false;
    this.showEmployee = false;
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
        this.admins = admin;
      });
  }

  // view single admin

  showSingleAdmin = false;

  admin: Admin[] = [];

  onShowAdmin(getAdmin: any) {
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
        this.admin = admin;
      });
  }

  // edit admin options
  showEditAdmin = false;
  showAdminDetails = true;
  editOptions = true;
  editCard = false;

  onShowEditAdmin() {
    this.showEditAdmin = true;
    this.editOptions = false;
    this.showAdminDetails = false;
  }

  password: any;
  updateAdmin(e: any) {
    this.password = e.target.value;
  }

  onEditAdmin(editAdmin: string) {
    let responseBody = {
      password: this.password,
    };
    this.http
      .put(`http://localhost:3000/admin/${editAdmin}`, responseBody, {
        responseType: 'json',
      })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`${editAdmin}'s password has been updated successfully`);

    this.showEditAdmin = false;
    this.showAdminDetails = true;
    this.editOptions = true;
  }

  onCancelEdit() {
    this.editCard = false;
    this.editOptions = true;
    this.showEditAdmin = false;
    this.showAdminDetails = true;
  }

  // single admin
  onCancel() {
    this.showAdmin = true;
    this.showSingleAdmin = false;
  }

  // delete admin
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

  // ******************************************************************** //
  //  *************************** EMPLOYEES *************************** //
  // ******************************************************************** //

  employeesView = false;

  // all employees

  showEmployees = false;

  employees: Employee[] = [];

  employeesUrl = `http://localhost:3000/admin/view/employees`;

  // add employees to db
  showAddEmployee = false;

  onShowAddEmployees() {
    this.employeesView = true;
    this.adminsView = false;

    this.showAddEmployee = !this.showAddEmployee;
    this.showEmployees = false;
    this.showEmployee = false;

    this.showAdmin = false;
    this.showAddAdmin = false;
  }

  onAddEmployee(employeeData: Employee) {
    this.http
      .post(this.employeesUrl, employeeData, { responseType: 'json' })
      .subscribe((responseData) => {
        console.log(responseData);
      });

    this.fetchEmployees();
    this.showAddEmployee = false;
    alert(`${employeeData.email} added successfully`);
  }

  onCancelAddEmployee() {
    this.showAddEmployee = false;
    this.showEmployees = true;
  }

  // show all employees from db
  onShowEmployees() {
    this.fetchEmployees();
    this.employeesView = true;
    this.adminsView = false;

    this.employeesView = true;
    this.showAddAdmin = false;
    this.showAdmin = false;
    this.showSingleAdmin = false;
    this.showEmployees = !this.showEmployees;
    this.showEmployee = false;
    this.showAddEmployee = false;
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
    this.showEmployees = false;
    this.showEmployee = true;
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
        `http://localhost:3000/admin/employee/${employeeEmail}`,
        responseBody,
        { responseType: 'json' }
      )
      .subscribe((responseData) => {
        console.log(responseData);
      });

    alert(`Employee ${employeeEmail} updated successfully`);

    this.showEditEmployee = false;
    this.showEmployeeDetails = true;
    this.showEmployee = true;
    this.EditEmployeeButtons = true;
  }

  onCancelEditEmployee() {
    this.showEditEmployee = false;
    this.showEmployeeDetails = true;

    this.EditEmployeeButtons = true;
    this.saveEmployeeButtons = false;
  }

  // single employee
  onCancelViewEmployee() {
    this.showEmployee = false;
    this.showEmployees = true;
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
