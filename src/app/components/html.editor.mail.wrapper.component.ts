import { Component, Input, Output, EventEmitter, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MailNameList, MailSaveItem } from "src/app/my-pages/mail/MailBoxParamClasses";
import { AuthService } from 'src/app/services/auth.service';
import { MailService } from 'src/app/services/mail.service';
import { ParamService } from 'src/app/services/param.service';
import { AppError } from '../shared/error-handling/app-error';
import { DuplicateKeyError } from '../shared/error-handling/duplicate-key-error';
import { NoChangesMadeError } from '../shared/error-handling/no-changes-made-error';
import { NotFoundError } from '../shared/error-handling/not-found-error';
import { SnackbarTexts } from '../shared/error-handling/SnackbarTexts';
import { ReplaceCharacters } from '../shared/modules/ReplaceCharacters';
import { ParentComponent } from '../shared/parent.component';

// De html in de template wordt doorgegeven aan het child component. De events worden echter hier afgehandeld.

@Component({
  selector: 'app-html-editor-mail-wrapper',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small><div>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Mail bericht</mat-card-title>
      </mat-card-header>
      <mat-card-content>

        <form [formGroup]="mailForm" novalidate>

          <div fxLayout="row" fxLayout.xs="column" fxLayout.sm="column" fxLayoutAlign="space-evenly start">
            <div fxFlex="0 0 30%">
              <mat-form-field>
                <mat-select placeholder="Bewaarde mails" formControlName="SavedMails"
                  (selectionChange)="onMailNameChanged($event)">
                  <mat-option *ngFor="let item of savedMailNames.MailNameItems" [value]="item">{{item}}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>  <!-- end of fxflex -->

            <div fxFlex="0 0 66%">
              <div fxLayout="column">

                <mat-form-field id="EmailName">
                  <input matInput type="text" placeholder="Naam mail" formControlName="EmailName">
                  <mat-error *ngIf="EmailName.hasError('required')">
                    Veld is verplicht
                  </mat-error>
                </mat-form-field>

                <mat-form-field id="EmailSubject">
                  <input matInput type="text" placeholder="Onderwerp" formControlName="EmailSubject">
                  <mat-error *ngIf="EmailSubject.hasError('required')">
                    Veld is verplicht
                  </mat-error>
                </mat-form-field>

              </div> <!-- end of column -->
            </div> <!-- end of fxflex -->
          </div>  <!-- end of fxlayout -->

          <app-html-editor-formcontrol formControlName="HtmlContent" (htmlContent)="onHtmlOutputChange($event)"></app-html-editor-formcontrol>

          <div class="attachmentbox">
            <button mat-raised-button color="primary" (click)="fileInput.click()" id="attachmentbutton">
              <span>Kies bijlage</span>
              <input #fileInput type="file" (change)="onFileSelected($event)"
                style="display:none; margin: 0px 15px 0px 0px;" />
            </button>
            {{ fileToUpload?.name }}
          </div>
        </form>
      </mat-card-content>

      <mat-card-actions>
        <button mat-raised-button color="primary" (click)='onSaveEmail()' [disabled]='!mailForm.valid'>Bewaar</button>
        <button mat-raised-button color="primary" (click)='onDeleteMail()' [disabled]='!mailForm.valid'>Delete</button>
        <ng-container *ngTemplateOutlet="extraButtonsTemplate"></ng-container>
      </mat-card-actions>

    </mat-card>
`,
  styles: [
    '#EmailSubject {width: 70%; }',
    '#EmailName { margin-right: 20px; }',
    '.attachmentbox { margin-top: 10px; }',
    '#attachmentbutton { margin-right: 20px; }'
  ]
})

export class HtmlEditorMailWrapperComponent extends ParentComponent implements OnInit {

  @Input()
  htmlOutput: string = "<b>Dit is mijn tekst</b>";  // Input voor html editor

  @Input()
  subject: string = 'mijn onderwerp';

  @Input()
  extraButtonsTemplate: TemplateRef<any>;

  @Output()
  htmlContent = new EventEmitter<string>();

  @Output()
  emailSubject = new EventEmitter<string>();

  @Output()
  attachmentFile = new EventEmitter<File>();


  // attachmentcontent: string = '';
  savedMailNames = new MailNameList();

  mailForm = new FormGroup({
    EmailName: new FormControl(
      '',
      [Validators.required]
    ),
    EmailSubject: new FormControl(
      '',
      [Validators.required]
    ),
    SavedMails: new FormControl(),
    HtmlControl: new FormControl(
      '',
      [Validators.required]
    )
  });

  constructor(
    protected snackBar: MatSnackBar,
    protected paramService: ParamService,
    protected authService: AuthService,
    protected mailService: MailService,
  ) {
    super(snackBar);
  }
  ngOnInit(): void {
    if (this.subject)
      this.EmailSubject.setValue(this.subject);
    if (this.htmlOutput)
      this.HtmlControl.setValue(this.htmlOutput);
    this.readMailList();
  }

  /***************************************************************************************************
  / de inhoud van de HTML is gewijzigd
  /***************************************************************************************************/
  onHtmlOutputChange($event) {
    this.htmlOutput = $event
    this.htmlContent.emit(this.htmlOutput);
  }

  /***************************************************************************************************
  / De SAVE knop van de email zelf
  /***************************************************************************************************/
  onSaveEmail(): void {
    let mailSaveItem = new MailSaveItem();
    mailSaveItem.Name = ReplaceCharacters(this.EmailName.value);
    mailSaveItem.Subject = this.EmailSubject.value;
    mailSaveItem.Message = this.htmlOutput;

    let present: boolean = this.savedMailNames.MailNameItems.includes(mailSaveItem.Name);

    if (!present) {
      // Voeg toe aan de namenlijst
      this.savedMailNames.MailNameItems.push(mailSaveItem.Name);

      // bewaar de maillijst
      this.registerSubscription(this.paramService.saveParamData$('mailist' + this.authService.userId,
        JSON.stringify(this.savedMailNames), 'Maillijst' + this.authService.userId)
        .subscribe({
          next: (data) => {
          },
          error: (error: AppError) => {
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey, '');
            } else { throw error; }
          }
        })
      );

      // Bewaar de email
      this.registerSubscription(this.paramService.createParamData$('mail' + this.authService.userId + mailSaveItem.Name,
        JSON.stringify(mailSaveItem), 'Mail' + this.authService.userId)
        .subscribe({
          next: (data) => {
            let tmp = data;
            this.showSnackBar(SnackbarTexts.SuccessNewRecord, '');
          },
          error: (error: AppError) => {
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey, '');
            } else { throw error; }
          }
        })
      );

    }
    else {

      this.registerSubscription(this.paramService.saveParamData$('mail' + this.authService.userId + mailSaveItem.Name,
        JSON.stringify(mailSaveItem), 'Mail' + this.authService.userId)
        .subscribe({
          next: (data) => {
            this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
          },
          error: (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
              this.showSnackBar(SnackbarTexts.NoChanges, '');
            } else { throw error; }
          }
        })
      );
    }
  }

  /***************************************************************************************************
  / Verwijder een bewaarde mail uit de Param tabel
  /***************************************************************************************************/
  onDeleteMail(): void {
    // verwijderen uit lijst
    const index = this.savedMailNames.MailNameItems.indexOf(this.SavedMails.value, 0);
    if (index > -1) {
      this.savedMailNames.MailNameItems.splice(index, 1);
    }

    // bewaar de maillijst
    this.registerSubscription(this.paramService.saveParamData$('mailist' + this.authService.userId,
      JSON.stringify(this.savedMailNames), 'Maillijst' + this.authService.userId)
      .subscribe({
        next: (data) => {
        },
        error: (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          }
          else { throw error; }
        }
      })
    );

    // delete mail
    let key = 'mail' + this.authService.userId + this.SavedMails.value;
    this.registerSubscription(this.paramService.delete$(key)
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessDelete, '');
        },
        error: (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          } else { throw error; }
        }
      })
    );

    this.EmailName.setValue('');
    this.EmailSubject.setValue('');
    this.HtmlControl.setValue('');
    this.htmlOutput = '';
  }



  /***************************************************************************************************
  / Lees het bewaard mail overzicht uit de Param tabel
  /***************************************************************************************************/
  private readMailList(): void {
    this.registerSubscription(this.paramService.readParamData$('mailist' + this.authService.userId, JSON.stringify(new MailNameList()), 'Maillijst' + this.authService.userId)
      .subscribe({
        next: (data) => {
          let result = JSON.parse(data as string) as MailNameList;
          this.savedMailNames = result;
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
    );
  }

  /***************************************************************************************************
  / Lees het bewaarde mail uit de Param tabel
  /***************************************************************************************************/
  private readMail(key: string): void {
    this.registerSubscription(this.paramService.readParamData$(key, JSON.stringify(new MailSaveItem()), 'Mail' + this.authService.userId)
      .subscribe({
        next: (data) => {
          let result = JSON.parse(data as string) as MailSaveItem;
          this.EmailName.setValue(result.Name);
          this.EmailSubject.setValue(result.Subject);
          this.htmlOutput = result.Message;

          // We zetten de waarde van het html control
          this.HtmlControl.setValue(result.Message);

          // we publiceren de veranderde inhoud naar mijn parent
          this.htmlContent.emit(this.htmlOutput);
          this.emailSubject.emit(result.Subject);
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
    );
  }


  /***************************************************************************************************
  / De waarde van de dropdown met email namen is gewijzigd
  /***************************************************************************************************/
  onMailNameChanged($event): void {
    let key = 'mail' + this.authService.userId + $event.value;
    this.readMail(key);
  }

  /**
  * Bijlage kiezen
  * @param files
  */
  fileToUpload: File | null = null;

  onFileSelected($event: any): void {
    // TODO: Hier klopt nog weinig van maar het compileert.
    let fileList: FileList = $event as FileList;

    this.fileToUpload = fileList.item(0)
    this.attachmentFile.emit(fileList.item(0));
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/

  get EmailName() {
    return this.mailForm.get('EmailName');
  }
  get EmailSubject() {
    return this.mailForm.get('EmailSubject');
  }
  get SavedMails() {
    return this.mailForm.get('SavedMails');
  }
  get HtmlControl() {
    return this.mailForm.get('HtmlControl');
  }
}
