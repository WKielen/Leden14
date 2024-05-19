import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { UserItem, UserService } from 'src/app/services/user.service';
import { DuplicateKeyError } from 'src/app/shared/error-handling/duplicate-key-error';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register.dialog.html',
  styles: ['mat-form-field {width: 100%; }',
    `.internalcard {border: 1px solid rgba(0, 0, 0, 0.03); box-shadow: 2px 5px 5px lightgrey;
                margin: 15px; border-radius: 5px;}`,
    '.internalcardcontent { margin: 10px 10px 10px 20px;}'
  ],
  providers: [{ provide: 'param', useValue: 'progress' }]
})

// De provider is om door een param door te geven aan de MailService.
// Dit lukt nog niet.

export class RegisterDialogComponent extends BaseComponent {

  showPw: boolean = false;
  responseText: string = '';
  error: boolean = false;

  registerForm = new UntypedFormGroup({
    firstname: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    lastname: new UntypedFormControl(
      '',
      [Validators.required]
    ), email: new UntypedFormControl(
      '',
      [Validators.required, Validators.email]
    ),
    userid: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    password: new UntypedFormControl(
      '',
      [Validators.required, Validators.minLength(6)]
    ),
  });

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
  ) {
    super()
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  async onSubmit() {
    let user = new UserItem();
    user.Userid = this.userid.value;
    user.Email = this.email.value;
    user.FirstName = this.firstname.value;
    user.LastName = this.lastname.value;
    user.Password = this.password.value;

    this.userService.register$(user)
    .subscribe({
      next: (data) => {
        if (data.hasOwnProperty('Key')) {
          this.responseText = 'Registratie gelukt. \nNa goedkeuring door de vereniging krijg je een mail dat je account is geactiveerd. Vanaf dat moment kan je aanloggen.';
          this.error = false;
        } else {
          this.responseText = data;
        }
      },
      error: (error: AppError) => {
        if (error instanceof DuplicateKeyError) {
          this.responseText = "Deze gebruiker bestaat al";
          this.error = true;
        } else { throw error; }
    }
    })
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get firstname() {
    return this.registerForm.get('firstname');
  }
  get lastname() {
    return this.registerForm.get('lastname');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get userid() {
    return this.registerForm.get('userid');
  }
  get password() {
    return this.registerForm.get('password');
  }
}
