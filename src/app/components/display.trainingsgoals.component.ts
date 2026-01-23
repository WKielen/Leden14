import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../shared/base.component';
import * as moment from 'moment';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import { ReadTextFileService } from 'src/app/services/readtextfile.service';
import { Observable, forkJoin, of } from "rxjs";
import { AppError } from 'src/app/shared/error-handling/app-error';

@Component({
  selector: 'app-display-trainingsgoals',
  styleUrls: [ "./generic.card.list.display.scss" ],
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <mat-card>
    <mat-card-header>
      <mat-card-title>Trainingsdoel</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="internalcard">
        <div class="cardheader">Week {{ getWeekNumber() }}</div>
        <div class="internalcardcontent">
          <div class="internalcardcontent">Jeugd: {{ trainingGoalsJun[getWeekNumber()] }}</div>
          <div class="internalcardcontent">Sen. Recr: {{ trainingGoalsSen[getWeekNumber()] }}</div>
        </div>
      </div>
      <div class="internalcard">
        <div class="cardheader">Week {{ getNextWeekNumber() }}</div>
        <div class="internalcardcontent">
          <div class="internalcardcontent">Jeugd: {{ trainingGoalsJun[getNextWeekNumber()] }}</div>
          <div class="internalcardcontent">Sen. Recr: {{ trainingGoalsSen[getNextWeekNumber()] }}</div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
`
})

export class DisplayTrainingGoalsComponent extends BaseComponent implements OnInit {

  constructor(
    private readTextFileService: ReadTextFileService,
  ) {
    super();
  }
  
  dagen: Dictionary = new Dictionary([]);
  trainingGoalsJun: { [key: string]: string } = {};
  trainingGoalsSen: { [key: string]: string } = {};
  showForm: boolean = false;

  now = moment();
  startOfNextWeek = moment();
  endOfNextWeek = moment().add(1, 'week');

  ngOnInit(): void {
    this.loadData();
  }

  private subJunGoals: Observable<Object>;
  private subSenGoals: Observable<Object>;

  private loadData() {
    this.subJunGoals = this.readTextFileService.read('jun-trainings-goals.txt');
    this.subSenGoals = this.readTextFileService.read('sen-trainings-goals.txt');


    this.registerSubscription(
      forkJoin([this.subJunGoals, this.subSenGoals])
        .subscribe({
          next: (data) => {
            this.trainingGoalsJun = this.parseTrainingGoals(data[0] as string);
            this.trainingGoalsSen = this.parseTrainingGoals(data[1] as string);
          },
          error: (error: AppError) => {
            console.error("TrainingDeelnameComponent --> loadData --> error", error);
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


  private parseTrainingGoals(data: string): { [key: string]: string } {
    let trainingGoals = {};
    const lines = data.split('\n');
    lines.forEach(line => {
      const parts = line.split(';');
      if (parts.length === 2) {
        const week = parts[0].trim();
        const goal = parts[1].trim();
        trainingGoals[week] = goal;
      }
    });
    return trainingGoals; 
  }

}
