import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AgendaItem, AgendaService, TypeValues } from 'src/app/services/agenda.service';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import * as moment from 'moment';
import { ActionItem, ActionService, ACTIONSTATUS } from 'src/app/services/action.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-komendeweek',
  templateUrl: './komendeweek.component.html',
  styleUrls: ['./komendeweek.component.scss']
})
export class KomendeWeekComponent extends BaseComponent implements OnInit {

  constructor(
    private agendaService: AgendaService,
    private actionService: ActionService,
    private http: HttpClient
  ) {
    super();
  }
  dagen: Dictionary = new Dictionary([]);
  trainingGoals: { [key: string]: string } = {};
  showForm: boolean = false;

  ngOnInit(): void {
    // First load training goals
    this.registerSubscription(
      this.http.get('/assets/trainings-goals.txt', { responseType: 'text' })
        .subscribe({
          next: (data) => {
            this.parseTrainingGoals(data);
            this.loadAgendaData();
          },
          error: (e) => {
            console.error('Error loading training goals:', e);
            this.loadAgendaData(); // Load agenda even if goals fail
          }
        })
    );
  }

  private loadAgendaData(): void {
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

    this.registerSubscription(
      this.actionService
        .nextWeek$()
        .pipe(
          map(function (value: ActionItem[]) {
            let localdata: Array<AgendaItem> = value ? value : [];
            return localdata;
          })
        )
        .subscribe({
          next: (actionLijst: Array<ActionItem>) => {
            actionLijst.forEach(element => {
              if (element.Status != ACTIONSTATUS.OPEN && element.Status != ACTIONSTATUS.REPEATING)
                return;
              let ai: AgendaItem = new AgendaItem();
              ai.Datum = element.StartDate
              ai.EvenementNaam = element.Title;
              ai.Toelichting = element.Description;
              ai.ContactPersoon = element.HolderName;
              ai.Type = "S";
              this.addtoDagListIfThisWeek(ai);

              ai = new AgendaItem();
              ai.Datum = element.TargetDate
              ai.EvenementNaam = element.Title;
              ai.Toelichting = element.Description;
              ai.ContactPersoon = element.HolderName;
              ai.Type = "E";
              this.addtoDagListIfThisWeek(ai);

            });
            this.showForm = true; // Ensure form is shown after actions too
          }
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

  getWeekNumber(dateString: string): string {
    const date = moment(dateString);
    return date.isoWeek().toString();
  }

  private parseTrainingGoals(data: string): void {
    this.trainingGoals = {};
    const lines = data.split('\n');
    lines.forEach(line => {
      const parts = line.split(';');
      if (parts.length === 2) {
        const week = parts[0].trim();
        const goal = parts[1].trim();
        this.trainingGoals[week] = goal;
      }
    });
  }
}

