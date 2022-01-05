import { Component, Inject, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  <!-- <mat-card>
    <mat-card-content> -->
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
    <!-- </mat-card-content>

    <mat-card-actions> -->
        <button mat-raised-button color="primary" type="button" (click)="onSaveEmailParameters()"
            [disabled]='!mailboxparamForm.valid'>Bewaar</button>
    <!-- </mat-card-actions>
  </mat-card> -->

  `,
  styles: ['mat-form-field {display: block;}']
})

export class SendMailSettingsComponent extends ParentComponent {

  showPw: boolean = false;
  mailBoxParam = new MailBoxParam();

  mailboxparamForm = new FormGroup({
    ElecPostAddress: new FormControl(
      '',
      [Validators.required, Validators.email]
    ),
    EmailPassword: new FormControl(
      '',
      [Validators.required]
    ),
    EmailSender: new FormControl()
  });

  mailForm = new FormGroup({
    TypeYourMail: new FormControl(
      '',
      [Validators.required]
    ),
    EmailName: new FormControl(
      '',
      [Validators.required]
    ),
    EmailSubject: new FormControl(
      '',
      [Validators.required]
    ),
    SavedMails: new FormControl(),
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


  get ElecPostAddress() {
    return this.mailboxparamForm.get('ElecPostAddress');
  }
  get EmailPassword() {
    return this.mailboxparamForm.get('EmailPassword');
  }
  get EmailSender() {
    return this.mailboxparamForm.get('EmailSender');
  }
}
