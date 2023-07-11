import { Component, OnInit, ViewChild } from '@angular/core';
import { LedenService, LedenItemExt } from '../../services/leden.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { ParentComponent } from 'src/app/shared/parent.component';
import { TrainingstijdItem, TrainingstijdService } from 'src/app/services/trainingstijd.service';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { CountingValues } from 'src/app/shared/modules/CountingValues';
import { AppError } from 'src/app/shared/error-handling/app-error';

@Component({
  selector: 'app-trainingsgroep',
  templateUrl: './trainingsgroep.component.html',
  styleUrls: ['./trainingsgroep.component.scss']
})
export class TrainingGroupsComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  predefinedDisplayColumns: string[] = ['Naam', 'Ma1', 'Ma2', 'Di1', 'Di2', 'Wo1', 'Wo2', 'Do1', 'Do2', 'Vr1', 'Vr2', 'Za1', 'Za2', 'Zo1', 'Zo2'];
  displayedColumns: string[] = ['Naam'];
  dataSource = new MatTableDataSource<trainingsgroepLine>();
  fabButtons = [];  // dit zijn de buttons op het scherm
  fabIcons = [{ icon: 'save' }, { icon: 'cloud_download' }];
  trainingsTijden: Array<TrainingstijdItem> = [];
  categories = new CountingValues([]);

  constructor(
    protected ledenService: LedenService,
    protected trainingstijdService: TrainingstijdService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.trainingstijdService.getAll$()
        .subscribe({
          next: (data: Array<TrainingstijdItem>) => {
            this.trainingsTijden = data;
            this.trainingsTijden.forEach(tijdstip => {
              this.displayedColumns.push(tijdstip.Code);
            });
            this.vulLidInGroepLijst();
          },
          error: (error: AppError) => {
            console.log("error", error);
          }
        })
    );
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  vulLidInGroepLijst() {
    this.dataSource.data = [];
    this.registerSubscription(
      this.ledenService.getYouthMembers$()
        .subscribe({
          next: (data: Array<LedenItemExt>) => {
            data.forEach(lid => {
              let tmp: trainingsgroepLine = Object();
              tmp.Naam = lid.VolledigeNaam;
              this.trainingsTijden.forEach(tijdstip => {
                tmp[tijdstip.Code] = false;
              });
              let tg = lid.TrainingsGroepen == null || lid.TrainingsGroepen == '' ? [] : JSON.parse(lid.TrainingsGroepen);
              tg.forEach(tijdstip => {
                tmp[tijdstip] = true;
                this.categories.Increment(tijdstip);
              });
              tmp.Dirty = false;
              tmp.LidNr = lid.LidNr;
              this.dataSource.data.push(tmp);
            });
            this.table.renderRows();
          }
        }));
  }

  onCheckboxChange(event, row, column, rowindex, colindex): void {
    if (event.checked)
      this.categories.Increment(column);
    else
      this.categories.Decrement(column);
    row[column] = event.checked;
    row.Dirty = true;
  }

  onFabClick(event, buttonNbr): void {
    switch (buttonNbr) {
      case 0: this.onFabClickSave(event);
        break;
      case 1: this.onFabClickDownload(event);
        break;
    }
  }

  onFabClickSave(event): void {
    try {
      this.dataSource.data.forEach(element => {
        if (element.Dirty) {
          element.Dirty = false;

          let geselecteerdeDagen = [];
          this.trainingsTijden.forEach(tijdstip => {
            if (element[tijdstip.Code]) {
              geselecteerdeDagen.push(tijdstip.Code);
            }
          });

          const updateRecord = {
            'LidNr': element.LidNr,
            'TrainingsGroepen': JSON.stringify(geselecteerdeDagen),
          };
          let sub = this.ledenService.update$(updateRecord)
          .subscribe({
            error: (error: AppError) => {
              console.log("error", error);
            }
          })
          this.registerSubscription(sub);
        }
      });
      this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
    }
    catch (e) {
      this.showSnackBar(SnackbarTexts.UpdateError, '');
    }
  }

  onFabClickDownload(event): void {
    this.showSnackBar('Nog niet gedaan', '');
  }
}

export interface trainingsgroepLine {
  LidNr: number;
  Naam: string;
  Dirty: boolean;
}
