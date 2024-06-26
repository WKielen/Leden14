import { Component, Inject, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { NotFoundError } from 'rxjs';
import { ConfigDialogComponent } from 'src/app/app-nav/headerconfigdialog/config.dialog';
import { AuthService } from 'src/app/services/auth.service';
import { MailBoxParam } from 'src/app/services/mail.service';
import { ParamService } from 'src/app/services/param.service';
import { AppError } from '../shared/error-handling/app-error';
import { DuplicateKeyError } from '../shared/error-handling/duplicate-key-error';
import { NoChangesMadeError } from '../shared/error-handling/no-changes-made-error';
import { SnackbarTexts } from '../shared/error-handling/SnackbarTexts';
import { ParentComponent } from '../shared/parent.component';

@Component({
  selector: 'app-send-mail-settings',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small><div>
  <form [formGroup]="mailboxparamForm" novalidate>

    Deze velden zijn nodig voor het inloggen in je mailbox<br><br>

    <mat-form-field>
        <input matInput type="text" placeholder="Email adres" formControlName="ElecPostAddress"
            pattern="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$">
        <mat-error *ngIf="ElecPostAddress.hasError('email') && !ElecPostAddress.hasError('required')">
            Vul een geldig email adres in
        </mat-error>
        <mat-error *ngIf="ElecPostAddress.hasError('required')">
            Veld is verplicht
        </mat-error>
    </mat-form-field>

    <mat-form-field>
        <input matInput [type]="showPw ? 'text' : 'password'" placeholder="Wachtwoord"
            formControlName="EmailPassword">
        <mat-icon matSuffix (click)="showPw = !showPw">{{showPw ? 'visibility_off' : 'visibility'}}
        </mat-icon>
        <mat-error *ngIf="EmailPassword.hasError('required')">
            Wachtwoord is <strong>verplicht</strong>
        </mat-error>
    </mat-form-field>

    <mat-form-field>
        <input matInput placeholder="Naam afzender" formControlName="EmailSender">
    </mat-form-field>
    </form>
    <button mat-raised-button color="primary" type="button" (click)="onSaveEmailParameters()"
        [disabled]='!mailboxparamForm.valid'>Bewaar</button>

  `,
  styles: ['mat-form-field {display: block;}']
})

export class SendMailSettingsComponent extends ParentComponent {

  showPw: boolean = false;
  mailBoxParam = new MailBoxParam();

  mailboxparamForm = new UntypedFormGroup({
    ElecPostAddress: new UntypedFormControl(
      '',
      [Validators.required, Validators.email]
    ),
    EmailPassword: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    EmailSender: new UntypedFormControl()
  });

  mailForm = new UntypedFormGroup({
    TypeYourMail: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    EmailName: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    EmailSubject: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    SavedMails: new UntypedFormControl(),
  });

  constructor(
    protected paramService: ParamService,
    protected authService: AuthService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit() {
    this.readMailLoginData();
  }

  /***************************************************************************************************
  / Lees de mail box credetials uit de Param tabel
  /***************************************************************************************************/
  readMailLoginData(): void {
    this.paramService.readParamData$('mailboxparam' + this.authService.userId,
      JSON.stringify(new MailBoxParam()),
      'Om in te loggen in de mailbox')
      .subscribe({
        next: (data) => {
          let result = data as string;
          this.mailBoxParam = JSON.parse(result) as MailBoxParam;
          this.ElecPostAddress.setValue(this.mailBoxParam.UserId);
          this.EmailPassword.setValue(this.mailBoxParam.Password);
          this.EmailSender.setValue(this.mailBoxParam.Name);
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
  }

  /***************************************************************************************************
  / De SAVE knop van de email parameters zoals email, wachtwoord
  /***************************************************************************************************/
  onSaveEmailParameters(): void {
    let mailBoxParam = new MailBoxParam();
    mailBoxParam.UserId = this.ElecPostAddress.value;
    mailBoxParam.Password = this.EmailPassword.value;
    mailBoxParam.Name = this.EmailSender.value;

    this.paramService.saveParamData$('mailboxparam' + this.authService.userId,
      JSON.stringify(mailBoxParam),
      'MailBoxParam' + this.authService.userId)
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
        },
        error: (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          }
          else if (error instanceof DuplicateKeyError) {
            this.showSnackBar(SnackbarTexts.DuplicateKey, '');

          }
          else if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          }
          else {
            this.showSnackBar(SnackbarTexts.UpdateError, '');
          }
        }
      })
  }

  get ElecPostAddress(): AbstractControl {
    return this.mailboxparamForm.get('ElecPostAddress');
  }
  get EmailPassword(): AbstractControl {
    return this.mailboxparamForm.get('EmailPassword');
  }
  get EmailSender(): AbstractControl {
    return this.mailboxparamForm.get('EmailSender');
  }
}
