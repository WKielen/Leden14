import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { AppError } from '../../shared/error-handling/app-error';
import { ParamService, ParamItem } from 'src/app/services/param.service';
import { WebsiteText } from 'src/app/shared/classes/WebsiteText';
import { WebsiteDialogComponent } from './website.dialog';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { IHoldableResponse } from 'src/app/shared/directives/holdable.directive';

@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrls: ['./website.component.scss'],
})

export class WebsiteComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  columnsToDisplay: string[] = ['StartDate', 'EndDate', 'Header', 'actions2'];
  dataSource = new MatTableDataSource<WebsiteText>();
  progress: number = 0;  // for the progress-spinner in de header

  constructor(private paramService: ParamService,
    protected snackBar: MatSnackBar,
    public dialog: MatDialog) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.readWebsiteTexts();
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  onAdd(): void {
    const toBeAdded = new WebsiteText();
    this.dialog.open(WebsiteDialogComponent, {
      data: { 'method': 'Toevoegen', 'data': toBeAdded }
    })
      .afterClosed()  // returns an observable
      .subscribe({
        next: (data) => {
          if (data) {  // in case of cancel the result will be false
            this.dataSource.data.unshift(data); // voeg de regel vooraan in de tabel toe.
            this.refreshTableLayout();
            this.saveParam();
          }
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  public theBoundCallback: Function;
  onDelete($event: IHoldableResponse, index: number): void {
    this.progress = $event.HoldTime;
    if ($event.Status == 'start') {  // first time call
      this.theBoundCallback = this.cbOnDelete.bind(this, index);
    }
    if ($event.Status == 'early') {
      this.showSnackBar(SnackbarTexts.ReleasedToEarly);
    }
  }

  cbOnDelete(index) {
    this.dataSource.data.splice(index, 1);
    this.progress = 0;
    this.saveParam();
    this.refreshTableLayout();
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  onEdit(index: number): void {
    let toBeEdited: WebsiteText = this.dataSource.data[index];

    let tmp;
    const dialogRef = this.dialog.open(WebsiteDialogComponent, {
      data: { 'method': 'Wijzigen', 'data': toBeEdited, maxwidth: '300px' }
    });

    dialogRef
      .afterClosed()
      .subscribe({
        next: (data: WebsiteText) => {
          if (data) {  // in case of cancel the result will be false
            this.refreshTableLayout();
            this.saveParam();
          }
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
  }

  /***************************************************************************************************
  / De tabel is aangepast dus opnieuw renderen
  /***************************************************************************************************/
  private refreshTableLayout(): void {
    this.dataSource.data.sort((item1, item2) => {
      return (item1.StartDate.toString().localeCompare(item2.StartDate.toString(), undefined, { numeric: false }));
    });
    this.table.renderRows();
  }

  /***************************************************************************************************
  / The onRowClick from a row that has been hit
  /***************************************************************************************************/
  onDblclick($event, index): void {
    this.onEdit(index);
  }

  /***************************************************************************************************
  / Lees het record uit de Param tabel
  /***************************************************************************************************/
  private readWebsiteTexts(): void {
    let sub = this.paramService.readParamData$("getinstantwebsitetext", JSON.stringify(new Array<WebsiteText>()), "Mededelingen op website")
      .subscribe({
        next: (data) => {
          let result = data as string;
          this.dataSource.data = JSON.parse(result) as WebsiteText[];
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Bewaar het record in de Param tabel
  /***************************************************************************************************/
  private saveParam(): void {
    let param = new ParamItem();
    param.Id = 'getinstantwebsitetext';
    param.Description = 'Mededeling op de website';
    param.Value = JSON.stringify(this.dataSource.data);
    console.log('param.Value', param.Value);

    let sub = this.paramService.saveParamData$('getinstantwebsitetext', param.Value, 'Mededeling op de website')
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
        },
        error: (error: AppError) => {
          if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          } else { throw error; }
        }
      });
    this.registerSubscription(sub);
  }
}

 // see: https://github.com/angular-university/angular-material-course/blob/2-data-table-finished/src/app/services/lessons.datasource.ts
