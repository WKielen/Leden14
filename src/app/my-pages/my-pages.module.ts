import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LedenComponent } from './../my-pages/leden/leden.component';
import { LedenManagerComponent } from './../my-pages/ledenmanager/ledenmanager.component';
import { AgendaComponent } from './../my-pages/agenda/agenda.component';
import { WebsiteComponent } from './../my-pages/website/website.component';
import { LadderComponent } from './../my-pages/ladder/ladder.component';
import { MultiUpdateComponent } from './../my-pages/multi-update/multi-update.component';
import { ContrBedragenComponent } from './../my-pages/contr-bedragen/contr-bedragen.component';
import { OudLedenComponent } from './../my-pages/oud-leden/oud-leden.component';
import { SyncNttbComponent } from './../my-pages/syncnttb/syncnttb.component';
import { TrainingDeelnameComponent } from './../my-pages/trainingdeelname/trainingdeelname.component';
import { TrainingOverzichtComponent } from './../my-pages/trainingoverzicht/trainingoverzicht.component';

import { AgendaDialogComponent } from './../my-pages/agenda/agenda.dialog';
import { AgendaDetailDialogComponent } from './../my-pages/agenda/agenda.detail.dialog';
import { LedenDialogComponent } from './../my-pages/ledenmanager/ledenmanager.dialog';
import { LedenDeleteDialogComponent } from './../my-pages/ledenmanager/ledendelete.dialog';
import { MailDialogComponent } from './../my-pages/mail/mail.dialog';
import { SingleMailDialogComponent } from './../my-pages/mail/singlemail.dialog';
import { TrainingOverzichtDialogComponent } from './../my-pages/trainingoverzicht/trainingoverzicht.dialog';
import { WebsiteDialogComponent } from './../my-pages/website/website.dialog';

import { CustomMaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HighGraphsModule } from '../shared/widgets/graphs.module';

import { FullCalendarModule } from '@fullcalendar/angular';
import { MasterzComponent } from './masterz/masterz.component';
import { KomendeWeekComponent } from './komendeweek/komendeweek.component'; // the main connector. must go first
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AngularIbanModule } from 'angular-iban';
import { HoldableModule } from '../shared/directives/directives.module';
import { TodolistComponent } from './todolist/todolist.component';
import { TrainingGroupsComponent } from './trainingsgroep/trainingsgroep.component';
import { SendInventationDialogComponent } from './evenementen/send-inventation-dialog/send-inventation.dialog';
import { EventSubscriptionsDialogComponent } from './evenementen/event-subscriptions-dialog/event-subscribtions.dialog';
import { ComponentsModule } from '../components/component.module';
import { KennisMakenComponent } from './kennismaken/kennismaken.component';
import { MailKennismakerDialogComponent } from './kennismaken/mail-kennismaker-dialog/mail-kennismaker.dialog';

@NgModule({
  declarations: [
    DashboardComponent,
    LedenComponent,
    LedenManagerComponent,
    AgendaComponent,
    AgendaDialogComponent,
    AgendaDetailDialogComponent,
    WebsiteComponent,
    LadderComponent,
    MultiUpdateComponent,
    ContrBedragenComponent,
    OudLedenComponent,
    SyncNttbComponent,
    TrainingDeelnameComponent,
    TrainingOverzichtComponent,

    LedenDialogComponent,
    LedenDeleteDialogComponent,
    MailDialogComponent,
    SingleMailDialogComponent,
    TrainingOverzichtDialogComponent,
    WebsiteDialogComponent,
    SendInventationDialogComponent,
    EventSubscriptionsDialogComponent,

    MasterzComponent,
    KomendeWeekComponent,
    TodolistComponent,
    TrainingGroupsComponent,
    KennisMakenComponent,
    MailKennismakerDialogComponent,
  ],
  imports: [
    CommonModule,
    CustomMaterialModule,
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    HighGraphsModule,
    FullCalendarModule,
    AngularEditorModule,
    HoldableModule,
    AngularIbanModule,
    ComponentsModule,
  ],
})
export class MyPagesModule { }
