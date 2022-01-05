import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InschrijvingItem, InschrijvingService } from 'src/app/services/inschrijving.service';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { ParentComponent } from 'src/app/shared/parent.component';
import { AgendaItem } from 'src/app/services/agenda.service';
import { catchError, forkJoin, of } from 'rxjs';
import { ExportRatingFile } from 'src/app/shared/modules/ExportRatingFile';

@Component({
  selector: 'app-event-subscribtions-dialog',
  templateUrl: './event-subscribtions.dialog.html',
  styles: []
})

export class EventSubscriptionsDialogComponent extends ParentComponent implements OnInit {
  constructor(
    protected snackBar: MatSnackBar,
    private inschrijvingService: InschrijvingService,
    protected ledenService: LedenService,
    public dialogRef: MatDialogRef<EventSubscriptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    super(snackBar)
  }

  public subscriptions: Array<InschrijvingItem> = [];
  public reportList: Array<LedenItemExt> = [];
  public event: AgendaItem = this.data.data as AgendaItem;

  ngOnInit(): void {

    let subInschrijvingen = this.inschrijvingService.getSubscriptionsEvent$(this.data.data.Id)
      .pipe(
        catchError(err => of(new Array<InschrijvingItem>()))
      );

    let subLeden = this.ledenService.getActiveMembers$()
      .pipe(
        catchError(err => of(new Array<LedenItemExt>()))
      );

    this.registerSubscription(
      forkJoin([subInschrijvingen, subLeden,])
        .subscribe({
          next: (data) => {
            this.subscriptions = data[0];
            let ledenLijst = data[1];

            this.subscriptions.forEach((inschrijving: InschrijvingItem) => {
              // let reportItem = new ReportItem();
              let lid: LedenItemExt = new LedenItemExt();

              let index = ledenLijst.findIndex((lid: LedenItemExt) => (lid.LidNr == inschrijving.LidNr));

              if (inschrijving.LidNr != 0 && index != -1) {
                lid = ledenLijst[index];
              }

              lid['OpgegevenNaam'] = inschrijving.Naam;
              lid['Email'] = inschrijving.Email;
              lid['ExtraInformatie'] = inschrijving.ExtraInformatie;

              this.reportList.push(lid);
            });
            // this.list = localList;

          },
          error: (error: AppError) => {
            console.log("EventSubscriptionsDialogComponent --> ngOnInit --> error", error);
          }
        })
    );
  }

  onClickDownload(): void {
    console.log("EventSubscriptionsDialogComponent --> onClickDownload --> this.reportList", this.reportList);
    ExportRatingFile(this.reportList, 'Inschrijvingen ' + this.event.EvenementNaam);
  }
}
