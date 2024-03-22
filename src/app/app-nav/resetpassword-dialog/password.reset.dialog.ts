import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { UserItem, UserService } from 'src/app/services/user.service';
import { MailService } from 'src/app/services/mail.service';
import { passwordMatchValidator } from './passwordValidator';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-password-reset-dialog',
  templateUrl: './password.reset.dialog.html',
  styles: ['mat-form-field {width: 100%; }',
    `.internalcard {border: 1px solid rgba(0, 0, 0, 0.03); box-shadow: 2px 5px 5px lightgrey;
                margin: 15px; border-radius: 5px;}`,
    '.internalcardcontent { margin: 10px 10px 10px 20px;}'
  ],
  providers: [{ provide: 'param', useValue: 'progress' }]
})

// De provider is om door een param door te geven aan de MailService.
// Dit lukt nog niet.

export class ResetPasswordDialogComponent extends BaseComponent {

  showPw: boolean = false;
  responseText: string = '';
  error: boolean = false;

  registerForm = new UntypedFormGroup({
    userid: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    password1: new UntypedFormControl(
      '',
      [Validators.required, Validators.minLength(6)]
    ),
    password2: new UntypedFormControl(
      '',
      [Validators.required]
    )
  }, { validators: passwordMatchValidator }
  );

  constructor(
    private userService: UserService,
    private mailService: MailService,
  ) { super() }



  onChangePassword() {
    let user = new UserItem();
    user.Userid = this.userid.value;
    user.ProposedPassword = this.password1.value;
    this.registerSubscription(
      this.userService.storeNewPassword$(user)
      .subscribe({
        next: (data) => {
          this.error = false;
          this.responseText = "Je ontvangt een mail met een link. Als je op deze link klikt dan wordt je nieuwe password geactiveerd."
        },
        error: (error: AppError) => {
          this.error = true;
          if (error instanceof NoChangesMadeError) {
            this.responseText = "Je hebt dit verzoek al een keer gestuurd."
          } else if (error instanceof NotFoundError) {
            this.responseText = "Gebruikersnaam is onbekend."
          } else {
            throw error;
          }
      }
      })
    );
  }

  /***************************************************************************************************
  / Check passwords are equal
  /***************************************************************************************************/
  onPasswordInput() {
    if (this.registerForm.hasError('passwordMismatch'))
      this.password2.setErrors([{ 'passwordMismatch': true }]);
    else
      this.password2.setErrors(null);
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/

  get userid() {
    return this.registerForm.get('userid');
  }
  get password1() {
    return this.registerForm.get('password1');
  }
  get password2() {
    return this.registerForm.get('password2');
  }
}




