import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from "@angular/core";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { ParentComponent } from "src/app/shared/parent.component";
import { Calendar, CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import { FullCalendarComponent } from "@fullcalendar/angular";
import   dayGridPlugin from '@fullcalendar/daygrid';
import   interactionPlugin  from '@fullcalendar/interaction';
import   listPlugin from '@fullcalendar/list'
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { AgendaDialogComponent } from "../agenda/agenda.dialog";
import { AgendaDetailDialogComponent } from "../agenda/agenda.detail.dialog";
import { SnackbarTexts } from "src/app/shared/error-handling/SnackbarTexts";
import { AppError } from "src/app/shared/error-handling/app-error";
import { DuplicateKeyError } from "src/app/shared/error-handling/duplicate-key-error";
import { NoChangesMadeError } from "src/app/shared/error-handling/no-changes-made-error";
import { NotFoundError } from "src/app/shared/error-handling/not-found-error";
import { addHolidaysToEvents, agendaToEvent, setEventProps } from "../agenda/event-utils";
import { ActionItem, ActionService, ACTIONSTATUS } from "src/app/services/action.service";
import { catchError } from "rxjs/operators";
import { Observable, forkJoin, of } from "rxjs";
import { DateRoutines, IBirthDay, LedenItemExt, LedenService } from "src/app/services/leden.service";


// TODO:Select Multiple dates into vakantie

@Component({
  selector: "app-agenda",
  templateUrl: "./agenda.component.html",
  styleUrls: ["./agenda.component.scss"],
})
export class AgendaComponent
  extends ParentComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  constructor(
    private agendaService: AgendaService,
    private actionService: ActionService,
    private ledenService: LedenService,
    public authService: AuthService,
    public dialog: MatDialog,
    protected snackBar: MatSnackBar
  ) {
    super(snackBar);
  }

  private events: EventInput[] = [];
  // private actionList: Array<ActionItem> = [];

  private calendarApi: Calendar;
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  /***************************************************************************************************
  / Lees agenda in en voeg deze toe aan de options object
  /***************************************************************************************************/
  ngOnInit() {
    if (this.authService.isMobile) {
      this.calendarOptions.initialView = "listMonth";
    }
    this.loadData();
  }

  private subAgenda: Observable<Object>;
  private subAction: Observable<Object>;
  private subMembers: Observable<Object>;

  private loadData() {
    this.subAgenda = this.agendaService.getAll$()
      .pipe(
        catchError(err => of(new Array<AgendaItem>()))
      );
    this.subAction = this.actionService.getAllActions$()
      .pipe(
        catchError(err => of(new Array<ActionItem>()))
      );

    this.subMembers = this.ledenService.getActiveMembers$()
      .pipe(
        catchError(err => of(new Array<ActionItem>()))
      );


    this.registerSubscription(
      forkJoin([this.subAgenda, this.subAction, this.subMembers])
        .subscribe({
          next: (data) => {
            this.fillEventsWithAgenda(data[0] as Array<AgendaItem>);
            this.fillEventsWithActions(data[1] as Array<ActionItem>);
            this.fillEventsWithMembers(data[2] as Array<LedenItemExt>);

            this.calendarOptions.events = this.events.concat(addHolidaysToEvents());
          },
          error: (error: AppError) => {
            console.error("TrainingDeelnameComponent --> loadData --> error", error);
          }
        })
    );
  }

  fillEventsWithActions(actionList: Array<ActionItem>) {
    // let actions: EventInput[] = [];
    actionList.forEach((item) => {
      if (item.Status != ACTIONSTATUS.OPEN && item.Status != ACTIONSTATUS.REPEATING)
        return;

      let action: EventInput = new Object();
      action.title = item.Title;
      action.start = item.StartDate;
      action.end = item.StartDate;
      action.id = action.title + action.start;
      let agendaItem: AgendaItem = new AgendaItem();
      agendaItem.Extra1 = '1';
      agendaItem.Datum = item.StartDate;
      agendaItem.Tijd = '';
      agendaItem.EvenementNaam = item.Title;
      agendaItem.Lokatie = '';
      agendaItem.Type = 'A';
      agendaItem.DoelGroep = 'S';
      agendaItem.Toelichting = item.Description;
      agendaItem.Inschrijven = '';
      agendaItem.Inschrijfgeld = '';
      agendaItem.BetaalMethode = '';
      agendaItem.ContactPersoon = item.HolderName;
      agendaItem.Vervoer = '';
      agendaItem.VerzamelAfspraak = '';
      agendaItem.Extra1 = '2';
      action.extendedProps = { agendaItem: agendaItem };
      this.events.push(action);
    });
  }


  fillEventsWithAgenda(agendaList: Array<AgendaItem>) {
    agendaList.forEach((item) => {
      this.events.push(agendaToEvent(item));
    });

  }

  fillEventsWithMembers(ledenList: Array<LedenItemExt>) {
    ledenList.forEach((item) => {

      let birthdayEvent: EventInput = new Object();
      let birthDay: IBirthDay = DateRoutines.ComingBirthDay(new Date(item.GeboorteDatum));
      birthdayEvent.title = item.VolledigeNaam + ' ('+ birthDay.Age + ')';
      birthdayEvent.start = birthDay.BirthDay;
      birthdayEvent.end = birthDay.BirthDay;
      birthdayEvent.borderColor = 'red';

      let agendaItem: AgendaItem = new AgendaItem();
      agendaItem.EvenementNaam = 'Verjaardag ' + item.VolledigeNaam + ' ('+ birthDay.Age + ')';;
      agendaItem.Datum = birthDay.BirthDay.to_YYYY_MM_DD();
      birthdayEvent.extendedProps = { agendaItem: agendaItem };

      this.events.push(birthdayEvent);

      // check for anniversary
      let anniversary: IBirthDay = DateRoutines.ComingAnniversary(new Date(item.LidVanaf));
      if (!anniversary) return; // er is geen jubileum
      let anniversaryEvent: EventInput = new Object();
      anniversaryEvent.title = item.VolledigeNaam + ' ('+ anniversary.Age + ')';
      anniversaryEvent.start = anniversary.BirthDay;
      anniversaryEvent.end = anniversary.BirthDay;
      anniversaryEvent.borderColor = 'blue';

      agendaItem = new AgendaItem();
      agendaItem.EvenementNaam = 'Jubileum ' + item.VolledigeNaam + ' ('+ anniversary.Age + ')';;
      agendaItem.Datum = anniversary.BirthDay.to_YYYY_MM_DD();
      anniversaryEvent.extendedProps = { agendaItem: agendaItem };

      this.events.push(anniversaryEvent);


    });
  }


  // Voor deze lifecycle hook is the calendar component nog niet geinitialiseerd.
  ngAfterViewChecked() {
    this.calendarApi = this.calendarComponent.getApi();
  }

  /***************************************************************************************************
  / De opties om de calendar te formatteren.
  /***************************************************************************************************/
  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    firstDay: 1,
    height: "100%",
    weekNumbers: true,
    weekText: "",
    locale: "nl",
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,listMonth",
    },
    buttonText: { month: "maand", list: "lijst", today: "vandaag" },
    selectable: true, // Allows a user to highlight multiple days or timeslots by clicking and dragging.
    displayEventTime: false,
    titleFormat: { year: "numeric", month: "short" },
    // initialEvents: this.events, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectMirror: false, // This option only applies to the TimeGrid views.
    dayMaxEvents: true,
    // See www.fullcalendar.io for all posible events
    select: this.onDateClick.bind(this), //Add
    eventClick: this.onEventClick.bind(this), // Change
    eventDrop: this.onEventDrop.bind(this), // dragdrop
  };

  /***************************************************************************************************
  / TOEVOEGEN: Er is op een datum geklikt
  /***************************************************************************************************/
  public onDateClick(selectInfo: DateSelectArg): void {
    let toBeAdded: AgendaItem = new AgendaItem();
    // Defaults
    toBeAdded.Datum = selectInfo.startStr;
    toBeAdded.Type = "T";
    toBeAdded.DoelGroep = "J";

    this.dialog
      .open(AgendaDialogComponent, {
        data: { method: "Toevoegen", data: toBeAdded },
      })
      .afterClosed() // returns an observable
      .subscribe({
        next: (result) => {
          if (result) {
            this.storeResults(null, { 'method': 'Toevoegen', 'data': result });
          }
        }
      });
  }

  /***************************************************************************************************
  / WIJZIGEN: Er is op een event geklikt
  /***************************************************************************************************/
  onEventClick(clickInfo: EventClickArg): void {
    this.dialog.open(AgendaDetailDialogComponent, {
      width: '500px',
      data: {
        data: clickInfo.event.extendedProps["agendaItem"],
      },
    })
      .afterClosed()
      .subscribe({
        next: result => {
          this.storeResults(clickInfo.event, result);
        }
      });
  }

  /***************************************************************************************************
  / DRAG/DROP: Als er een drag/drop heeft plaatsgevonden dan bewaren we het aangepaste record.
  /***************************************************************************************************/
  onEventDrop(args: EventDropArg) {
    // De datum in 'ons' agendaItem record moet worden aangepast voordat we het record opslaan.
    args.event.extendedProps["agendaItem"].Datum = args.event.startStr;
    this.storeResults(args.event, { 'method': 'Wijzigen', 'data': args.event.extendedProps.agendaItem });
  }

  /***************************************************************************************************
  / Hier worden de Toevoegen/Wijziging/Verwijder in de Database doorgevoerd.
  /***************************************************************************************************/
  storeResults(event: EventApi, result: any): void {
    if (!result) return;
    console.log('result', result);
    let sub;
    switch (result.method) {
      case 'Verwijderen':
        this.registerSubscription(
          this.agendaService.delete$(event.id)
            .subscribe({
              next: (data) => {
                this.calendarApi.getEventById(event.id).remove();
                this.showSnackBar(SnackbarTexts.SuccessDelete);
              },
              error: (error: AppError) => {
                console.log('error', error);
                if (error instanceof NotFoundError) {
                  this.showSnackBar(SnackbarTexts.NotFound);
                } else { throw error; } // global error handler
              }
            })

        );
        break;
      case 'Toevoegen':
        this.registerSubscription(
          this.agendaService.create$(result.data)
            .subscribe({
              next: (data: any) => {
                result.Id = data.Key.toString();
                result.data.Id = data.Key.toString();
                this.events.push(agendaToEvent(result.data));
                this.calendarApi.unselect(); // clear date selection
                this.calendarApi.addEvent(agendaToEvent(result.data));
                this.showSnackBar(SnackbarTexts.SuccessNewRecord);
                // bug gevonden. Het ID wordty niet goed bewaard
              },
              error: (error: AppError) => {
                if (error instanceof DuplicateKeyError) {
                  this.showSnackBar(SnackbarTexts.DuplicateKey);
                } else {
                  throw error;
                }
              }
            })

        );
        break;

      case 'Wijzigen':
        this.registerSubscription(
          this.agendaService.update$(result.data)
            .subscribe({
              next: (data) => {
                setEventProps(event, result.data);
                this.showSnackBar(SnackbarTexts.SuccessFulSaved);
              },
              error: (error: AppError) => {
                if (error instanceof NoChangesMadeError) {
                  this.showSnackBar(SnackbarTexts.NoChanges);
                } else if (error instanceof NotFoundError) {
                  this.showSnackBar(SnackbarTexts.NotFound);
                } else {
                  throw error;
                }
              }
            })
        );
        break;
    }
  }
}
