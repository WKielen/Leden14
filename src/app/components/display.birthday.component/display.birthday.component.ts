import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../shared/base.component';
import { LedenItemExt, LedenService } from '../../services/leden.service';
import * as moment from 'moment';

@Component({
  selector: 'app-display-birthdays',
  styleUrls: ['./display.birthday.component.scss'],
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
<mat-card>
  <mat-card-header>
    <mat-card-title>Aankomende verjaardagen</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <div *ngIf="groupedBirthdays.length > 0">
      <div class="internalcard" *ngFor="let birthdayGroup of groupedBirthdays">
        <div id="datum">{{ birthdayGroup.date | date:'EEEE dd-MM-yyyy' }}</div>
        <div class="internalcardcontent" *ngFor="let member of birthdayGroup.members">
          <div id="evenementnaam">{{ member.VolledigeNaam }} ({{ member.Leeftijd }})</div>
        </div>
      </div>
    </div>
    <div class="internalcard" *ngIf="groupedBirthdays.length == 0">
      <div id="datum">Geen verjaardagen</div>
    </div>
  </mat-card-content>
</mat-card>
`
})

export class DisplayBirthdayComponent extends BaseComponent implements OnInit {

  constructor(
    private ledenService: LedenService
  ) {
    super();
  }
  
  trainingGoals: { [key: string]: string } = {};
  showForm: boolean = false;
  birthdays: LedenItemExt[] = [];
  groupedBirthdays: { date: string; members: LedenItemExt[] }[] = [];
  now = moment().startOf('day');
  startOfNextWeek = moment().startOf('day');
  endOfNextWeek = moment().add(1, 'week');

  ngOnInit(): void {
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
