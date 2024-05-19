import { Component, OnInit, ViewChild } from '@angular/core';
import { LedenService, LedenItemExt } from '../../services/leden.service';
import { TrainingService, TrainingDag, TrainingItem } from '../../services/training.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDatepicker } from '@angular/material/datepicker';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS as MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/legacy-checkbox';

import { AppError } from 'src/app/shared/error-handling/app-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { TrainingstijdItem, TrainingstijdService } from 'src/app/services/trainingstijd.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
@Component({
  selector: 'app-trainingdeelname',
  templateUrl: './trainingdeelname.component.html',
  styleUrls: ['./trainingdeelname.component.scss'],
  providers: [
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } }   // veranderd het click gedrag van (alle) checkboxen. Zie material docs
  ],
})
export class TrainingDeelnameComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, { static: false }) table!: MatTable<any>;
  @ViewChild('picker', { static: false }) picker!: MatDatepicker<any>;

  constructor(
    protected ledenService: LedenService,
    protected trainingService: TrainingService,
    protected snackBar: MatSnackBar,
    protected trainingstijdService: TrainingstijdService,
    protected adapter: DateAdapter<any>
  ) {
    super(snackBar)
    this.adapter.setLocale('nl');
  }


  ngOnInit(): void {
    this.loadData(new Date);
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }



  // subscriptions
  private subTrainingsTijden = new Observable<Object>();
  private subLeden = new Observable<Object>();
  private subTrainingDays = new  Observable<Object>();



  public displayedColumns: string[] = ['actions1', 'Naam'];
  public dataSource = new Array<any>();
  public afmeldingen = new Array<NaamRedenRecord>();
  public fabButtons = new Array<IconRecord>();  // dit zijn de buttons op het scherm
  public fabIcons = [new IconRecord('save'), new IconRecord('event')];
  // When I change the date, the ledenlist will not be refreshed. It is read just once at page load.
  public ledenList: Array<LedenItemExt> = [];
  public trainingDag = new TrainingDag();  // contains the Date and a array of players who where present
  public trainingsTijden: Array<TrainingstijdItem> = [];
  public groepenVanGekozenDatum: Array<TrainingsGroupForUI> = [];


  /***************************************************************************************************
  / Load data door middel van forkJoin
  /***************************************************************************************************/
  private loadData(date: Date): void {
    // date = new Date('2021-01-28')
    this.subTrainingsTijden = this.trainingstijdService.getAll$().pipe(catchError(err => of(err.status)));
    this.subLeden = this.ledenService.getYouthMembers$().pipe(catchError(err => of(err.status)));
    this.subTrainingDays = this.trainingService.getDate$(date)
      .pipe(catchError(err => {
        return of(new TrainingDag(date))
      }));
    // Als er nog geen trainingsdag is in de trainingtabel dan krijgen we een 404 terug. Die wordt opgevangen door
    // de catchError. (err.status zal de waarde 404 hebben) In de catch geef ik een 'of(object)' terug. De 'of'
    // creeert een Observable die het object doorgeeft.
    // Hierdoor krijgt de subscribe van het observable geen fout maar het object binnen. Dit kan dan goed verwerkt worden.

    // De forkJoin wacht totdat alle observable klaar zijn voordat de gemeenschappelijke subscribe terug komt. Er is dan ook een
    // gemeenschappelijke foutafhandeling. Als dat niet wenselijk is dan moet je het met een pipe oplossing op de individuele
    // Observable zoal hierboven gebeurd.
    this.registerSubscription(
      forkJoin([this.subTrainingsTijden, this.subLeden, this.subTrainingDays])
        .subscribe({
          next: (data) => {
            this.trainingsTijden = data[0] as Array<TrainingstijdItem>;
            this.ledenList = data[1] as Array<LedenItemExt>;
            this.trainingDag = data[2] as TrainingDag;

            this.combineResults();
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Alle observables zijn klaar, dus resultaten combineren.
  /***************************************************************************************************/
  private combineResults(): void {

    // console.log('%c--------------------------------------------------', 'color: #ec6969; font-weight: bold;');
    this.afmeldingen = [];

    // Ik heb alle trainingsgroepen ingelezen. Nu ga ik de groepen van de huidige dag selecteren.
    this.groepenVanGekozenDatum = this.selectTrainingGroups();

    // Voeg de leden aan hun trainingsgroep toe.
    let dictWithMembersPerGroup = this.fillDictWithMembersPerGroup();

    // We moeten nu de groepen cross-referencen met de ingevulde statussen.
    for (let index = 0; index < dictWithMembersPerGroup.values.length; index++) {
      const groepmetleden = dictWithMembersPerGroup.values[index];
      let trainingsGroupForUI: TrainingsGroupForUI = this.groepenVanGekozenDatum[index];

      groepmetleden.forEach((lidvaneengroep: LedenItemTableRow) => {
        trainingsGroupForUI.Members++;

        if (!this.trainingDag.Value) return;
        const deelnameList: Array<TrainingItem> = JSON.parse(this.trainingDag.Value);

        deelnameList.forEach((trainingsItem: TrainingItem) => {
          if (lidvaneengroep.LidNr == trainingsItem.LidNr) {
            lidvaneengroep.SetState(trainingsItem.State);
            lidvaneengroep.Reason = trainingsItem.Reason;

            if (trainingsItem.Reason) {
              this.afmeldingen.push( new NaamRedenRecord(lidvaneengroep.Naam, trainingsItem.Reason));
            }

            switch (trainingsItem.State) { // huidige status
              case TrainingItem.AFGEMELD:
                trainingsGroupForUI.SignOff += 1;
                break;
              case TrainingItem.AANWEZIG:
                trainingsGroupForUI.Present += 1;
                break;
            }
          }
        });
      });

      trainingsGroupForUI.Absent = trainingsGroupForUI.Members - trainingsGroupForUI.Present - trainingsGroupForUI.SignOff;

    };
    this.dataSource = dictWithMembersPerGroup.values;
  }


  fillDictWithMembersPerGroup(): Dictionary {
    let dictWithMembersPerGroup = new Dictionary([]);
    // Dus groups bevat nu de groepen van de gekozen dag
    // Nu maak ik een dict met groepen van de gekozen dag. Ik deze dict bouw ik een lijst op met
    // leden die trainen op deze dag.
    this.groepenVanGekozenDatum.forEach(item => { dictWithMembersPerGroup.add(item.Code, []) });


    this.ledenList.forEach(lid => {
      // in ExtraA property sla ik de lijst op met trainingsgroepen
      if (!lid.TrainingsGroepen) return; // niet ingedeelde leden

      // Ik maak een regel voor het lid voor in de tabel
      let memberTableRow = new LedenItemTableRow(lid.LidNr, lid.Naam);

      // Nu moeten we nog bepalen in welke groep we hem gaan toevoegen.
      for (let index = 0; index < this.groepenVanGekozenDatum.length; index++) {
        if (lid.TrainingsGroepen.indexOf(this.groepenVanGekozenDatum[index].Code) > -1) {
          memberTableRow.Group = index;
          dictWithMembersPerGroup.get(this.groepenVanGekozenDatum[index].Code).push(memberTableRow);
        }
      }
    });

    return dictWithMembersPerGroup;
  }

  selectTrainingGroups(): TrainingsGroupForUI[] {
    // In de trainingsgroepen controleer ik of de eerste 2 letters van de Code (do1) uit trainingstijden
    // als dat zo is worden die groepen geselecteerd in groups.
    const eerste2LettersVanDeDag = moment(this.trainingDag.Datum).locale('NL-nl').format('dd').toLowerCase();
    let groups: Array<TrainingsGroupForUI> = [];
    this.trainingsTijden.forEach(tijdstip => {
      if (eerste2LettersVanDeDag != tijdstip.Code.substring(0, 2).toLowerCase()) {
        return;
      }
      groups.push(new TrainingsGroupForUI(tijdstip.Day, tijdstip.Code));
    });
    return groups;
  }

  /***************************************************************************************************
  / Is triggered when datapicker changed the date.
  /***************************************************************************************************/
  onChangeDate(event: MatDatepickerInputEvent<Moment>) {
    this.loadData(event.value!.toDate());
  }

  /***************************************************************************************************
  / A Floating Action Button has been pressed.
  /***************************************************************************************************/
  onFabClick($event: Event, buttonNbr: number): void {
    switch (buttonNbr) {
      case 0:
        this.savePresence();
        break;
      case 1:
        this.picker.open();
        break;
    }
  }

  /***************************************************************************************************
  / Save the presence for this day
  /***************************************************************************************************/
  private savePresence(): void {
    // this.trainingDag.DeelnameList = [];
    let deelnameList: Array<TrainingItem> = [];
    for (let index = 0; index < this.dataSource.length; index++) {
      this.dataSource[index].forEach((element: LedenItemTableRow) => {
        if (element.Dirty) {
          let trainingItem = new TrainingItem();
          trainingItem.LidNr = element.LidNr;
          trainingItem.State = element.State;
          trainingItem.Reason = element.Reason;
          deelnameList.push(trainingItem);
        }
      });
    }
    this.trainingDag.Value = JSON.stringify(deelnameList);
    let sub = this.trainingService.update$(this.trainingDag)
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
        },
        error: (error: AppError) => {
          if (error instanceof NotFoundError) {
            // Als het record niet is gevonden dan voeg ik het toe.
            let sub2 = this.trainingService.create$(this.trainingDag)
              .subscribe({
                next: (data) => {
                  let tmp: any = data;
                  this.trainingDag.Id = tmp.Key;
                  this.showSnackBar(SnackbarTexts.SuccessNewRecord);
                },
              });
            this.registerSubscription(sub2);
          }
          // Er zijn geen wijzigingen aangebracht.
          else if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          }
          else {
            this.showSnackBar(SnackbarTexts.UpdateError, '');
          }
        }
      })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / The onRowClick from a row that has been hit
  /***************************************************************************************************/
  onRowClick(row: LedenItemTableRow): void {
    let groep = row.Group;
    switch (row.State) {
      case TrainingItem.AFGEMELD:
        this.groepenVanGekozenDatum[groep].SignOff -= 1;
        break;
      case TrainingItem.AANWEZIG:
        this.groepenVanGekozenDatum[groep].Present -= 1;
        break;
      case TrainingItem.AFWEZIG:
        this.groepenVanGekozenDatum[groep].Absent -= 1;
        break;
    }
    row.SetNextState();
    switch (row.State) {
      case TrainingItem.AFGEMELD:
        this.groepenVanGekozenDatum[groep].SignOff += 1;
        break;
      case TrainingItem.AANWEZIG:
        this.groepenVanGekozenDatum[groep].Present += 1;
        break;
      case TrainingItem.AFWEZIG:
        this.groepenVanGekozenDatum[groep].Absent += 1;
        break;
    }
  }
}

class TrainingsGroupForUI {

  constructor(name: string, code: string) {
    this.Name = name;
    this.Code = code;
  }

  Name: string;
  Code: string;
  Members: number = 0;
  Present: number = 0;
  SignOff: number = 0;
  Absent: number = 0;
}


/***************************************************************************************************
/ Extra velden voor iedere lidregel om de checkbox te besturen.
/***************************************************************************************************/
class LedenItemTableRow {
  constructor(LidNr: number, Naam: string) {
    this.Naam = Naam;
    this.LidNr = LidNr;
    this.Dirty = false;
    this.Checked = null;
    this.Indeterminate = false;
    this.State = TrainingItem.AFWEZIG;
  }

  public SetNextState(): void {
    switch (this.State) { // huidige status
      case TrainingItem.AFGEMELD:
        this.SetState(TrainingItem.AFWEZIG);   // volgende status
        break;
      case TrainingItem.AANWEZIG:
        this.SetState(TrainingItem.AFGEMELD);   // volgende status
        break;
      case TrainingItem.AFWEZIG:
        this.SetState(TrainingItem.AANWEZIG);   // volgende status
        break;
    }
  }

  public SetState(State: number): void {
    switch (State) {
      case TrainingItem.AANWEZIG:
        this.Checked = true;
        this.Indeterminate = false;
        this.State = TrainingItem.AANWEZIG;
        break;
      case TrainingItem.AFGEMELD:
        this.Checked = false;
        this.Indeterminate = true;
        this.State = TrainingItem.AFGEMELD;
        break;
      case TrainingItem.AFWEZIG:
        this.Checked = false;
        this.Indeterminate = false;
        this.State = TrainingItem.AFWEZIG;
        break;
    }
    this.Dirty = true;
  }

  Naam: string;
  LidNr: number;
  Group: number = 0;
  Dirty: boolean;
  Checked: any;
  Indeterminate: boolean;;
  State: number;
  Reason: string = '';
}

class IconRecord {
  constructor( icon: string) {
    this.Icon = icon;
  }
  Icon: string = '';
}

class NaamRedenRecord {
  constructor( naam: string, reason: string) {
    this.Naam = naam;
    this.Reden = reason;
  }
  Naam: string = '';
  Reden: string = '';
}