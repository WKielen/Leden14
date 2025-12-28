import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { catchError, forkJoin, NotFoundError, of } from "rxjs";
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { AuthService } from "src/app/services/auth.service";
import { InschrijvingItem, InschrijvingService } from "src/app/services/inschrijving.service";
import { DateRoutines, LedenItemExt, LedenService, LidTypeValues } from "src/app/services/leden.service";
import { NotificationService } from "src/app/services/notification.service";
import { ParamService } from "src/app/services/param.service";
import { AppError } from "src/app/shared/error-handling/app-error";
import { ParentComponent } from "src/app/shared/parent.component";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TestComponent
  extends ParentComponent implements OnInit {

  constructor(
    protected snackBar: MatSnackBar,
    protected paramService: ParamService,
    protected ledenService: LedenService,
    protected authService: AuthService,
    protected agendaService: AgendaService,
    protected inschrijvingService: InschrijvingService,
    protected notificationService: NotificationService,
    protected clipboard: Clipboard
  ) {
    super(snackBar);
  }

  public ledenLijst: Array<LedenItemExt> = [];
  public agendaItems: Array<AgendaItem> = [];
  public inschrijvingItems: Array<InschrijvingItem> = [];
  public agendaWithInschrijvingen: {agenda: AgendaItem, inschrijvingen: InschrijvingItem[]}[] = [];
  public expandedElement: InschrijvingItem | null = null;
  public columnsToDisplay: string[] = ['InschrijvingNaam'];

  ngOnInit() {

    let subInschrijvingen = this.inschrijvingService.getAll$()
      .pipe(
        catchError(err => of(new Array<InschrijvingItem>()))
      );

    let subLeden = this.ledenService.getActiveMembers$()
      .pipe(
        catchError(err => of(new Array<LedenItemExt>()))
      );

    let subAgenda = this.agendaService.getAllFromNow$()
      .pipe(
        catchError(err => of(new Array<AgendaItem>()))
      );


    this.registerSubscription(
      forkJoin([subInschrijvingen, subLeden, subAgenda])
          .subscribe({
          next: (data) => {
            this.inschrijvingItems = data[0] as InschrijvingItem[];
            this.ledenLijst = data[1] as LedenItemExt[];
            this.agendaItems = data[2] as AgendaItem[];
            
            // Map inschrijvingItems to add/update the member name from ledenLijst using name similarity
            this.inschrijvingItems = this.inschrijvingItems.map(item => {
              let bestMatch: LedenItemExt | null = null;
              let minDistance = Infinity;
              const itemName = item.Naam?.toLowerCase().trim() || '';
              
              this.ledenLijst.forEach(lid => {
                const lidName = lid.VolledigeNaam?.toLowerCase().trim() || '';
                const distance = this.levenshteinDistance(itemName, lidName);
                if (distance < minDistance) {
                  minDistance = distance;
                  bestMatch = lid;
                }
              });
              
              // Always add the best match (closest name) to the item
              if (bestMatch) {
                (item as any).Lid = bestMatch;
              }
              
              return item;
            });
            console.log("🚀 --> TestComponent --> ngOnInit --> inschrijvingItems:", this.inschrijvingItems);
            console.log("🚀 --> TestComponent --> ngOnInit --> this.agendaItems:", this.agendaItems);
            
            // Group inschrijvingen by agenda
            this.agendaWithInschrijvingen = this.agendaItems.map(agenda => {
              console.log("🚀 --> TestComponent --> ngOnInit --> agenda:", agenda);


              const inschrijvingen = this.inschrijvingItems.filter(item => item.Agenda_Id.toString() === agenda.Id);

              console.log("🚀 --> TestComponent --> ngOnInit --> inschrijvingen:", inschrijvingen);
              return { agenda, inschrijvingen };
            }).filter(item => item.inschrijvingen.length > 0); // Only show agendas with inschrijvingen
            
            console.log("🚀 --> TestComponent --> ngOnInit --> agendaWithInschrijvingen:", this.agendaWithInschrijvingen);




          },
          error: (error: AppError) => {
            console.error("🚀 --> TestComponent --> ngOnInit --> error:", error);
          }
        })
    );








        // let date = new Date();
        // console.log('in UTC format(date.toUTCString)', date.toUTCString() );
        // console.log('in UTC format(date.toLocaleString)', date.toLocaleString() );
        // console.log('in UTC format(date.toDateString)', date.toDateString() );
        // console.log('in UTC format(date.toISOString', date.toISOString());
        // console.log(moment.utc('2012-12-14T00:29:40.276Z'));
        // console.log(moment.utc('2012-12-14T00:29:40.276Z').format());
        // console.log(moment.utc('2012-12-14T00:29:40.276Z').toDate());
        // var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        // var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        // console.log('in UTC format(date.toLocaleString)', (new Date).toLocaleString() );


        // let now = new Date();
        // console.log('tostring', now.toString());
        // console.log('toISOstring', now.toISOString());
        // console.log('JSON', now.toJSON());
        // console.log('UTC', now.toUTCString());
        // console.log('locale string', now.toLocaleString() );
        // let nowmoment = moment();
        // console.log('moment format',nowmoment.format("YYYY-MM-DDTHH:mm:ss.SSSZZ"));


        // console.log("betere oplossing????", moment.utc(now).format("YYYY-MM-DDTHH:mm:ss") + moment().format("SSSZZ"));

        // betere oplossing




      }

  onClick() {
    // let x = {
    //   "Agenda_Id": "67",
    //   "Naam": "Piet",
    //   "Email": "wim_kielen@hotmail.com"
    // };


    // this.registerSubscription(
    //   this.notificationService.notification$(x)
    //     .subscribe({
    //       next: (data) => {
    //         this.showSnackBar(SnackbarTexts.SuccessDelete);
    //       },
    //       error: (error: AppError) => {
    //         console.error(error);
    //         if (error instanceof NoChangesMadeError) {
    //           this.showSnackBar(SnackbarTexts.NoChanges);
    //         } else if (error instanceof NotFoundError) {
    //           this.showSnackBar(SnackbarTexts.NotFound);
    //         } else if (error instanceof DuplicateKeyError) {
    //           this.showSnackBar(SnackbarTexts.DuplicateKey);
    //         } else {
    //           throw error;
    //         }
    //       }
    //     })
    // );

  }



  public onAskPermission(): void {
    // function askNotificationPermission() {
    //   // function to actually ask the permissions
    //   function handlePermission(permission: any) {
    //     // set the button to shown or hidden, depending on what the user answers
    //     // if(Notification.permission === 'denied' || Notification.permission === 'default') {
    //     //   notificationBtn.style.display = 'block';
    //     // } else {
    //     //   notificationBtn.style.display = 'none';
    //     // }
    //   }

    //   // Let's check if the browser supports notifications
    //   if (!('Notification' in window)) {
    //     console.log("This browser does not support notifications.");
    //   } else {
    //     if (this.checkNotificationPromise()) {
    //       Notification.requestPermission()
    //         .then((permission) => {
    //           handlePermission(permission);
    //         })
    //     } else {
    //       Notification.requestPermission(function (permission) {
    //         handlePermission(permission);
    //       });
    //     }
    //   }
    // }

  }

  public checkNotificationPromise(): boolean {
  //   try {
  //     Notification.requestPermission().then();
  //   } catch (e) {
  //     return false;
  //   }

    return true;
  }

  private levenshteinDistance(a: string, b: string): number {
    // If one string contains the other, consider it a perfect match
    if (a.includes(b) || b.includes(a)) {
      return 0;
    }
    
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  onClickCopy(field: string) {
    console.log('copied: ', field);
    this.clipboard.copy(field);
    this.showSnackBar('Copied: ' + field);
  }


    getLidType(value: string): string {
      return LidTypeValues.GetLabel(value);
    }
  
    // getLidCategory(value: string): number {
    //   return this.categories.get(value);
    // }
  
    InnerHtmlLabelLeeftijdsCategorie(value: string): string {
      return DateRoutines.InnerHtmlLabelLeeftijdsCategorie(value);
    }
}
