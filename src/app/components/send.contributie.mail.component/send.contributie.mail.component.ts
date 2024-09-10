import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParamService } from 'src/app/services/param.service';
import { ContributieBedragen } from 'src/app/shared/classes/ContributieBedragen';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { CreateContributieMail } from 'src/app/shared/modules/ContributieCalcFunctions';
import { ParentComponent } from 'src/app/shared/parent.component';
import { LedenItemExt, LedenService, LidTypeValues } from 'src/app/services/leden.service';
import { MailItem } from 'src/app/services/mail.service';
import { MailDialogComponent } from 'src/app/my-pages/mail/mail.dialog';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-send-controbutie-mail',
  templateUrl: './send.contributie.mail.component.html',
  styleUrls: ['./send.contributie.mail.component.scss']
})

export class SendContributieMailComponent extends ParentComponent implements OnInit {

  @Input() ledenArray: Array<LedenItemExt> = new Array<LedenItemExt>();
  @Input() contributieBedragen = null;
  @Input() tekstOpAfschrift: string = null;
  @Input() datumIncasso: string = "2021-01-01";
  @Input() extraMailText: string = null;

  constructor(
    protected ledenService: LedenService,
    protected paramService: ParamService,
    protected snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    
    if (this.ledenArray == null) {
      console.log('array = null', this.ledenArray);
      // if (this.ledenArray.length == 0) 
      this.readActiveMembers();
    }
    if (!this.contributieBedragen)
      this.readContributieBedragen();
    if (!this.tekstOpAfschrift)
      this.readTekstOpAfschrift();
    if (!this.datumIncasso)
      this.readDatumIncasso();
    if (!this.extraMailText)
      this.readExtraMailText();
  }

  /***************************************************************************************************
  / Lees de leden waarvoor de contributie moet worden gemaakt. 'true' betekent dat ook de IBAN wordt ingelezen
  /***************************************************************************************************/
  readActiveMembers(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$(true)
        .subscribe({
          next: (data) => {
            this.ledenArray = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  readContributieBedragen(): void {
    this.registerSubscription(
      this.paramService.readParamData$("ContributieBedragen", JSON.stringify(new ContributieBedragen()), 'Contributie bedragen')
        .subscribe({
          next: (data) => {
            this.contributieBedragen = JSON.parse(data as string) as ContributieBedragen;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Lees de extra param uit de Param tabel
  / - Omschrijving op afschrift
  /***************************************************************************************************/
  readTekstOpAfschrift(): void {
    this.registerSubscription(
      this.paramService.readParamData$("TekstOpAfschrift", '', 'De omschrijvingsregel op de contributie mail')
        .subscribe({
          next: (data) => {
            this.tekstOpAfschrift = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / Lees de extra param uit de Param tabel
  / - Omschrijving op afschrift
  /***************************************************************************************************/
  readDatumIncasso(): void {
    this.registerSubscription(
      this.paramService.readParamData$("DatumIncasso", '', '2021-01-01')
        .subscribe({
          next: (data) => {
            this.datumIncasso = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  readExtraMailText(): void {
    this.registerSubscription(
      this.paramService.readParamData$("ExtraContributieMailTekst", '', 'Extra tekst op de contributie mail')
        .subscribe({
          next: (data) => {
            this.extraMailText = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / De tekst rekeningafschrift is gewijzigd
  /***************************************************************************************************/
  onSaveChangedFields(): void {
    this.registerSubscription(
      this.paramService.saveParamData$("ExtraContributieMailTekst", this.extraMailText, 'Extra tekst op de contributie mail')
        .subscribe({
          next: (data) => {
          },
          error: (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
            } else { throw error; }
          }
        }))
  }

/***************************************************************************************************
/ 
/***************************************************************************************************/
  onSendMail(): void {
    let mailItems = new Array<MailItem>();

    let date = new Date(this.datumIncasso);

    this.ledenArray.forEach(lid => {

      if (lid.LidType == LidTypeValues.CONTRIBUTIEVRIJ) return; // Contributie vrij
      let mailItem = CreateContributieMail(lid, this.contributieBedragen, this.tekstOpAfschrift, formatDate(date, 'dd-MM-yyyy', 'nl-NL'));
      if (!mailItem) return;
      if (this.extraMailText != '') {
        mailItem.Message += '<br>';
        mailItem.Message += this.extraMailText;
      }
      mailItem.Message += '<br><br>Met vriendelijke groet,<br>Penningmeester TTVN';
      mailItems.push(mailItem);
    });

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
}
