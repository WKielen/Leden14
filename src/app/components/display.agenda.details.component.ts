import { Component, Input, OnChanges } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { AgendaItem, DoelgroepValues, OrganisatieValues, TypeValues } from "src/app/services/agenda.service";

@Component({
  selector: 'app-display-agenda-details',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <h2>{{agendaItem.EvenementNaam}}</h2>
  <table id="table">
    <tr>
      <td width="25%"></td>
      <td width="75%"></td>
    </tr>
    <tr *ngIf="agendaItem.Type">
      <td>Type:</td>
      <td>{{ type }}</td>
    </tr>
    <tr *ngIf="agendaItem.Tijd">
      <td>Tijd:</td>
      <td>{{ agendaItem.Tijd }}</td>
    </tr>
    <tr *ngIf="agendaItem.Lokatie">
      <td>Lokatie:</td>
      <td>{{ agendaItem.Lokatie }}</td>
    </tr>
    <tr *ngIf="agendaItem.DoelGroep">
      <td>DoelGroep:</td>
      <td>{{ doelGroep }}</td>
    </tr>
    <tr *ngIf="agendaItem.Toelichting">
      <td>Toelichting:</td>
      <td>
        <div [innerHTML]="toelichting"></div>
      </td>
    </tr>
    <tr *ngIf="agendaItem.Inschrijven">
      <td>Inschrijven:</td>
      <td>{{ agendaItem.Inschrijven }}</td>
    </tr>
    <tr *ngIf="agendaItem.Inschrijfgeld !== '0' && agendaItem.Inschrijfgeld !== ''">
      <td>Inschrijfgeld:</td>
      <td>{{ inschrijfGeld }}</td>
    </tr>
    <tr *ngIf="agendaItem.BetaalMethode">
      <td>BetaalMethode:</td>
      <td>{{ agendaItem.BetaalMethode }}</td>
    </tr>
    <tr *ngIf="agendaItem.ContactPersoon">
      <td>ContactPersoon:</td>
      <td>{{ agendaItem.ContactPersoon }}</td>
    </tr>
    <tr *ngIf="agendaItem.Vervoer">
      <td>Vervoer:</td>
      <td>{{ agendaItem.Vervoer }}</td>
    </tr>
    <tr *ngIf="agendaItem.VerzamelAfspraak">
      <td>VerzamelAfspraak:</td>
      <td>{{ agendaItem.VerzamelAfspraak }}</td>
    </tr>
    <tr *ngIf="agendaItem.Extra1">
      <td>Organisatie:</td>
      <td>{{ organisatie }}</td>
    </tr>
  </table>

`
})

export class DisplayAgendaDetailsComponent extends BaseComponent implements OnChanges {

  @Input()
  agendaItem: AgendaItem = new AgendaItem();

  public organisatie: string = '';
  public doelGroep: string = '';
  public type: string = '';
  public inschrijfGeld: string = '';
  public toelichting: string = '';

  ngOnChanges() {
    this.organisatie = OrganisatieValues.GetLabel(this.agendaItem.Extra1);
    this.doelGroep = DoelgroepValues.GetLabel(this.agendaItem.DoelGroep);
    this.type = TypeValues.GetLabel(this.agendaItem.Type);
    this.inschrijfGeld = Number(this.agendaItem.Inschrijfgeld).AmountFormat();
    this.toelichting = this.agendaItem.Toelichting.replace(new RegExp('\n', 'g'), "<br>")
  }
}
