import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminComponent } from './admin/admin.component';
import { EmployeeComponent } from './employee/employee.component';
import { FooterComponent } from './footer/footer.component';
import { ViewAdminComponent } from './admin/view-admin/view-admin.component';
import { ViewEmployeeComponent } from './admin/view-employee/view-employee.component';
import { ViewMessagesComponent } from './admin/view-messages/view-messages.component';
import { ViewTasksComponent } from './admin/view-tasks/view-tasks.component';
import { SingleAdminComponent } from './admin/view-admin/single-admin/single-admin.component';
import { SingleEmployeeComponent } from './admin/view-employee/single-employee/single-employee.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    AdminComponent,
    EmployeeComponent,
    FooterComponent,
    ViewAdminComponent,
    ViewEmployeeComponent,
    ViewMessagesComponent,
    ViewTasksComponent,
    SingleAdminComponent,
    SingleEmployeeComponent,
    RegisterComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
  ],
  providers: [Title],
  bootstrap: [AppComponent],
})
export class AppModule {}
