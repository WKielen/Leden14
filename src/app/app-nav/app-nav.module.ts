import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConfigDialogComponent } from './headerconfigdialog/config.dialog';
import { NotificationDialogComponent } from './headernotificationdialog/notification.dialog';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { DefaultComponent } from './default/default.component';
import { A2hsSafariHow2 } from '../shared/components/a2hs-ios-safari-how2/a2hs-ios-safari-how2';
import { LoginComponent } from './login/login.component';
import { NotallowedComponent } from './notallowed/notallowed.component';
import { SignInDialogComponent } from './sign-in-dialog/sign-in.dialog';
import { OfflineComponent } from './offline/offline.component';
import { CustomMaterialModule } from '../material.module';
import { RegisterDialogComponent } from './register-dialog/register.dialog';
import { RegistrationComponent } from './registration/registration.component';
import { HoldableModule } from '../shared/directives/directives.module';
import { RegistrationDetailDialogComponent } from './registration/registration.detail.dialog';
import { RegistrationDialogComponent } from './registration/registration.dialog';
import { RolesDialogComponent } from './registration/roles.dialog';
import { ResetPasswordDialogComponent } from './resetpassword-dialog/password.reset.dialog';
import { ComponentsModule } from '../components/component.module';
import { WimsLibModule } from 'wims-lib';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    DefaultComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    ConfigDialogComponent,
    NotificationDialogComponent,
    A2hsSafariHow2,
    NotallowedComponent,
    OfflineComponent,
    LoginComponent,
    SignInDialogComponent,
    RegisterDialogComponent,
    RegistrationComponent,
    RegistrationDetailDialogComponent,
    RegistrationDialogComponent,
    RolesDialogComponent,
    ResetPasswordDialogComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    CustomMaterialModule,
    HoldableModule,
    ComponentsModule,
    WimsLibModule.forRoot({ config: environment }),   // Zie module (en service)  voor implementatie van forRoot

  ],
})

export class AppNavModule { }
