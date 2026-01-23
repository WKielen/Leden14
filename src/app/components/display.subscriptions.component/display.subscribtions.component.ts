import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { catchError, forkJoin, of } from "rxjs";
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { InschrijvingItem, InschrijvingService } from "src/app/services/inschrijving.service";
import { DateRoutines, LedenItemExt, LedenService, LidTypeValues } from "src/app/services/leden.service";
import { AppError } from "src/app/shared/error-handling/app-error";
import { ParentComponent } from "src/app/shared/parent.component";
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: "app-display-subscriptions",
  templateUrl: "./display.subscribtions.component.html",
  styleUrls: [  "./display.subscribtions.component.scss",
                "./../generic.card.list.display.scss"  ],
})

export class DisplaySubscriptionsComponent extends ParentComponent
  implements OnInit {

  constructor(
    protected snackBar: MatSnackBar,
    protected ledenService: LedenService,
    protected agendaService: AgendaService,
    protected inschrijvingService: InschrijvingService,
    protected clipboard: Clipboard
  ) {
    super(snackBar);
  }

  public ledenLijst: Array<LedenItemExt> = [];
  public agendaItems: Array<AgendaItem> = [];
  public inschrijvingItems: Array<InschrijvingItem> = [];
  public agendaWithInschrijvingen: { agenda: AgendaItem, inschrijvingen: InschrijvingItem[] }[] = [];
  public columnsToDisplay: string[] = ['InschrijvingNaam'];
  public panelOpenState = false;


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

            this.inschrijvingItems = this.inschrijvingItems.map(item => {
              let bestMatch: LedenItemExt | null = null;
              let minDistance = Infinity;
              const itemName = item.Naam?.toLowerCase().trim() || '';

              this.ledenLijst.forEach(lid => {
                lid['GeboorteDatum2'] = this.formatDate(lid.GeboorteDatum);
                const lidName = lid.VolledigeNaam?.toLowerCase().trim() || '';
                const distance = this.levenshteinDistance(itemName, lidName);
                if (distance < minDistance) {
                  minDistance = distance;
                  bestMatch = lid;
                }
              });

              if (bestMatch) {
                (item as any).Lid = bestMatch;
              }

              return item;
            });

            this.agendaWithInschrijvingen = this.agendaItems.map(agenda => {
              const inschrijvingen = this.inschrijvingItems.filter(item => item.Agenda_Id.toString() === agenda.Id);
              return { agenda, inschrijvingen };
            }).filter(item => item.inschrijvingen.length > 0); // Only show agendas with inschrijvingen
          },
          error: (error: AppError) => {
            console.error("🚀 --> TestComponent --> ngOnInit --> error:", error);
          }
        })
    );
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

  InnerHtmlLabelLeeftijdsCategorie(value: string): string {
    return DateRoutines.InnerHtmlLabelLeeftijdsCategorie(value);
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // If invalid, return as is
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}


