import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterDialogComponent } from '../register-dialog/register.dialog';
import { BaseComponent } from 'src/app/shared/base.component';
import { ResetPasswordDialogComponent } from '../resetpassword-dialog/password.reset.dialog';
import { ROUTE } from 'src/app/services/website.service';
import { AppError } from 'src/app/shared/error-handling/app-error';

@Component({
  selector: 'app-signin-dialog',
  templateUrl: './sign-in.dialog.html',
  styles: ['mat-form-field {width: 100%; }',
    `.internalcard {border: 1px solid rgba(0, 0, 0, 0.03); box-shadow: 2px 5px 5px lightgrey;
                margin: 15px; border-radius: 5px;}`,
    '.internalcardcontent { margin: 10px 10px 10px 20px;}'
  ],

})
export class SignInDialogComponent extends BaseComponent {

  showPw = false;
  keepSignedIn: boolean;
  responseText: string = '';

  loginForm = new FormGroup({
    userid: new FormControl(
      '',
      [Validators.required] //, Validators.minLength(7), Validators.maxLength(7)]
    ),
    password: new FormControl(
      '',
      [Validators.required, Validators.minLength(6)]
    ),
    keepSignedIn: new FormControl()
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<SignInDialogComponent>,
    public registerDialog: MatDialog,

  ) {
    super()
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  onSubmit(): void {
    const credentials = {
      'userid': this.loginForm.value['userid'], 'password': this.loginForm.value['password'],
      'database': environment.databaseName, 'keepsignedin': this.loginForm.value['keepSignedIn'] ? 'true' : 'false'
    };
    this.authService.login$(credentials)
    .subscribe({
      next: (data) => {
        if (data) {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigate([returnUrl || ROUTE.dashboardPageRoute]);
          this.dialogRef.close(true);
        } else {
          this.responseText = "De combinatie van Userid en Wachtwoord bestaat niet";
        }
      },
      error: (error: AppError) => {
        this.responseText = "De combinatie van Userid en Wachtwoord bestaat niet";
      }
    })
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  onRegister(): void {
    this.registerDialog.open(RegisterDialogComponent, { width: '400px' });
    this.dialogRef.close();
  }

  onResetPassword(): void {
    this.registerDialog.open(ResetPasswordDialogComponent, { width: '400px' });
    this.dialogRef.close();
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get userid() {
    return this.loginForm.get('userid');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
