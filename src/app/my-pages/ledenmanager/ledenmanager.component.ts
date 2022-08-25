import { Component, OnInit, ViewChild } from '@angular/core';
import { LedenService, LedenItem, DateRoutines, LedenItemExt } from './../../services/leden.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { LedenDeleteDialogComponent } from '../ledenmanager/ledendelete.dialog';
import { AppError } from '../../shared/error-handling/app-error';
import { DuplicateKeyError } from '../../shared/error-handling/duplicate-key-error';
import { NotFoundError } from '../../shared/error-handling/not-found-error';
import { LedenDialogComponent } from './ledenmanager.dialog';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { SingleMailDialogComponent, SingleMail } from '../mail/singlemail.dialog';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { lastValueFrom } from 'rxjs';
import { IHoldableResponse } from 'src/app/shared/directives/holdable.directive';

@Component({
  selector: 'app-leden',
  templateUrl: './ledenmanager.component.html',
  styleUrls: ['./ledenmanager.component.scss'],
})

export class LedenManagerComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  columnsToDisplay: string[] = ['Naam', 'Leeftijd', 'actions2'];
  dataSource = new MatTableDataSource<LedenItem>();
  progress: number = 0;  // for the progress-spinner in de header

  constructor(private ledenService: LedenService,
    // protected notificationService: NotificationService,
    protected snackBar: MatSnackBar,
    public dialog: MatDialog) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$(true)
        .subscribe({
          next: (data: Array<LedenItem>) => {
            this.dataSource.data = data;
          }
        })
    );
  }



  /***************************************************************************************************
  / Er gaat een nieuw lid worden opgevoerd. We halen eerst een nieuw lidnummer op.
  /***************************************************************************************************/
  async onAdd(): Promise<void> {
    // Hier wordt de call SYNC uitgevoerd!!!!
    // -------------------------------------------------------- :o)
    // const tmpJson = await this.ledenService.getNewLidnr$()
    //   .toPromise()
    //   .then(response => response as string);
    const tmpJson = await lastValueFrom(this.ledenService.getNewLidnr$())
      .then(response => response as string);
    // -------------------------------------------------------- :o)

    const toBeAdded = new LedenItemExt();
    toBeAdded.LidVanaf = new Date().to_YYYY_MM_DD();
    toBeAdded.LidNr = Number(tmpJson['maxlidnr']) + 1;
    toBeAdded.LidType = 'N';  // default lidtype
    toBeAdded.BetaalWijze = 'I';  // defualt betaalwijze Incasso
    toBeAdded.Woonplaats = 'NIEUWEGEIN';
    console.log("LedenManagerComponent --> onAdd --> toBeAdded", toBeAdded);

    // let tmp;
    this.dialog.open(LedenDialogComponent, {
      data: { 'method': 'Toevoegen', 'data': toBeAdded },
      disableClose: true
    })
      .afterClosed()  // returns an observable
      .subscribe({
        next: result => {
          if (result) {  // in case of cancel the result will be false

            this.registerSubscription(
              this.ledenService.create$(result)
                .subscribe({
                  next: (addResult) => {
                    result.Naam = LedenItem.getFullNameAkCt(result.Voornaam, result.Tussenvoegsel, result.Achternaam);
                    result.LeeftijdCategorieBond = DateRoutines.LeeftijdCategorieBond(result.GeboorteDatum);
                    result.Leeftijd = DateRoutines.Age(result.GeboorteDatum);


                    result.VolledigeNaam = LedenItem.getFullNameVtA(result.Voornaam, result.Tussenvoegsel, result.Achternaam);

                    this.dataSource.data.unshift(result);

                    this.refreshTableLayout();
                    this.showSnackBar(SnackbarTexts.SuccessNewRecord);

                    if (LedenItem.GetEmailList(toBeAdded).length > 0) {
                      this.showMailDialog(toBeAdded, 'add');
                    }

                    // let message = "Nieuw lid: " + result.VolledigeNaam + " , " + result.Leeftijd + " jaar"
                    // this.notificationService.sendNotificationsForRole([ROLES.BESTUUR], "Ledenadministratie", message);
                  },
                  error: (error) => {
                    if (error instanceof DuplicateKeyError) {
                      this.showSnackBar(SnackbarTexts.DuplicateKey);
                    } else { throw error; }
                  }
                })
            ) //register
          }
        }
      });
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  public theBoundCallback: Function;
  onDelete($event: IHoldableResponse, index: number): void {
    this.progress = $event.HoldTime;
    if ($event.Status == 'start') {  // first time call
      const data = { 'record': this.dataSource.data[index], 'index': index };
      this.theBoundCallback = this.cbOnDelete.bind(this, data);
    }
    if ($event.Status == 'early') {
      this.showSnackBar(SnackbarTexts.ReleasedToEarly);
    }
  }

  cbOnDelete(data) {
    const toBeDeleted = data.record;
    const index = data.index;
    toBeDeleted.LidTot = new Date().to_YYYY_MM_DD();
    const dialogRef = this.dialog.open(LedenDeleteDialogComponent, {
      data: { 'method': 'Opzeggen', 'data': toBeDeleted },
      disableClose: true
    });

    dialogRef
      .afterClosed()
      .subscribe({
        next: (result: LedenItem) => {
          if (result) {  // in case of cancel the result will be false
            toBeDeleted.LidTot = result.LidTot;
            const updateRecord = { 'LidNr': result.LidNr, 'Opgezegd': '1', 'LidTot': result.LidTot };
            this.registerSubscription(
              this.ledenService.update$(updateRecord)
                .subscribe({
                  next: (data) => {
                    this.dataSource.data.splice(index, 1);
                    this.refreshTableLayout();
                    this.showSnackBar('Jammer, dat dit lid heeft opgezegd');

                    if (LedenItem.GetEmailList(toBeDeleted).length > 0) {
                      this.showMailDialog(toBeDeleted, 'delete');
                    }

                    // let message = "Lid Opgezegd: " + LedenItem.getFullNameVtA(toBeDeleted.Voornaam, toBeDeleted.Tussenvoegsel, toBeDeleted.Achternaam);
                    // this.notificationService.sendNotificationsForRole([ROLES.BESTUUR], "Ledenadministratie", message);
                  },
                  error: (error: AppError) => {
                    if (error instanceof NotFoundError) {
                      this.showSnackBar(SnackbarTexts.NotFound);
                    }
                    this.showSnackBar(SnackbarTexts.NoChanges);
                  }
                })
            );
          }
        }
      });
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  onEdit(index: number): void {
    let toBeEdited: LedenItem = this.dataSource.data[index];

    const dialogRef = this.dialog.open(LedenDialogComponent, {
      data: { 'method': 'Wijzigen', 'data': toBeEdited },
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe({
        next: (result: LedenItemExt) => {
          if (result) {  // in case of cancel the result will be false
            this.registerSubscription(
              this.ledenService.update$(result)
                .subscribe({
                  next: (data) => {
                    result.Naam = LedenItem.getFullNameAkCt(result.Voornaam, result.Tussenvoegsel, result.Achternaam);
                    result.LeeftijdCategorieBond = DateRoutines.LeeftijdCategorieBond(new Date(result.GeboorteDatum));
                    this.refreshTableLayout();
                    this.showSnackBar(SnackbarTexts.SuccessFulSaved);
                  }, //next
                  error: (error) => {
                    if (error instanceof NoChangesMadeError) {
                      this.showSnackBar(SnackbarTexts.NoChanges);
                    } else { throw error; }
                  } // error
                })  // subscribe
            ); //register
          }
        }
      }) // dialog
  }

  /***************************************************************************************************
  / Na het toevoegen of verwijderen van een lid wordt de mail dialoog getoond zodat er een bevestiging
  / verstuurd kan worden.
  /***************************************************************************************************/
  showMailDialog(lid: LedenItemExt, action: string): void {
    let data = new SingleMail();
    switch (action) {
      case 'add':
        data.TemplatePathandName = 'templates/template_aanmelding.html';
        data.Subject = "Aanmelding als nieuw lid bij TTVN";
        break;
      case 'delete':
        data.TemplatePathandName = 'templates/template_opzegging.html';
        data.Subject = "Opzegging lidmaatschap TTVN";
        break;
    }

    data.Lid = lid;

    this.dialog.open(SingleMailDialogComponent, {
      data: data,
      disableClose: true
    })
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  private refreshTableLayout(): void {
    this.dataSource.data.sort((item1, item2) => {
      return (item1.Achternaam.toString().localeCompare(item2.Achternaam.toString(), undefined, { numeric: false }));
    });
    this.table.renderRows();
  }

  /***************************************************************************************************
  / The onRowClick from a row that has been hit
  /***************************************************************************************************/
  onDblclick($event, index): void {
    this.onEdit(index);
  }

  InnerHtmlLabelLeeftijdsCategorie(value: string): string {
    return DateRoutines.InnerHtmlLabelLeeftijdsCategorie(value);
  }
}
