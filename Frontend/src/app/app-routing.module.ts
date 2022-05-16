import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { SingleAdminComponent } from './admin/view-admin/single-admin/single-admin.component';
import { ViewAdminComponent } from './admin/view-admin/view-admin.component';
import { SingleEmployeeComponent } from './admin/view-employee/single-employee/single-employee.component';
import { ViewEmployeeComponent } from './admin/view-employee/view-employee.component';
import { ViewMessagesComponent } from './admin/view-messages/view-messages.component';
import { ViewTasksComponent } from './admin/view-tasks/view-tasks.component';
import { EmployeeComponent } from './employee/employee.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin Page' },
    children: [
      {
        path: 'view-admins',
        component: ViewAdminComponent,
        data: { title: 'All Admins' },
        children: [
          {
            path: ':adminEmail',
            component: SingleAdminComponent,
            data: { title: 'View Admin' },
          },
        ],
      },
      {
        path: 'view-employees',
        component: ViewEmployeeComponent,
        data: { title: 'All Employees' },
        children: [
          {
            path: ':employeeEmail',
            component: SingleEmployeeComponent,
            data: { title: 'View Employee' },
          },
        ],
      },
      {
        path: 'view-messages',
        component: ViewMessagesComponent,
        data: { title: 'View Messages' },
      },
      {
        path: 'view-tasks',
        component: ViewTasksComponent,
        data: { title: 'View Tasks' },
      },
    ],
  },
  {
    path: 'employee',
    component: EmployeeComponent,
    data: { title: 'Employee' },
  },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
