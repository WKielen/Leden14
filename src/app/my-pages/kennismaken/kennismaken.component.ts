import { Component, OnInit, ViewChild } from '@angular/core';
import { ParamService, ParamItem } from 'src/app/services/param.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyTable as MatTable, MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MailKennismakerDialogComponent } from './mail-kennismaker-dialog/mail-kennismaker.dialog';
import { LedenItemExt } from 'src/app/services/leden.service';
import { MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS as MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/legacy-checkbox';

@Component({
  selector: 'app-kennismaken',
  templateUrl: './kennismaken.component.html',
  styleUrls: ['./kennismaken.component.scss'],
})

export class KennisMakenComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  displayedColumns: string[] = ['Name', 'Telnr', 'Email', 'DateFrom'];
  dataSource = new MatTableDataSource<KennismakerItem>();
  fabButtons = [];  // dit zijn de buttons op het scherm
  fabIcons = [{ icon: 'mail_outline' },{ icon: 'save' }, { icon: 'add' }];
  titleOfLadderPage: string = '';

  constructor(private paramService: ParamService,
    protected snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.readLadderItem();
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  /***************************************************************************************************
  / Lees het record uit de Param tabel
  /***************************************************************************************************/
  readLadderItem(): void {
    let sub = this.paramService.readParamData$("kennismakers", JSON.stringify(new Kennismakers()), "Kennismakers")
      .subscribe({
        next: (data) => {
          let result = data as string;
          let tmp: Kennismakers = JSON.parse(result);
          this.dataSource.data = tmp.KennismakersItems;
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Er is een fab gedrukt
  /***************************************************************************************************/
  onFabClick(event, buttonNbr): void {

    switch (event.srcElement.innerText) {
      case 'save':
        this.onSave();
        break;
      case 'add':
        this.onAdd();
        break;
      case 'mail_outline':
        this.onMail();
        break;
    }
  }

  /***************************************************************************************************
  / Add a new line to the table
  /***************************************************************************************************/
  onAdd(): void {
    let item = new KennismakerItem();
    this.dataSource.data.push(item);
    this.table.renderRows();
  }

  /***************************************************************************************************
  / Save the table
  /***************************************************************************************************/
  onSave(): void {
    // first remove empty rows
    for (let i = this.dataSource.data.length - 1; i >= 0; i--) {
      if (this.dataSource.data[i].Name == '') {
        this.dataSource.data.splice(i, 1);
      }
    }
    this.table.renderRows();

    // put the content in Value of a param and save the param
    let ladder = new Kennismakers();

    this.dataSource.data.forEach(element => {
      let item = new KennismakerItem();
      item.Name = element.Name;
      item.Telnr = element.Telnr;
      item.Email = element.Email;
      item.Vanaf = element.Vanaf;
      ladder.KennismakersItems.push(item);
    });

    let param = new ParamItem();
    param.Id = 'kennismakers';
    param.Description = 'Kennismakers';
    param.Value = JSON.stringify(ladder);

    let sub = this.paramService.saveParamData$(param.Id, param.Value, param.Description)
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

  onMail(): void {

    let leden = new Array<LedenItemExt>();
    this.dataSource.data.forEach(element => {
      let item = new LedenItemExt();
      item.Naam = element.Name;
      item.Email1 = element.Email;
      item['checked'] = true;
      leden.push(item);
    });



    const dialogRef = this.dialog.open(MailKennismakerDialogComponent, {
      // autoFocus: false,
      // height: '90vh !important',
      // width: '400px !important',
      data: {
        data: leden,
      },
    });
  }


}





export class KennismakerItem {
  Name: string = '';
  Telnr: string = '';
  Email: string = '';
  Vanaf: string = '';



}

export class Kennismakers {
  KennismakersItems: KennismakerItem[] = [];
}