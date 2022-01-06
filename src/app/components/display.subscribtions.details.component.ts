import { Component, Input } from '@angular/core';
import { InschrijvingItem } from 'src/app/services/inschrijving.service';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-display-subscriptions-details',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <table mat-table [dataSource]="inschrijvingsList">
    <ng-container matColumnDef="Naam">
      <th mat-header-cell *matHeaderCellDef> Naam </th>
      <td mat-cell *matCellDef="let element"> {{element.Naam}} </td>
    </ng-container>
    <ng-container matColumnDef="Email">
      <th mat-header-cell *matHeaderCellDef> Email </th>
      <td mat-cell *matCellDef="let element"> {{element.Email}} </td>
    </ng-container>
    <ng-container matColumnDef="Toelichting">
      <th mat-header-cell *matHeaderCellDef> Toeliching </th>
      <td mat-cell *matCellDef="let element"> {{element.ExtraInformatie}} </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  <table>
<!-- </div> -->
`,
styles:[
  `@use "src/mixins.scss" as s
  .mat-column-Naam {
    @include s.mat-text-column-wrap-stuff;
    flex: 0 0 30% !important;
    width: 30% !important;
    }
  .mat-column-Email {
    @include s.mat-text-column-wrap-stuff;
    flex: 0 0 30% !important;
    width: 30% !important;
  }
  .mat-column-Toelichting {
    @include s.mat-text-column-wrap-stuff;
    flex: 0 0 40% !important;
    width: 40% !important;
  }`]
})

export class DisplaySubscriptionsAgendaDetailsComponent extends BaseComponent {

  @Input() inschrijvingsList: InschrijvingItem[] = new Array<InschrijvingItem>();

  displayedColumns: string[] = ['Naam', 'Email', 'Toelichting'];

}
