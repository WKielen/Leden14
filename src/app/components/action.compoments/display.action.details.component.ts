import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../../shared/base.component';
import { ActionItem } from '../../services/action.service';

@Component({
  selector: 'app-display-action-details',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>

  <table class="tablea">
    <tr>
      <td width="25%"></td>
      <td width="75%"></td>
    </tr>
    <tr *ngIf="actionItem.Title">
      <td>Actie:</td>
      <td>{{ actionItem.Title }}</td>
    </tr>
        <tr *ngIf="actionItem.HolderName">
      <td>Door:</td>
      <td>{{ actionItem.HolderName }}</td>
    </tr>
    <tr *ngIf="actionItem.StartDate">
      <td>Opvoer:</td>
      <td>{{ actionItem.StartDate }}</td>
    </tr>
    <tr *ngIf="actionItem.TargetDate && actionItem.TargetDate != '0000-00-00' ">
      <td>Voor:</td>
      <td>{{ actionItem.TargetDate }}</td>
    </tr>
    <tr *ngIf="toelichting">
      <td>Toelichting:</td>
      <td><div [innerHTML]="toelichting"></div></td>
    </tr>
  </table>

`,
  styles: ['td {text-align: left;vertical-align: top;}']
})

export class DisplayActionDetailsComponent extends BaseComponent implements OnInit {

  @Input() public actionItem: ActionItem = new ActionItem();
  
  toelichting: string = '';

  ngOnInit(): void {
    this.toelichting = this.actionItem.Description.replace(new RegExp('\n', 'g'), "<br>")
  }

}
