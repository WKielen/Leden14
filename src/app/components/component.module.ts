import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomMaterialModule } from 'src/app/material.module';
import { SelectLidDropdownComponent } from './select.lid.dropdown.component';
import { WaitingButtonComponent } from './waiting-button.component';
import { CheckboxListComponent } from './checkbox.list.component';
import { DialogMessageBoxComponent } from './dialog.message.box';
import { MemberSelectionBoxComponent } from './member.selectionbox.component';
import { MemberSelectionBoxWrapperComponent } from './member.selectionbox.wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HtmlEditorComponent } from './html.editor.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HtmlEditorMailWrapperComponent } from './html.editor.mail.wrapper.component';
import { SendMailComponent } from './send.mail.component';
import { DisplayAgendaDetailsComponent } from './display.agenda.details.component';
import { HtmlEditorFormControlComponent } from './html.editor.formcontrol.component';
import { SendMailSettingsComponent } from './send.mail.setting.component';
import { HoldableModule } from '../shared/directives/directives.module';
import { CardHeaderSpinnerComponent } from './card.header.spinner';
import { DialogHeaderComponent } from './dialog.header.detail';
import { AgendaMutationFormComponent } from './agenda.mutation.form/agenda.mutation.form.component';
import { MemberCheckboxTableComponent } from './member.checkbox.table/member.checkbox.table.component';
import { ContributieBedragenFormComponent } from './contributie.bedragen.component/contributie.bedragen.form.component';
import { AanmakenContributieCSVFormComponent } from './aanmaken.contributie.csv.component/aanmaken.contributie.csv.form.component';
import { SendContributieMailComponent } from './send.contributie.mail.component/send.contributie.mail.component';
import { ActionMaintenanceCardComponent } from './action.compoments/action.maintenance.card.component/action.maintenance.card.component';
import { DisplayActionDetailsComponent } from './action.compoments/display.action.details.component';
import { ActionDetailDialogComponent } from './action.compoments/action.detail.dialog.component/action.detail.dialog';
import { ActionMutationFormComponent } from './action.compoments/action.mutation.form/action.mutation.form.component';
import { DecisionMutationFormComponent } from './action.compoments/decision.mutation.form/decision.mutation.form.component';
import { DecisionDetailDialogComponent } from './action.compoments/decision.detail.dialog.component/decision.detail.dialog';
import { DecisionMaintenanceCardComponent } from './action.compoments/decision.maintenance.card.component/decision.maintenance.card.component';
import { DisplayDecisionDetailsComponent } from './action.compoments/display.decision.details.component';
import { ActionMutationDialogComponent } from './action.compoments/action.mutation.dialog/action.mutation';
import { DecisionMutationDialogComponent } from './action.compoments/decision.mutation.dialog/decision.mutation.dialog';
import { NotificationSubscriptionFormComponent } from './notification.subscription.form.component';
import { DisplaySubscriptionsAgendaDetailsComponent } from './display.subscribtions.details.component/display.subscribtions.details.component';
import { DisplaySubscriptionsAgendaDetailsWrapperComponent } from './display.subscribtions.details.component/display.subscribtions.details.wrapper.component';
import { DisplayBirthdayComponent } from './display.birthday.component/display.birthday.component';
import { DisplayTrainingGoalsComponent } from './display.trainingsgoals.component/display.trainingsgoals.component';
import { DisplayProgramNextWeekComponent } from './display.program.next.week.component/display.program.next.week.component';
import { DisplaySubscriptionsComponent } from './display.subscriptions.component/display.subscribtions.component';

const componentList = [
  CardHeaderSpinnerComponent,
  SelectLidDropdownComponent,
  DialogHeaderComponent,
  WaitingButtonComponent,
  CheckboxListComponent,
  DialogMessageBoxComponent,
  MemberSelectionBoxComponent,
  MemberSelectionBoxWrapperComponent,
  HtmlEditorComponent,
  HtmlEditorMailWrapperComponent,
  SendMailComponent,
  DisplaySubscriptionsAgendaDetailsComponent,
  DisplaySubscriptionsComponent,
  DisplaySubscriptionsAgendaDetailsWrapperComponent,
  DisplayAgendaDetailsComponent,
  DisplayBirthdayComponent,
  DisplayTrainingGoalsComponent,
  DisplayProgramNextWeekComponent,
  HtmlEditorFormControlComponent,
  SendMailSettingsComponent,
  AgendaMutationFormComponent,
  MemberCheckboxTableComponent,
  ContributieBedragenFormComponent,
  AanmakenContributieCSVFormComponent,
  SendContributieMailComponent,
  ActionMaintenanceCardComponent,
  DisplayActionDetailsComponent,
  ActionDetailDialogComponent,
  ActionMutationFormComponent,
  ActionMutationDialogComponent,
  DecisionMutationFormComponent,
  DisplayDecisionDetailsComponent,
  DecisionDetailDialogComponent,
  DecisionMaintenanceCardComponent,
  DecisionMutationDialogComponent,
  NotificationSubscriptionFormComponent,
]
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomMaterialModule,
    HoldableModule,
    FlexLayoutModule,
    AngularEditorModule,

  ],
  declarations: [
    ...componentList,
  ],
  exports: [
    ...componentList
  ]
})
export class ComponentsModule { }
