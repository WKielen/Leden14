//
// use as: <app-select-lid-dropdown [leden-array]="ledenLijst" [default-value]="selected" (valueSelected)="onUserSelectedRole($event)"></app-select-lid-dropdown>
//
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-select-lid-dropdown',
  template: `
  <mat-form-field>
    <small class="development" *ngIf="developmentMode">{{ me }}</small>
     <mat-label>Kies een lid</mat-label>
     <mat-select [(value)]="lidNr" (selectionChange)="onChanged($event)">
       <mat-option>None</mat-option>
       <mat-option *ngFor="let Lid of leden" [value]="Lid.LidNr">{{Lid.Voornaam + " " + Lid.Tussenvoegsel + " " + Lid.Achternaam }}</mat-option>
     </mat-select>
  </mat-form-field>
`
})

export class SelectLidDropdownComponent extends BaseComponent {
  @Input('leden-array') leden;
  @Input('default-value') lidNr;
  @Output('valueSelected') valueSelected = new EventEmitter();

  onChanged($event): void {
    this.valueSelected.emit($event.value);;
  }
}
