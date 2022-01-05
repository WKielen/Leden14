import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AuthService } from "src/app/services/auth.service";
import { LedenItem, LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { ParamService } from 'src/app/services/param.service';
import { ParentComponent } from "src/app/shared/parent.component";
import { AppError } from 'src/app/shared/error-handling/app-error';
import { LedenDialogComponent } from '../ledenmanager/ledenmanager.dialog';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { DuplicateKeyError } from 'src/app/shared/error-handling/duplicate-key-error';
@Component({
  selector: "app-test",
  templateUrl: "./comp-admin.component.html",
  styleUrls: ["./comp-admin.component.scss"],
})
export class CompAdminComponent extends ParentComponent implements OnInit {
  constructor(private ledenService: LedenService,
    private paramService: ParamService,
    public dialog: MatDialog,
    private authService: AuthService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  private bondsNummers = [];
  private ledenLijst: LedenItemExt[] = [];

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  public dataSource = new MatTableDataSource<LidDifference>();
  public columnsToDisplay: string[] = ['Naam', 'Verschil', 'actions1'];


  ngOnInit(): void {
    this.readnasComplijst();
    this.readLedenLijst();
  }

  /***************************************************************************************************
  / Lees het bewaard mail overzicht uit de Param tabel
  /***************************************************************************************************/
  private readnasComplijst(): void {
    let sub = this.paramService.readParamData$('nasComplijst' + this.authService.userId, JSON.stringify([]), 'NAS Ledenlijst' + this.authService.userId)
      .subscribe({
        next: (data) => {
          this.bondsNummers = JSON.parse(data as string) as any;;
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines: Array<string> = reader.result.toString().trim().split('\n');
      this.SubtractBondsNummers(lines);
      if (lines.length > 0) {
        this.addImportedNasLedenToDB();
      }
      this.onCompare();
    }
    reader.readAsText(this.selectedFile);
  }

  /***************************************************************************************************
  / Aanname: Iedere regel van het bestand begint met een bondsnummer
  /***************************************************************************************************/
  private SubtractBondsNummers(lines: Array<string>): void {
    this.bondsNummers = [];
    lines.forEach(line => {
      if (line.search(/TTVN/gi) == -1) return;
      // ik heb hier alleen regels over met TTVN spelers
      const comps: Array<string> = line.split(' ');
      this.bondsNummers.push(comps[0]);
    });
  }

  /***************************************************************************************************
  / Vergelijk de lijst bondsnummers met de ledenlijst
  /***************************************************************************************************/
  onCompare(): void {
    this.dataSource = new MatTableDataSource<LidDifference>();

    this.ledenLijst.forEach(lid => {
      let bondsnummerFound: boolean = false;
      this.bondsNummers.forEach(bondsnummer => {
        if (lid.BondsNr == bondsnummer) {
          bondsnummerFound = true;
          return;
        }
      });
      if (bondsnummerFound && !lid.CompGerechtigd.toBoolean()) {
        this.dataSource.data.push(addToDifferenceList(lid.Naam, 'Staat in team maar is niet CG in admin', lid));
      }
      if (!bondsnummerFound && lid.CompGerechtigd.toBoolean()) {
        this.dataSource.data.push(addToDifferenceList(lid.Naam, 'CG in admin maar staat niet in een team', lid));
      }
    });
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
                  this.readnasComplijst();
                  this.readLedenLijst();
                  this.showSnackBar(SnackbarTexts.SuccessFulSaved);
                },
                error: (error: AppError) => {
                  if (error instanceof NoChangesMadeError) {
                    this.showSnackBar(SnackbarTexts.NoChanges);
                  } else { throw error; }
                }
              });
            this.registerSubscription(sub);
          }
        }
      });
  }

  /***************************************************************************************************
  / We hebben een Nas export ingelezen. Deze gaan we in de DB bewaren
  /***************************************************************************************************/
  private addImportedNasLedenToDB(): void {
    this.paramService.saveParamData$('nasComplijst' + this.authService.userId, JSON.stringify(this.bondsNummers), 'NAS Ledenlijst' + this.authService.userId)
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

  onFileSelected($event: any): void {
    // TODO: Hier klopt nog weinig van maar het compileert.
    let fileList: FileList = $event as FileList;

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
