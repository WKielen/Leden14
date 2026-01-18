import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../shared/base.component';
import * as moment from 'moment';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import { AgendaItem, AgendaService, TypeValues } from 'src/app/services/agenda.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-display-program-next-week',
  styleUrls: ['./display.program.next.week.component.scss'],
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <mat-card>
    <mat-card-header>
      <mat-card-title>Programma komende week</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div *ngIf="dagen.length() > 0">
        <div class="internalcard" *ngFor="let dag of dagen.keys(); index as i" id='id{{i}}'>
          <div id="datum">{{ dagen.keys()[i] | date:'EEEE dd-MM-yyyy' }}</div>
          <div class="internalcardcontent" *ngFor="let item of dagen.getIndex(i); index as j" id='id{{j}}'>
            <div id="evenementnaam">{{ dagen.getIndex(i)[j].EvenementNaam }} ({{ dagen.getIndex(i)[j].Type }})</div>
            <div id="aanvang" *ngIf="dagen.getIndex(i)[j].Tijd">Aanvang: {{dagen.getIndex(i)[j].Tijd }}</div>
            <div id="toelichting" [innerHTML]="dagen.getIndex(i)[j].Toelichting"></div>
          </div>
        </div>
      </div>
      <div *ngIf="dagen.length() == 0">
        <h1>Geen activiteiten</h1>
      </div>
    </mat-card-content>
</mat-card>
`
})

export class DisplayProgramNextWeekComponent extends BaseComponent implements OnInit {

  constructor(
        private agendaService: AgendaService,
  ) {
    super();
  }

  dagen: Dictionary = new Dictionary([]);
  

  ngOnInit(): void {
    this.registerSubscription(
      this.agendaService.nextWeek$()
        .pipe(
          map(function (value: AgendaItem[]) {
            let localdata: Array<AgendaItem> = [];
            if (value) {
              value.forEach(element => {
                element.Toelichting = element.Toelichting.replace(new RegExp('\n', 'g'), "<br>")
                if (!moment(element.Tijd, "HH:mm", true).isValid())
                  element.Tijd = '';
                localdata.push(element)
              });
            }
            return localdata;
          })
        )
        .subscribe({
          next: (agendaLijst: Array<AgendaItem>) => {
            agendaLijst.forEach(agendaItem => {
              this.addtoDagListIfThisWeek(agendaItem);
            });
          },
          error: (e) => { console.error(e) }
        })

    );
  }

  addtoDagListIfThisWeek(agendaItem: AgendaItem): void {
     let agendaDate: Date = moment(agendaItem.Datum).toDate();
     const overEenWeek = moment().add(7, 'days').toDate();
     if (agendaDate < moment().startOf("day").toDate() || overEenWeek <= agendaDate) return;
     let dagnaam: string = agendaDate.to_YYYY_MM_DD();
 
     agendaItem.Type = TypeValues.GetLabel(agendaItem.Type);
 
     if (!this.dagen.containsKey(dagnaam)) {
       this.dagen.addSorted(dagnaam, [])
     }
     let dag: Array<AgendaItem> = this.dagen.get(dagnaam);
     dag.push(agendaItem);
   }
}
