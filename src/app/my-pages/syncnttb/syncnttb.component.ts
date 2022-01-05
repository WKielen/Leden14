import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LedenService, LedenItemExt, LedenItem } from '../../services/leden.service';
import { AppError } from '../../shared/error-handling/app-error';
import { DuplicateKeyError } from '../../shared/error-handling/duplicate-key-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { read, write, utils, WorkBook } from 'xlsx'
import { ParamService } from 'src/app/services/param.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { LedenDialogComponent } from '../ledenmanager/ledenmanager.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-syncnttb-page',
  templateUrl: './syncnttb.component.html',
  styleUrls: ['./syncnttb.component.scss']
})

// De XLS upload zit in een externe package 'xlsx'

export class SyncNttbComponent extends ParentComponent implements OnInit {

  constructor(private ledenService: LedenService,
    private paramService: ParamService,
    private authService: AuthService,
    public dialog: MatDialog,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  // nasLedenItems = new NasLedenList();
  private nasLedenItems = [];
  private ledenLijst: LedenItemExt[] = [];

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  public dataSource = new MatTableDataSource<LidDifference>();
  public columnsToDisplay: string[] = ['Naam', 'Verschil', 'actions1'];


  ngOnInit(): void {
    this.readNasLedenLijst();
    this.readLedenLijst();
  }

  /***************************************************************************************************
  / Lees het bewaard mail overzicht uit de Param tabel
  /***************************************************************************************************/
  private readNasLedenLijst(): void {
    let sub = this.paramService.readParamData$('nasLedenlijst' + this.authService.userId, JSON.stringify([]), 'NAS Ledenlijst' + this.authService.userId)
      .subscribe({
        next: (data) => {
          this.nasLedenItems = JSON.parse(data as string) as any;;
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Lees TTVN Ledenlijst uit DB
  /***************************************************************************************************/
  private readLedenLijst(): void {
    let sub = this.ledenService.getActiveMembers$()
      .subscribe({
        next: (data) => {
          this.ledenLijst = data;
          this.onCompare();
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Importeer de NAS ledenlijst
  /***************************************************************************************************/
  async onClickLedenLijstImport(): Promise<void> {

    let fileReader = new FileReader();
    let arrayBuffer: any;
    fileReader.onload = (e) => {
      arrayBuffer = fileReader.result;
      var data = new Uint8Array(arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      this.nasLedenItems = utils.sheet_to_json(worksheet, { raw: true });
      // console.log('this.nasLedenItems.NasLedenItems', this.nasLedenItems.NasLedenItems);

      if (this.nasLedenItems.length > 0) {
        this.addImportedNasLedenToDB();
      }
      else {
        this.showSnackBar('De geimporteerde ledenlijst is niet goed.', '');
      }
      this.onCompare();
    }
    fileReader.readAsArrayBuffer(this.selectedFile);
  }

  /***************************************************************************************************
  / Vergelijk de ledenlijst van de bond met die van TTVN
  /***************************************************************************************************/
  onCompare(): void {
    this.dataSource = new MatTableDataSource<LidDifference>();

    for (let i_ttvn = 0; i_ttvn < this.ledenLijst.length; i_ttvn++) {
      let lid_ttvn = this.ledenLijst[i_ttvn];
      let lid_ttvn_in_nas: boolean = false;
      innerloop:
      for (let i_nas = 0; i_nas < this.nasLedenItems.length; i_nas++) {
        let lid_nas = this.nasLedenItems[i_nas];

        if (lid_ttvn.BondsNr == lid_nas['Bondsnr']) {
          lid_ttvn_in_nas = true;
          if (String(lid_ttvn.CompGerechtigd).toBoolean() && lid_nas['CG'] == 'N') {
            this.dataSource.data.push(addToDifferenceList(lid_ttvn.Naam, 'CG: Wel in ttvn maar niet in NAS', lid_ttvn));
          }
          if (!String(lid_ttvn.CompGerechtigd).toBoolean() && lid_nas['CG'] == 'J') {
            this.dataSource.data.push(addToDifferenceList(lid_ttvn.Naam, 'CG: Wel in NAS maar niet in ttvn', lid_ttvn));
          }
          break innerloop;
        }
      }
      // Dit lid staat niet in NAS maar staat wel als zodanig in de administratie
      if (String(lid_ttvn.LidBond).toBoolean() && !lid_ttvn_in_nas) {
        this.dataSource.data.push(addToDifferenceList(lid_ttvn.Naam, 'LB: Wel in ttvn maar niet NAS', lid_ttvn));
      }
    }

    for (let i_nas = 0; i_nas < this.nasLedenItems.length; i_nas++) {
      let lid_nas = this.nasLedenItems[i_nas];
      let lid_nas_in_ttvn: boolean = false;
      innerloop:
      for (let i_ttvn = 0; i_ttvn < this.ledenLijst.length; i_ttvn++) {
        let lid_ttvn = this.ledenLijst[i_ttvn];
        if (lid_ttvn.BondsNr == lid_nas['Bondsnr']) {

          lid_nas_in_ttvn = true;
          break innerloop;
        }
      }

      if (!lid_nas_in_ttvn) {
        this.dataSource.data.push(addToDifferenceList(lid_nas['Naam'], 'LB: Wel in NAS niet in TTVN', null));
      }
    }
    // console.log('ledenDif', this.ledenDifferences);
    this.table.renderRows();
  }

  /***************************************************************************************************
  / Er is een verschil. Dit gaan we via een dialoog oplossen.
  /***************************************************************************************************/
  onEdit(index: number): void {
    let difRecord: LidDifference = this.dataSource.data[index];
    if (!difRecord.lid) {
      this.snackBar.open('Dit lid bestaat niet in de administratie');
      return;
    }

    const toBeEdited: LedenItem = difRecord.lid;

    const dialogRef = this.dialog.open(LedenDialogComponent, {
      panelClass: 'custom-dialog-container', width: '1200px',
      data: { 'method': 'Wijzigen', 'data': toBeEdited }
    });

    dialogRef.afterClosed()
      .subscribe({
        next: (result: LedenItem) => {
          // console.log('received in OnEdit from dialog');
          if (result) {  // in case of cancel the result will be false
            let sub = this.ledenService.update$(result)
              .subscribe({
                next: (data) => {
                  this.readNasLedenLijst();
                  this.readLedenLijst();
                  this.showSnackBar(SnackbarTexts.SuccessFulSaved);
                },
                error: (error: AppError) => {
                  if (error instanceof NoChangesMadeError) {
                    this.showSnackBar(SnackbarTexts.NoChanges);
                  } else { throw error; }
                }
              })
            this.registerSubscription(sub);
          }
        }
      });

  }

  /***************************************************************************************************
  / We hebben een Nas export ingelezen. Deze gaan we in de DB bewaren
  /***************************************************************************************************/
  private addImportedNasLedenToDB(): void {
    this.paramService.saveParamData$('nasLedenlijst' + this.authService.userId,
      JSON.stringify(this.nasLedenItems),
      'NAS Ledenlijst' + this.authService.userId)
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

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  selectedFile: File = null;
  uploadFileName: string = '';

  onFileSelected(fileList: FileList): void {
    this.selectedFile = fileList[0];
    this.uploadFileName = this.selectedFile.name;
  }
}

/***************************************************************************************************
/ Difference between out admin and the NTTB admin
/***************************************************************************************************/
export class LidDifference {
  public naam: string = '';
  public verschil: string = '';
  public lid: LedenItemExt;
}

function addToDifferenceList(name: string, message: string, lid: LedenItemExt): LidDifference {
  let dif = new LidDifference();
  dif.naam = name;
  dif.verschil = message;
  dif.lid = lid;
  return dif;
}
