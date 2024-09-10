import { Component } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SignInDialogComponent } from '../sign-in-dialog/sign-in.dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(
    public signinDialog: MatDialog,
  ) { }

  openSigninDialog(): void {
    this.signinDialog.open(SignInDialogComponent, { width: '400px' });
  }
}
