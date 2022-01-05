import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TypeValues, OrganisatieValues, DoelgroepValues, AgendaItem } from 'src/app/services/agenda.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { FormValueToDutchDateString } from 'src/app/shared/modules/DateRoutines';

@Component({
  selector: 'app-agenda-mutation-form',
  templateUrl: './agenda.mutation.form.component.html',
  styleUrls: ['./agenda.mutation.form.component.scss']
})
export class AgendaMutationFormComponent extends BaseComponent implements OnInit {

  agendaItemForm = new FormGroup({
    datum: new FormControl(
      '',
      [Validators.required]
    ),
    tijd: new FormControl(
      '',
      [Validators.required]
    ),
    evenementnaam: new FormControl(
      '',
      [Validators.required]
    ),
    lokatie: new FormControl(
      '',
      [Validators.required]
    ),
    type: new FormControl(
      '',
      [Validators.required]
    ),
    doelgroep: new FormControl(
      '',
      [Validators.required]
    ),
    toelichting: new FormControl(),
    inschrijven: new FormControl(),
    inschrijfgeld: new FormControl(),
    betaalmethode: new FormControl(),
    contactpersoon: new FormControl(),
    vervoer: new FormControl(),
    verzamelafspraak: new FormControl(),
    organisatie: new FormControl(
      '',
      [Validators.required]
    ),
  });

  typeValues = TypeValues.table;
  OrganisatieValues = OrganisatieValues.table;
  doelgroepValues = DoelgroepValues.table;

  @Input()
  evenement: AgendaItem = {};

  @Output()
  changedEvenement: EventEmitter<AgendaItem> = new EventEmitter<AgendaItem>();

  ngOnInit(): void {
    this.datum.setValue(this.evenement.Datum);
    this.tijd.setValue(this.evenement.Tijd);
    this.evenementnaam.setValue(this.evenement.EvenementNaam);
    this.lokatie.setValue(this.evenement.Lokatie);
    this.type.setValue(this.evenement.Type);
    this.doelgroep.setValue(this.evenement.DoelGroep);
    this.toelichting.setValue(this.evenement.Toelichting);
    this.inschrijven.setValue(this.evenement.Inschrijven);
    this.inschrijfgeld.setValue(this.evenement.Inschrijfgeld);
    this.betaalmethode.setValue(this.evenement.BetaalMethode);
    this.contactpersoon.setValue(this.evenement.ContactPersoon);
    this.vervoer.setValue(this.evenement.Vervoer);
    this.verzamelafspraak.setValue(this.evenement.VerzamelAfspraak);
    this.organisatie.setValue(this.evenement.Extra1);
  }


  /***************************************************************************************************
   / Sluit dialog
   /***************************************************************************************************/
  onSubmit(): void {
    this.evenement.Datum = FormValueToDutchDateString(this.datum.value);
    this.evenement.Tijd = this.tijd.value;
    this.evenement.EvenementNaam = this.evenementnaam.value;
    this.evenement.Lokatie = this.lokatie.value;
    this.evenement.Type = this.type.value;
    this.evenement.DoelGroep = this.doelgroep.value;
    this.evenement.Toelichting = this.toelichting.value;
    this.evenement.Inschrijven = this.inschrijven.value;
    this.evenement.Inschrijfgeld = this.inschrijfgeld.value;
    this.evenement.BetaalMethode = this.betaalmethode.value;
    this.evenement.ContactPersoon = this.contactpersoon.value;
    this.evenement.Vervoer = this.vervoer.value;
    this.evenement.VerzamelAfspraak = this.verzamelafspraak.value;
    this.evenement.Extra1 = this.organisatie.value;
    this.changedEvenement.emit(this.evenement);
    console.log("AgendaMutationFormComponent --> onSubmit --> this.evenement", this.evenement);
  }


  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/

  get datum() {
    return this.agendaItemForm.get('datum');
  }
  get tijd() {
    return this.agendaItemForm.get('tijd');
  }
  get evenementnaam() {
    return this.agendaItemForm.get('evenementnaam');
  }
  get lokatie() {
    return this.agendaItemForm.get('lokatie');
  }
  get type() {
    return this.agendaItemForm.get('type');
  }
  get doelgroep() {
    return this.agendaItemForm.get('doelgroep');
  }
  get toelichting() {
    return this.agendaItemForm.get('toelichting');
  }
  get inschrijven() {
    return this.agendaItemForm.get('inschrijven');
  }
  get inschrijfgeld() {
    return this.agendaItemForm.get('inschrijfgeld');
  }
  get betaalmethode() {
    return this.agendaItemForm.get('betaalmethode');
  }
  get contactpersoon() {
    return this.agendaItemForm.get('contactpersoon');
  }
  get vervoer() {
    return this.agendaItemForm.get('vervoer');
  }
  get verzamelafspraak() {
    return this.agendaItemForm.get('verzamelafspraak');
  }
  get organisatie() {
    return this.agendaItemForm.get('organisatie');
  }

}
