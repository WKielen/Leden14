import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LedenItem, LedenItemExt } from 'src/app/services/leden.service';
import { MailBoxParam, MailItem, MailItemTo, MailService } from 'src/app/services/mail.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MailDialogComponent } from 'src/app/my-pages/mail/mail.dialog';
import { ParentComponent } from '../shared/parent.component';
import { Replace, ReplaceKeywords } from '../shared/modules/ReplaceKeywords';
import { Observable, ReplaySubject } from 'rxjs';
import { AppError } from '../shared/error-handling/app-error';
import { AuthService } from 'src/app/services/auth.service';
import { ParamService } from 'src/app/services/param.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-send-mail',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <mat-card>
    <mat-card-header>
          <mat-card-title>Verstuur Mail</mat-card-title>
    </mat-card-header>
    <mat-card-content [formGroup]="extraMailForm" novalidate>
      <mat-checkbox color="primary" formControlName="EigenMail" (change)='onEigenMailChange()'>Stuur ook een mail naar mezelf</mat-checkbox>
      <br>
      <mat-form-field>
        <input matInput type="text" (ngModelChange)='onEigenMailChange()' placeholder="Eventeel extra email adres" formControlName="EmailExtra"
            pattern="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$">
        <mat-error *ngIf="EmailExtra.hasError('email')">
            Vul een geldig email adres in
        </mat-error>
      </mat-form-field>
    </mat-card-content>
    <mat-card-actions>
      <button mat-raised-button color="primary" (click)="onSendMail($event)" [disabled]='nbrOfPersonsToMail == 0'
      [disabled]='!extraMailForm.valid'
      matBadge={{nbrOfPersonsToMail}} matBadgePosition="after" matBadgeColor="warn">Verzend mail</button>
    </mat-card-actions>
</mat-card>
`,
  styles: []
})

export class SendMailComponent extends ParentComponent implements OnInit, OnChanges {

  @Input()
  itemsToMail: Array<LedenItemExt> = [];

  @Input()
  htmlContent: string = '';

  @Input()
  emailSubject: string = '';

  @Input()
  attachmentFile: File | null = null;

  @Input()
  public replaceLinkCallback: Function;

  extraMailForm = new FormGroup({
    EmailExtra: new FormControl(
      '',
      [Validators.email]
    ),
    EigenMail: new FormControl(),
  });

  private attachmentContent: string = '';

  // I use this to send an extra mail to myself
  private mailBoxParam = new MailBoxParam();

  constructor(
    protected mailService: MailService,
    private authService: AuthService,
    private paramService: ParamService,
    protected snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.paramService.readParamData$('mailboxparam' + this.authService.userId,
        JSON.stringify(new MailBoxParam()),
        'Om in te loggen in de mailbox')
        .subscribe({
          next: (data) => {
            let result = data as string;
            this.mailBoxParam = JSON.parse(result) as MailBoxParam;
          },
          error: (error: AppError) => {
            console.log("error", error);
          }
        })
    );
  }


  /***************************************************************************************************
  / Verstuur de email
  /***************************************************************************************************/
  async onSendMail($event): Promise<void> {

    let mailItems =  new Array<MailItem>();

    this.itemsToMail.forEach(lid => {
      let mailAddresses: Array<MailItemTo> = LedenItem.GetEmailList(lid);

      mailAddresses.forEach(element => {
        let itemToMail = new MailItem();
        itemToMail.Message = ReplaceKeywords(lid, this.htmlContent);
        itemToMail.Subject = this.emailSubject;
        itemToMail.To = element.To;
        itemToMail.ToName = element.ToName;

        itemToMail.Attachment = this.attachmentContent ?? '';
        itemToMail.Type = this.attachmentFile?.type ?? '';
        itemToMail.FileName = this.attachmentFile?.name ?? '';

        let myPersonaliedLink = this.replaceLinkCallback(lid);
        itemToMail.Message = Replace(itemToMail.Message, /%link%/gi, myPersonaliedLink);

        mailItems.push(itemToMail);
      });
    });

    if (this.EmailExtra.value != '') {
      mailItems.push(this.addExtraEmailAddressToList(this.EmailExtra.value, new LedenItemExt));
    }

    if (this.EigenMail.value as boolean) {
      let lid = new LedenItemExt();
      lid.Voornaam = this.authService.firstname;
      lid.Achternaam = this.authService.fullName;
      mailItems.push(this.addExtraEmailAddressToList(this.mailBoxParam.UserId, lid, '<br><strong><i>Dit is een kopie mail naar jezelf</i></strong><br><br>'));
    }

    if (mailItems.length <= 0) {
      this.showSnackBar('Er zijn geen email adressen geselecteerd', '');
      return;
    }

    const dialogRef = this.dialog.open(MailDialogComponent, {
      panelClass: 'custom-dialog-container', width: '400px',
      data: mailItems
    });

    dialogRef
      .afterClosed()
      .subscribe({
        next: (result: any) => {
          if (result) {  // in case of cancel the result will be false
            console.log('result', result);
          }
        }
      });
  }

  /***************************************************************************************************
  / De attachment file is gewijzigd. We lezen deze nieuwe file direct in
  /***************************************************************************************************/
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('attachmentFile')) {
      if (changes['attachmentFile'].currentValue != undefined && changes['attachmentFile'].firstChange == false) {
        this.convertFile(this.attachmentFile).subscribe({
          next: (data) => {
            this.attachmentContent = data;
          },
          error: (error: AppError) => {
            console.log("SendMailComponent --> this.convertFile --> error", error);
          }
        });
      }
    }
    this.setNbrOfPersonsToMail();
  }


  /**
  * Converts file
  * @param file
  * @returns file
  */
  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  addExtraEmailAddressToList(extraEmail: string, lid: LedenItemExt, extraText: string = ''): MailItem {

    lid.Email1 = extraEmail;
    let extraMail = new MailItem();

    extraMail.Message = extraText + ReplaceKeywords(lid, this.htmlContent);
    extraMail.Subject = this.emailSubject;
    extraMail.To = extraEmail;
    extraMail.ToName = '';

    extraMail.Attachment = this.attachmentContent ?? '';
    extraMail.Type = this.attachmentFile?.type ?? '';
    extraMail.FileName = this.attachmentFile?.name ?? '';

    let myPersonaliedLink = this.replaceLinkCallback(lid);
    extraMail.Message = Replace(extraMail.Message, /%link%/gi, myPersonaliedLink);
    return extraMail;
  }

  onEigenMailChange() {
    this.setNbrOfPersonsToMail();
  }

  public nbrOfPersonsToMail = 0;
  setNbrOfPersonsToMail() {
    this.nbrOfPersonsToMail = this.itemsToMail.length;
    if (this.EmailExtra.value != '') {
      this.nbrOfPersonsToMail++;
    }

    if (this.EigenMail.value as boolean) {
      this.nbrOfPersonsToMail++;
    }
  }

  get EmailExtra() {
    return this.extraMailForm.get('EmailExtra');
  }
  get EigenMail() {
    return this.extraMailForm.get('EigenMail');
  }
}
