import { Component, OnInit, ViewChild } from '@angular/core';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { MatDialog } from '@angular/material/dialog';
import { MatGridList } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Observable, forkJoin, lastValueFrom } from 'rxjs';
import { TrainingService, TrainingItem } from 'src/app/services/training.service';
import { calcBetweenDates } from 'src/app/shared/modules/DateRoutines';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import { ParamService } from 'src/app/services/param.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { AuthService } from 'src/app/services/auth.service';
import { TrainingOverzichtDialogComponent } from './trainingoverzicht.dialog';
import { DialogRecord } from './DialogRecord';
import { ParentComponent } from 'src/app/shared/parent.component';

@Component({
  selector: 'app-trainingoverzicht',
  templateUrl: './trainingoverzicht.component.html',
  styleUrls: ['./trainingoverzicht.component.scss']
})
export class TrainingOverzichtComponent extends ParentComponent implements OnInit {

  @ViewChild(MatGridList, {static: false}) table: MatGridList;
  public NAME_COL_SIZE: number = 3;

  public columns: Array<Date> = [];   // De kolommen waar de datums in staan
  public headerTiles: Array<Tile> = [];
  public deelNameTiles: Array<Tile> = [];
  private ledenList: Array<LedenItemExt> = [];
  private databaseRecord = new DatabaseRecord();
  private aanwezigheidsList = new Dictionary([]);  // lijst key is lidnr, value is datumlijst met status

  fabButtons = [];  // dit zijn de buttons op het scherm
  fabIcons = [{ icon: 'menu' }];

  constructor(
    protected ledenService: LedenService,
    protected paramService: ParamService,
    protected trainingService: TrainingService,
    protected authService: AuthService,
    protected dialog: MatDialog,
    protected snackBar: MatSnackBar,

  ) {
    super(snackBar)
  }

  /***************************************************************************************************
  / De eerste call om de param te lezen wordt SYNC uitgevoerd. Dit doe ik omdat de eerste keer het param
  / record nog niet aanwezig is. Het wordt dan gecreerd. Eerst had ik deze call in de 'forkJoin' zitten
  / maar daar valt hij uit vanwege de NotFound Error. Daarom apart en sync omdat de data nodig is
  / voordat de bovenste regel gevuld kan worden. Nu weet ik zeker dat de data er is.
  / Als je denkt dat dit anders en netter kan dan hoor ik het graag.
  /***************************************************************************************************/
  ngOnInit() {
    this.readOrCreateParamRecord();  // zie tekst in kop
    let sub = this.requestDataFromMultipleSources()
    .subscribe({
      next: (data) => {
        this.ledenList = data[0];
        this.aanwezigheidsList = this.ReorganisePresenceArray(data[1]);

        this.FillFirstRow();
        this.FillLedenRows(this.aanwezigheidsList);
      },
      error: (error: AppError) => {
        this.showSnackBar('Er zijn nog geen gegevens voor deze periode', '');
      }
    })

    this.registerSubscription(sub);
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  /***************************************************************************************************
  / De SYNC call voor het ophalen van de parameter
  /***************************************************************************************************/
  async readOrCreateParamRecord(): Promise<void> {
    await lastValueFrom(this.readParamData$())
      .catch(e => { })   // Hier wordt de NotFound weggevangen
      .then(response => {
        if (response) {  // In geval van een NotFound is de response leeg
          this.databaseRecord = JSON.parse(response as string);
        }
      });
  }

  /***************************************************************************************************
  / Haal de volgende gegevens op en ga verder als ze allemaal klaar zijn
  / 1. Jeugdleden
  / 2. Aanwezigheids registratie
  /***************************************************************************************************/
  private requestDataFromMultipleSources(): Observable<any[]> {
    let response1 = this.ledenService.getYouthMembers$();
    let response2 = this.trainingService.getFromDate$(this.CalculateBeginOfSeasonDate());
    return forkJoin([response1, response2]);
  }

  /***************************************************************************************************
  / Read the Parameterfrom the database
  /***************************************************************************************************/
  private readParamData$(): Observable<Object> {
    this.databaseRecord.displayDaysOfWeek = [1, 3, 4]; // default value in case param record is not present
    this.databaseRecord.showEmptyLines = true;         // default value in case param record is not present
    return this.paramService.readParamData$("PresenceOverviewParams" + this.authService.userId, JSON.stringify(this.databaseRecord), 'Parameters deelname training overzicht');
  }

  /***************************************************************************************************
   / We zijn via de Exit button uit de dialog gekomen. Nu de wijzigingen bewaren in de param tabel
   / - Voorkeurs trainingsdagen
   /***************************************************************************************************/
  private SaveChangedParamFields(param: DatabaseRecord): void {
    let sub = this.paramService.saveParamData$("PresenceOverviewParams" + this.authService.userId, JSON.stringify(param), 'Parameters deelname training overzicht')
    .subscribe({
      next: (data) => {
      },
      error: (error: AppError) => {
        console.log("error", error);
      }
    })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Fill the leden rows
  /***************************************************************************************************/
  private FillLedenRows(aanwezigheidsList): void {

    // We maken de naam van spelers rood als ze een aantal dagen niet op de club zijn geweest.
    // dit is de uiterste datum waarop ze aanwezig geweest zouden moeten zijn.
    let alarmBeginDate: Date = moment(new Date()).subtract(this.databaseRecord.alertAfterNumberOfDays, 'days').toDate();

    // de tiles hebben geen regels. We moeten dus zelf uitrekenen wanneer het einde van de regel is en
    // vervolgens weer een 'naam'-tile moeten maken.
    // de loops gaan alsvolgt:
    //  Loop door de leden
    //     Loop door de (header) colommen
    //        Loop door de data waarop het lid aanwezig is geweest.

    this.deelNameTiles = [];
    for (let ledenListCounter = 0; ledenListCounter < this.ledenList.length; ledenListCounter++) {
      let lid = this.ledenList[ledenListCounter];

      let datumsPerLid = aanwezigheidsList.get(lid.LidNr.toString());  // lijst met datums uit de dictionary
      if ((!datumsPerLid || datumsPerLid.length == 0) && this.databaseRecord.showEmptyLines == false) {
        continue;
      }

      // In deze sectie controleer ik of het lid afgelopen periode aanwezig is geweest
      let isLidRecentAanwezigGeweest = false;
      if (datumsPerLid && datumsPerLid.length > 0) {
        datumsPerLid.forEach(element => {
          if (new Date(element.Date) > alarmBeginDate &&
            (element.State == TrainingItem.AANWEZIG || element.State == TrainingItem.AFGEMELD)) {
            isLidRecentAanwezigGeweest = true;
          }
        });
      }

      // Create the first tile of the row with the name of the member
      let tile = new Tile(this.ledenList[ledenListCounter].VolledigeNaam, '#babdbe', '', this.NAME_COL_SIZE);
      if (!isLidRecentAanwezigGeweest) {
        tile.color = 'red';
        tile.toolTip = 'Lange tijd afwezig';
      }
      this.deelNameTiles.push(tile);


      // Create the column behind the 'name' column
      for (let columnsCounter = 0; columnsCounter < this.columns.length; columnsCounter++) {       // Voor alle datums in de header ga ik zoeken of het lid aanwezig was
        let tile = new Tile('', 'lightgrey', '');               // default grijs
        if (datumsPerLid == null) {                                 // er is niets ingevuld voor deze datum
          this.deelNameTiles.push(tile);
        } else {
          // Er zijn datums maar zit de zoekdatum ertussen?
          for (let datumCounter = 0; datumCounter < datumsPerLid.length; datumCounter++) {
            if (datumsPerLid[datumCounter].Date == this.columns[columnsCounter].to_YYYY_MM_DD()) {    // Gevonden, nu naar de state kijken.
              switch (datumsPerLid[datumCounter].State) {
                case TrainingItem.AFWEZIG:
                  tile.color = Tile.GEEN_STATUS_COLOR;
                  break;
                case TrainingItem.AANWEZIG:
                  tile.color = Tile.AANWEZIG_COLOR;
                  break;
                case TrainingItem.AFGEMELD:
                  tile.color = Tile.AFGEMELD_COLOR;
                  break;
              }
            }
          } //datums loop
          this.deelNameTiles.push(tile);
        }  // einde else tak
      }  // columns loop
    } // leden loop
  }

  /***************************************************************************************************
  / Fill the first row with the dates
  /***************************************************************************************************/
  private FillFirstRow(): void {
    let beginOfSeasonDate: Date = this.CalculateBeginOfSeasonDate();
    let numberOfDays = calcBetweenDates(new Date(), beginOfSeasonDate).days + 1; // aantal dagen

    let tile = new Tile('', '#babdbe', '', this.NAME_COL_SIZE);
    this.headerTiles = [];
    this.columns = [];
    this.headerTiles.push(tile);

    for (let i = 0; i < numberOfDays; i++) {
      let date: Date = moment(beginOfSeasonDate).add(i, 'days').toDate();
      if (this.databaseRecord.displayDaysOfWeek.indexOf(date.getDay()) !== -1) {
        this.columns.push(date);
        let color = '#babdbe';
        switch (date.getDay()) {
          case 0: color = '#babdbe'; break;  // https://material.io/resources/color/#!/?view.left=0&view.right=0
          case 1: color = '#9ea7aa'; break;  // De kleuren zijn van de Blue Grey variant
          case 2: color = '#808e95'; break;
          case 3: color = '#62757f'; break;
          case 4: color = '#4b636e'; break;
        }
        let tile = new Tile(date.to_YYYY_MM_DD(), color, date.toLocaleDateString('nl-NL', { weekday: 'long' }));
        this.headerTiles.push(tile);
      }
    }
  }

  /***************************************************************************************************
  / Bereken het begin van het seizoen. Dat is 1 juli of 1 januari afhankelijk van huidige datum
  /***************************************************************************************************/
  private CalculateBeginOfSeasonDate(): Date {
    let tmp = '';
    if ((new Date()).getMonth() < 7)   // getmonth begint op 0!!!
      tmp = '-01-01';
    else
      tmp = '-08-15';
    return new Date((new Date()).getFullYear().toString() + tmp);
  }

  /***************************************************************************************************
  / De input bevat Lidnr en status per datum
  / De output bevat een Dictorary met Datum en status per lid.
  /***************************************************************************************************/
  private ReorganisePresenceArray(PresenceList: Array<any>): Dictionary {
    let list: Dictionary = new Dictionary([]);
    // PresenceList: De lijst met ingevulde aanwezigheid. komt rechtstreek uit api call database
    // Deze lijst komt gesorteerd op datum binnen. De dictioray is dus per lid gesorteerd op datum.
    PresenceList.forEach(dag => {
      JSON.parse(dag.Value).forEach(lid => {  // De waarde bevat lidnrs en de status
        if (list.containsKey(lid.LidNr.toString())) {
          list.get(lid.LidNr.toString()).push({ 'Date': dag.Datum, 'State': lid.State });
        } else {
          list.add(lid.LidNr.toString(), [{ 'Date': dag.Datum, 'State': lid.State }]);
        }
      });
    });
    return list;
  }

  /***************************************************************************************************
  / Een van de buttons is geclicked
  /***************************************************************************************************/
  onFabClick(event, buttonNbr): void {
    let dialogRecord = new DialogRecord();
    dialogRecord.displayDaysOfWeek = this.databaseRecord.displayDaysOfWeek;
    dialogRecord.downloadList = this.createDownloadList();
    dialogRecord.showEmptyLines = this.databaseRecord.showEmptyLines;
    dialogRecord.alertAfterNumberOfDays = this.databaseRecord.alertAfterNumberOfDays;
    // console.log('dialogRecord', dialogRecord);

    this.dialog.open(TrainingOverzichtDialogComponent, {
      panelClass: 'custom-dialog-container', width: '500px',
      data: dialogRecord
    })
      .afterClosed()  // returns an observable
      .subscribe({
        next: (data) => {
          if (data) {
            // console.log('result', result);
            this.databaseRecord.displayDaysOfWeek = data.displayDaysOfWeek;
            this.databaseRecord.showEmptyLines = data.showEmptyLines;
            this.databaseRecord.alertAfterNumberOfDays = data.alertAfterNumberOfDays;

            this.SaveChangedParamFields(this.databaseRecord);

            // repaint the form
            this.FillFirstRow();
            this.FillLedenRows(this.aanwezigheidsList);

          }
          },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
  }

  /***************************************************************************************************
  / Ik maak hier een puntcomma separeted file van de huidige weergave. Dit bestand kan in de dialog
  / gedownload worden.
  /***************************************************************************************************/
  private createDownloadList(): string {
    let string = '';
    this.headerTiles.forEach(tile => {
      string += tile.text + ';';
    });
    string += '\n';

    for (let i = 0; i < this.ledenList.length; i++) {
      for (let i = 0; i < (this.deelNameTiles.length / this.headerTiles.length); i++) {
        string += this.deelNameTiles[(i * this.headerTiles.length)].text;
        for (let j = 1; j < this.headerTiles.length; j++) {
          string += this.deelNameTiles[(i * this.headerTiles.length) + j].state() + ';';
        }
        string += '\n';
      }
      return string;
    }
  }
}

/***************************************************************************************************
/ Een tegel in de grid
/***************************************************************************************************/
class Tile {
  constructor(public text: string, public color: string, public toolTip: string, private cols: number = 1) { }

  public static readonly GEEN_STATUS_COLOR = 'lightgrey';
  public static readonly AANWEZIG_COLOR = 'green';
  public static readonly AFGEMELD_COLOR = 'blue';

  public state(): string {
    switch (this.color) {
      case Tile.AANWEZIG_COLOR:
        return 'Aanwezig';
      case Tile.AFGEMELD_COLOR:
        return 'Afgemeld';
      default:
        return '';
    }
  }
}

/***************************************************************************************************
/ This record is stored as param in the db
/***************************************************************************************************/
export class DatabaseRecord {
  constructor(
    public displayDaysOfWeek: Array<number> = []) { }
  public showEmptyLines: boolean = false;
  public alertAfterNumberOfDays: number = 0;
}
