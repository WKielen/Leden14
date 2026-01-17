import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AgendaItem, AgendaService, TypeValues } from 'src/app/services/agenda.service';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import * as moment from 'moment';
import { BaseComponent } from 'src/app/shared/base.component';
import { LedenService, LedenItemExt } from 'src/app/services/leden.service';

@Component({
  selector: 'app-komendeweek',
  templateUrl: './komendeweek.component.html',
  styleUrls: ['./komendeweek.component.scss']
})
export class KomendeWeekComponent extends BaseComponent implements OnInit {

  constructor(
    private agendaService: AgendaService,
    private http: HttpClient,
    private ledenService: LedenService
  ) {
    super();
  }
  dagen: Dictionary = new Dictionary([]);
  trainingGoals: { [key: string]: string } = {};
  showForm: boolean = false;
  birthdays: LedenItemExt[] = [];
  groupedBirthdays: { date: string; members: LedenItemExt[] }[] = [];
  now = moment();
  startOfNextWeek = moment();
  endOfNextWeek = moment().add(1, 'week');

  ngOnInit(): void {

    // First load training goals
    this.registerSubscription(
      this.http.get('/assets/trainings-goals.txt', { responseType: 'text' })
        .subscribe({
          next: (data) => {
            this.parseTrainingGoals(data);
            this.loadAgendaData();
            this.loadBirthdays();
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

  public getWeekNumber(date?: Date): number {
    const currentDate = date || new Date();
    // const date = new Date();
    const d = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));

    // ISO week date weeks start on Monday, so correct the day number
    const dayNum = d.getUTCDay() || 7; // Sunday = 7

    // Set the target date to Thursday of this week (ISO magic)
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    // Calculate week number
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    return weekNo;
  }

  public getNextWeekNumber(): number {
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);

    return this.getWeekNumber(nextWeekDate);
  }

  public getWeekRange(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Monday of current week
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Sunday of current week
    
    return `${monday.toLocaleDateString('nl-NL')} - ${sunday.toLocaleDateString('nl-NL')}`;
  }

  public getNextWeekRange(): string {
    const today = new Date();
    const nextWeekMonday = new Date(today);
    nextWeekMonday.setDate(today.getDate() - today.getDay() + 8); // Monday of next week
    
    const nextWeekSunday = new Date(nextWeekMonday);
    nextWeekSunday.setDate(nextWeekMonday.getDate() + 6); // Sunday of next week
    
    return `${nextWeekMonday.toLocaleDateString('nl-NL')} - ${nextWeekSunday.toLocaleDateString('nl-NL')}`;
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

  private loadBirthdays(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe({
          next: (members: LedenItemExt[]) => {
            const filteredBirthdays = members.filter(member => this.isBirthdayNextWeek(member.GeboorteDatum));
            
            // Group birthdays by date
            const grouped = filteredBirthdays.reduce((acc, member) => {
              const birthDate = moment(member.GeboorteDatum);
              const thisYearBirthday = moment({
                year: this.now.year(),
                month: birthDate.month(),
                day: birthDate.date()
              });
              
              // If this year's birthday has passed, use next year
              if (thisYearBirthday.isBefore(this.now)) {
                thisYearBirthday.add(1, 'year');
              }
              
              const dateKey = thisYearBirthday.format('YYYY-MM-DD');
              
              if (!acc[dateKey]) {
                acc[dateKey] = [];
              }
              acc[dateKey].push(member);
              return acc;
            }, {} as { [key: string]: LedenItemExt[] });
            
            // Convert to array and sort by date, then sort members within each date by name
            this.groupedBirthdays = Object.keys(grouped)
              .sort()
              .map(date => ({
                date,
                members: grouped[date].sort((a, b) => a.VolledigeNaam.localeCompare(b.VolledigeNaam))
              }));
          },
          error: (e) => {
            console.error('Error loading members:', e);
          }
        })
    );
  }

  private isBirthdayNextWeek(birthDate: string): boolean {
    if (!birthDate) return false;

    const birth = moment(birthDate);

    // Create this year's birthday
    const thisYearBirthday = moment({
      year: this.now.year(),
      month: birth.month(),
      day: birth.date()
    });

    // If this year's birthday has passed, check next year's
    if (thisYearBirthday.isBefore(this.now)) {
      thisYearBirthday.add(1, 'year');
    }

    return thisYearBirthday.isBetween(this.startOfNextWeek, this.endOfNextWeek, null, '[]');
  }
}

