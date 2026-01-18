import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../shared/base.component';
import { LedenItemExt, LedenService } from '../../services/leden.service';
import * as moment from 'moment';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-display-trainingsgoals',
  styleUrls: ['./display.trainingsgoals.component.scss'],
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <mat-card>
    <mat-card-header>
      <mat-card-title>Trainingsdoel jeugd</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="internalcard">
        <div id="datum">{{ getWeekRange() }}  (Week {{ getWeekNumber() }})</div>
        <div class="internalcardcontent">
          <div id="evenementnaam">{{ trainingGoals[getWeekNumber()] }}</div>
        </div>
      </div>
      <div class="internalcard">
        <div id="datum">{{ getNextWeekRange() }}   (Week {{ getNextWeekNumber() }})</div>
        <div class="internalcardcontent">
          <div id="evenementnaam">{{ trainingGoals[getNextWeekNumber()] }}</div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
`
})

export class DisplayTrainingGoalsComponent extends BaseComponent implements OnInit {

  constructor(
    private http: HttpClient,
  ) {
    super();
  }
  
  dagen: Dictionary = new Dictionary([]);
  trainingGoals: { [key: string]: string } = {};
  showForm: boolean = false;

  now = moment();
  startOfNextWeek = moment();
  endOfNextWeek = moment().add(1, 'week');

  ngOnInit(): void {
    this.registerSubscription(
      this.http.get('/assets/trainings-goals.txt', { responseType: 'text' })
        .subscribe({
          next: (data) => {
            this.parseTrainingGoals(data);
          },
          error: (e) => {
            console.error('Error loading training goals:', e);
          }
        })
    );
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

}
